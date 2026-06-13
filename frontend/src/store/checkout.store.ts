import { create } from "zustand";
import type { CartItem } from "@/types";

interface CheckoutState {
  buyNowItems: CartItem[] | null;
  setBuyNowItems: (items: CartItem[]) => void;
  clearBuyNow: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  buyNowItems: null,
  setBuyNowItems: (items) => set({ buyNowItems: items }),
  clearBuyNow: () => set({ buyNowItems: null }),
}));
