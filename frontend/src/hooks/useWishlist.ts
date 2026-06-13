import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { CartItem, ServerCart, WishlistItem } from "@/types";

export function useWishlist() {
  return useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: () => apiClient<WishlistItem[]>("/wishlist"),
    retry: false,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiClient<WishlistItem>(`/wishlist/${productId}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiClient(`/wishlist/${productId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
}

export class LoginRequiredError extends Error {
  constructor() {
    super("LOGIN_REQUIRED");
    this.name = "LoginRequiredError";
  }
}

export function useSaveForLater() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (item: CartItem) => {
      if (!user) {
        throw new LoginRequiredError();
      }

      await apiClient<WishlistItem>(`/wishlist/${item.productId}`, { method: "POST" });

      if (item.id) {
        return apiClient<ServerCart>(`/cart/items/${item.id}`, { method: "DELETE" });
      }

      useCartStore.getState().removeItem(item.productId);
      return null;
    },
    onSuccess: (cart) => {
      if (cart) {
        queryClient.setQueryData(queryKeys.cart.all, cart);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
