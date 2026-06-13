import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { DEFAULT_CURRENCY } from "@/lib/utils";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { CartItem, ServerCart } from "@/types";
import { serverCartToLocalItems } from "@/types";

export function useServerCart(enabled = true) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: () => apiClient<ServerCart>("/cart"),
    enabled: enabled && !!user,
    retry: false,
  });
}

export function useCartItems(): { items: CartItem[]; isLoading: boolean; isAuthenticated: boolean } {
  const user = useAuthStore((s) => s.user);
  const guestItems = useCartStore((s) => s.items);
  const { data: serverCart, isLoading } = useServerCart();

  if (user) {
    return {
      items: serverCart ? serverCartToLocalItems(serverCart) : [],
      isLoading,
      isAuthenticated: true,
    };
  }

  return { items: guestItems, isLoading: false, isAuthenticated: false };
}

export function useCartTotals() {
  const user = useAuthStore((s) => s.user);
  const guestSubtotal = useCartStore((s) => s.getSubtotalCents());
  const guestCount = useCartStore((s) => s.getItemCount());
  const { data: serverCart, isLoading } = useServerCart();

  if (user) {
    if (serverCart) {
      const itemCount = serverCart.items.reduce((sum, item) => sum + item.quantity, 0);
      return {
        subtotalCents: serverCart.subtotal_cents,
        taxCents: serverCart.tax_cents,
        totalCents: serverCart.total_cents,
        itemCount,
        isLoading,
      };
    }
    return {
      subtotalCents: 0,
      taxCents: 0,
      totalCents: 0,
      itemCount: 0,
      isLoading,
    };
  }

  return {
    subtotalCents: guestSubtotal,
    taxCents: Math.round(guestSubtotal * 0.18),
    totalCents: guestSubtotal + Math.round(guestSubtotal * 0.18),
    itemCount: guestCount,
    isLoading: false,
  };
}

export function useCartCurrency(): string {
  const { items } = useCartItems();
  return items[0]?.currency ?? DEFAULT_CURRENCY;
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addGuestItem = useCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async (payload: { item: Omit<CartItem, "quantity">; quantity: number }) => {
      if (user) {
        return apiClient<ServerCart>("/cart/items", {
          method: "POST",
          body: JSON.stringify({
            product_id: payload.item.productId,
            quantity: payload.quantity,
          }),
        });
      }
      addGuestItem(payload.item, payload.quantity);
      return null;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(queryKeys.cart.all, data);
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setGuestQuantity = useCartStore((s) => s.setQuantity);

  return useMutation({
    mutationFn: async (payload: { item: CartItem; quantity: number }) => {
      if (user && payload.item.id) {
        return apiClient<ServerCart>(`/cart/items/${payload.item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: payload.quantity }),
        });
      }
      setGuestQuantity(payload.item.productId, payload.quantity);
      return null;
    },
    onMutate: async (payload) => {
      if (user) return;
      setGuestQuantity(payload.item.productId, payload.quantity);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(queryKeys.cart.all, data);
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const removeGuestItem = useCartStore((s) => s.removeItem);

  return useMutation({
    mutationFn: async (item: CartItem) => {
      if (user && item.id) {
        return apiClient<ServerCart>(`/cart/items/${item.id}`, { method: "DELETE" });
      }
      removeGuestItem(item.productId);
      return null;
    },
    onMutate: async (item) => {
      if (user) return;
      removeGuestItem(item.productId);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(queryKeys.cart.all, data);
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
  });
}

export async function clearServerCart() {
  return apiClient<ServerCart>("/cart", { method: "DELETE" });
}

export async function mergeGuestCartToServer() {
  const guestItems = useCartStore.getState().items;
  if (guestItems.length === 0) return;

  for (const item of guestItems) {
    try {
      await apiClient<ServerCart>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_id: item.productId, quantity: item.quantity }),
      });
    } catch {
      // continue merging remaining items
    }
  }

  useCartStore.getState().clear();
}
