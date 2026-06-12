import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { PaginatedResponse, ProductCard } from "@/types";

interface ProductFilters {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
  sort?: string;
}

export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.sort) params.set("sort", filters.sort);

  const queryString = params.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => apiClient<PaginatedResponse<ProductCard>>(endpoint),
  });
}
