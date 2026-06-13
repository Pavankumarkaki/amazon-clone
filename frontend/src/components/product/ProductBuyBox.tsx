"use client";

import { useState } from "react";
import { ChevronDown, MapPin, ShieldCheck } from "lucide-react";
import { ProductPriceSection } from "@/components/product/ProductPriceSection";
import { StockBadge } from "@/components/product/StockBadge";
import { getProductPricing } from "@/lib/productPricing";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types";

interface ProductBuyBoxProps {
  product: ProductDetail;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
  onAddToList?: () => void;
  sticky?: boolean;
}

export function ProductBuyBox({
  product,
  onAddToCart,
  onBuyNow,
  onAddToList,
  sticky = true,
}: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;
  const deliveryDate = getDeliveryDateRange();
  const pricing = getProductPricing(product.id, product.price_cents);

  return (
    <aside
      className={cn(
        "w-full shrink-0 lg:w-[254px]",
        sticky && "sticky top-[calc(var(--header-height)+var(--subnav-height)+12px)]",
      )}
    >
      <div className="rounded border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
        <ProductPriceSection
          pricing={pricing}
          currency={product.currency}
          hasDeal={pricing.hasDeal}
        />

        <p className="mt-3 text-sm text-[var(--color-text-primary)]">
          FREE delivery{" "}
          <span className="font-semibold">{deliveryDate}</span>
          .{" "}
          <button type="button" className="amazon-link">
            Details
          </button>
        </p>

        <div className="mt-3 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-primary)]" />
          <button type="button" className="amazon-link text-left text-xs leading-snug">
            Deliver to Mumbai 400001
            <br />
            — Update location
          </button>
        </div>

        <div className="mt-3">
          <StockBadge stock={product.stock} />
        </div>

        <div className="relative mt-4">
          <label htmlFor="buybox-quantity" className="sr-only">
            Quantity
          </label>
          <select
            id="buybox-quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={isOutOfStock}
            className="w-full appearance-none rounded border border-[#888C8C] bg-[#F0F2F2] px-3 py-2 pr-8 text-sm shadow-sm focus:border-[var(--color-accent-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-orange)]"
          >
            {Array.from({ length: Math.min(product.stock || 10, 10) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Quantity: {n}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        </div>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => onAddToCart(quantity)}
            disabled={isOutOfStock}
            className="amazon-btn-primary w-full rounded-full py-2 text-sm disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => onBuyNow(quantity)}
            disabled={isOutOfStock}
            className="w-full rounded-full bg-[#FFA41C] py-2.5 text-sm text-[var(--color-text-primary)] shadow-sm transition-colors hover:bg-[#FA8900] disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
          <span className="text-[var(--color-text-secondary)]">Ships from</span>
          <span className="text-[var(--color-text-secondary)]">Amazon Clone</span>
          <span className="text-[var(--color-text-secondary)]">Sold by</span>
          <button type="button" className="amazon-link text-left">
            Amazon Clone
          </button>
          <span className="text-[var(--color-text-secondary)]">Returns</span>
          <button type="button" className="amazon-link text-left">
            10-day replacement
          </button>
          <span className="text-[var(--color-text-secondary)]">Payment</span>
          <button type="button" className="amazon-link flex items-center gap-1 text-left">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure transaction
          </button>
        </div>

        <hr className="my-4 border-[var(--color-border)]" />

        <button
          type="button"
          onClick={onAddToList}
          className="w-full rounded-lg border border-[#D5D9D9] bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-[#F7FAFA]"
        >
          Add to Wish List
        </button>
      </div>
    </aside>
  );
}

function getDeliveryDateRange(): string {
  const start = new Date();
  start.setDate(start.getDate() + 2);
  const end = new Date();
  end.setDate(end.getDate() + 5);
  const month = end.toLocaleDateString("en-IN", { month: "long" });
  return `${start.getDate()}-${end.getDate()} ${month}`;
}
