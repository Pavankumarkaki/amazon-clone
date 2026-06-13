import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { CartValidateResponse, Order, ShippingAddress } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export function useOrders() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: () => apiClient<Order[]>("/orders"),
    enabled: !!user,
  });
}

export function useOrder(id: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => apiClient<Order>(`/orders/${id}`),
    enabled: !!id && !!user,
  });
}

export function useValidateCart() {
  return useMutation({
    mutationFn: (items: { product_id: string; quantity: number }[]) =>
      apiClient<CartValidateResponse>("/cart/validate", {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      items: { product_id: string; quantity: number }[];
      shipping_address: ShippingAddress;
    }) =>
      apiClient<Order>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
