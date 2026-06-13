"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_CURRENCY, formatPrice } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

interface CartSummaryProps {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  itemCount: number;
  currency?: string;
  showCheckoutButton?: boolean;
}

export function CartSummary({
  subtotalCents,
  taxCents,
  totalCents,
  itemCount,
  currency = DEFAULT_CURRENCY,
  showCheckoutButton = true,
}: CartSummaryProps) {
  const closeCart = useUIStore((s) => s.closeCart);

  return (
    <div className="rounded border border-(--color-border) bg-white p-5 shadow-(--shadow-card)">
      <h2 className="text-lg font-normal text-(--color-text-primary)">
        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):
      </h2>
      <p className="mt-2 text-[28px] text-(--color-deal)">{formatPrice(subtotalCents, currency)}</p>

      <div className="mt-4 space-y-2 border-t border-(--color-border) pt-4 text-sm text-(--color-text-secondary)">
        <div className="flex justify-between">
          <span>Items ({itemCount}):</span>
          <span>{formatPrice(subtotalCents, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated tax:</span>
          <span>{formatPrice(taxCents, currency)}</span>
        </div>
        <div className="flex justify-between border-t border-(--color-border) pt-2 text-base font-bold text-(--color-text-primary)">
          <span>Order Total:</span>
          <span>{formatPrice(totalCents, currency)}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <Link href="/checkout" className="mt-5 block" onClick={closeCart}>
          <Button variant="amazon" className="w-full rounded-full py-6 text-base" size="lg" disabled={itemCount === 0}>
            Proceed to Checkout
          </Button>
        </Link>
      )}

      <p className="mt-3 text-center text-xs text-(--color-text-secondary)">
        The price and availability of items at Amazon Clone are subject to change.
      </p>
    </div>
  );
}
