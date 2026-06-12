export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params: object) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
};
