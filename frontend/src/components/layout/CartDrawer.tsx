"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotalCents());
  const itemCount = useCartStore((s) => s.getItemCount());

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={closeCart} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Shopping Cart ({itemCount})</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <p>Your cart is empty</p>
              <Button variant="link" onClick={closeCart} className="mt-2">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4">
            <CartSummary subtotalCents={subtotal} itemCount={itemCount} />
            <Link href="/cart" onClick={closeCart}>
              <Button variant="outline" className="mt-2 w-full">
                View Full Cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
