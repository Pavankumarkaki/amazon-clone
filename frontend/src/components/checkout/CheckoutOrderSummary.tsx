"use client";

import { DEFAULT_CURRENCY, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency?: string;
}

export function CheckoutOrderSummary({
  items,
  subtotalCents,
  taxCents,
  totalCents,
  currency = DEFAULT_CURRENCY,
}: CheckoutOrderSummaryProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="amazon-card p-5 shadow-(--shadow-card)">
      <h2 className="text-lg font-bold text-(--color-text-primary)">Order Summary</h2>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-(--color-border) bg-white">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain p-1" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-(--color-text-muted)">
                  No image
                </div>
              )}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#232F3E] text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm text-(--color-text-primary)">{item.title}</p>
              <p className="mt-1 text-sm font-medium text-(--color-text-primary)">
                {formatPrice(item.priceCents * item.quantity, item.currency ?? currency)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2 border-t border-(--color-border) pt-4 text-sm text-(--color-text-secondary)">
        <div className="flex justify-between">
          <span>
            Items ({itemCount}):
          </span>
          <span>{formatPrice(subtotalCents, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span className="font-medium text-green-700">FREE</span>
        </div>
        <div className="flex justify-between">
          <span>GST &amp; Taxes:</span>
          <span>{formatPrice(taxCents, currency)}</span>
        </div>
        <div className="flex justify-between border-t border-(--color-border) pt-3 text-base font-bold text-(--color-text-primary)">
          <span>Order Total:</span>
          <span className="text-[22px] text-(--color-deal)">{formatPrice(totalCents, currency)}</span>
        </div>
      </div>
    </div>
  );
}
