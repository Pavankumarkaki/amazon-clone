"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartItems, useCartTotals, useCartCurrency } from "@/hooks/useCart";

export default function CartPage() {
  const { items, isLoading } = useCartItems();
  const { subtotalCents, taxCents, totalCents, itemCount } = useCartTotals();
  const currency = useCartCurrency();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[#E3E6E6]" />
          <div className="h-40 rounded bg-white" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-16">
        <div className="flex flex-col items-center justify-center rounded-sm bg-white py-20 shadow-(--shadow-card)">
          <h1 className="text-2xl font-bold text-(--color-text-primary)">Your Amazon Cart is empty</h1>
          <p className="mt-2 text-(--color-text-secondary)">
            Your shopping cart is waiting. Give it purpose — fill it with products.
          </p>
          <Link href="/">
            <Button variant="amazon" className="mt-6 rounded-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-max) px-2 py-4 sm:px-4 sm:py-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="min-w-0 rounded-sm bg-white px-3 shadow-(--shadow-card) sm:px-5">
          <div className="border-b border-(--color-border) py-4">
            <h1 className="text-2xl font-normal text-(--color-text-primary)">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              Price ({itemCount} {itemCount === 1 ? "item" : "items"})
            </p>
          </div>
          {items.map((item) => (
            <CartItemRow key={item.id ?? item.productId} item={item} />
          ))}
        </div>

        <div className="lg:sticky lg:top-[calc(var(--header-height)+var(--subnav-height)+16px)] lg:self-start">
          <CartSummary
            subtotalCents={subtotalCents}
            taxCents={taxCents}
            totalCents={totalCents}
            itemCount={itemCount}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
