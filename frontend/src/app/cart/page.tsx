"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore } from "@/store/cart.store";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotalCents());
  const itemCount = useCartStore((s) => s.getItemCount());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[var(--container-max)] px-4 py-16">
        <div className="flex flex-col items-center justify-center rounded-sm bg-white py-20 shadow-[var(--shadow-card)]">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Your Amazon Clone Cart is empty</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Your shopping cart is waiting. Give it purpose — fill it with products.
          </p>
          <Link href="/">
            <Button variant="amazon" className="mt-6" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-sm bg-white p-4 shadow-[var(--shadow-card)] lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>
        <div className="lg:sticky lg:top-[calc(var(--header-height)+var(--subnav-height)+16px)] lg:self-start">
          <CartSummary subtotalCents={subtotal} itemCount={itemCount} />
        </div>
      </div>
    </div>
  );
}
