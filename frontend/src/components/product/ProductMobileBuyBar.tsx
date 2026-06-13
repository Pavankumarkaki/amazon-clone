"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { getProductPricing } from "@/lib/productPricing";
import type { ProductDetail } from "@/types";

interface ProductMobileBuyBarProps {
  product: ProductDetail;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
}

export function ProductMobileBuyBar({ product, onAddToCart, onBuyNow }: ProductMobileBuyBarProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;
  const pricing = getProductPricing(product);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-drawer)] md:hidden">
      <p className="mb-2 text-lg font-normal text-[var(--color-text-primary)]">
        {formatPrice(pricing.currentCents, product.currency)}
        {pricing.discountPercent > 0 && (
          <span className="ml-2 text-sm text-[var(--color-deal)]">-{pricing.discountPercent}%</span>
        )}
      </p>

      <div className="flex items-center gap-2">
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={isOutOfStock}
          className="shrink-0 appearance-none rounded border border-[#888C8C] bg-[#F0F2F2] px-2 py-2.5 text-xs"
          aria-label="Quantity"
        >
          {Array.from({ length: Math.min(product.stock || 10, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Qty: {n}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onAddToCart(quantity)}
          disabled={isOutOfStock}
          className="amazon-btn-primary flex-1 rounded-full py-2.5 text-sm disabled:opacity-50"
        >
          Add to Cart
        </button>

        <button
          type="button"
          onClick={() => onBuyNow(quantity)}
          disabled={isOutOfStock}
          className="flex-1 rounded-full bg-[#FFA41C] py-2.5 text-sm disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
