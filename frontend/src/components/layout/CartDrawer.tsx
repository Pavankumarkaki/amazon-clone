"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartItems, useCartTotals, useCartCurrency } from "@/hooks/useCart";
import { useUIStore } from "@/store/ui.store";

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const { items } = useCartItems();
  const { subtotalCents, taxCents, totalCents, itemCount } = useCartTotals();
  const currency = useCartCurrency();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-(--shadow-drawer)"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-(--color-border) bg-(--color-header-primary) px-4 py-3 text-white">
          <h2 className="text-lg font-bold">Shopping Cart ({itemCount})</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-sm p-1 transition-colors hover:bg-(--color-header-hover)"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-(--color-text-secondary)">
              <p className="text-lg font-medium text-(--color-text-primary)">Your cart is empty</p>
              <Link href="/" onClick={closeCart} className="amazon-link mt-4 text-sm font-medium">
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.id ?? item.productId} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-(--color-border) bg-[#F0F2F2] p-4">
            <CartSummary
              subtotalCents={subtotalCents}
              taxCents={taxCents}
              totalCents={totalCents}
              itemCount={itemCount}
              currency={currency}
            />
            <Link href="/cart" onClick={closeCart}>
              <Button variant="secondary" className="mt-2 w-full">
                View Full Cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
