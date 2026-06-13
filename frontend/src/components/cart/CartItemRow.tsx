"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { PriceTag } from "@/components/product/PriceTag";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { setQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 border-b border-[var(--color-border)] bg-white py-5 last:border-b-0">
      <Link
        href={`/products/${item.productId}`}
        className="h-28 w-28 shrink-0 overflow-hidden rounded-sm bg-white p-2 transition-shadow hover:shadow-sm"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-muted)]">
            No img
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.productId}`}
            className="line-clamp-2 text-sm text-(--color-text-primary) hover:text-(--color-text-link-hover) hover:underline"
          >
            {item.title}
          </Link>
          <div className="mt-1">
            <span className="text-xs text-[var(--color-in-stock)]">In Stock</span>
          </div>
          <div className="mt-1">
            <PriceTag cents={item.priceCents} currency={item.currency} size="md" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">Qty:</span>
            <QuantityStepper
              value={item.quantity}
              onChange={(qty) => setQuantity(item.productId, qty)}
            />
          </div>
          <button
            type="button"
            className="text-xs text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] hover:underline"
            onClick={() => removeItem(item.productId)}
          >
            <span className="flex items-center gap-1">
              <Trash2 className="h-3 w-3" />
              Delete
            </span>
          </button>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <PriceTag cents={item.priceCents * item.quantity} currency={item.currency} size="md" />
      </div>
    </div>
  );
}
