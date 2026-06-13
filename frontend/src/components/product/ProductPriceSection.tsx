import { formatPrice } from "@/lib/utils";
import { getEmiAmount, type ProductPricing } from "@/lib/productPricing";

interface ProductPriceSectionProps {
  pricing: ProductPricing;
  currency: string;
  hasDeal?: boolean;
}

export function ProductPriceSection({ pricing, currency, hasDeal }: ProductPriceSectionProps) {
  const { currentCents, mrpCents, discountPercent, savingsCents } = pricing;
  const emiCents = getEmiAmount(currentCents);

  return (
    <div className="space-y-1">
      {hasDeal && (
        <div className="mb-2 inline-flex items-center gap-2">
          <span className="rounded-sm bg-[var(--color-deal)] px-2 py-0.5 text-xs font-bold text-white">
            Limited time deal
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {discountPercent > 0 && (
          <span className="text-product-price-deal text-[var(--color-deal)]">
            -{discountPercent}%
          </span>
        )}
        <span className="text-product-price">
          {formatPrice(currentCents, currency)}
        </span>
      </div>

      {discountPercent > 0 && (
        <p className="text-product-meta text-[var(--color-text-secondary)]">
          M.R.P.:{" "}
          <span className="line-through">{formatPrice(mrpCents, currency)}</span>
        </p>
      )}

      {savingsCents > 0 && (
        <p className="text-product-meta text-[var(--color-text-secondary)]">
          You Save:{" "}
          <span className="text-[var(--color-deal)]">{formatPrice(savingsCents, currency)}</span>
          {discountPercent > 0 && ` (${discountPercent}%)`}
        </p>
      )}

      <p className="text-product-meta pt-1 text-[var(--color-text-secondary)]">
        Inclusive of all taxes
      </p>

      <p className="text-product-meta pt-2 text-[var(--color-text-primary)]">
        <span className="font-medium">EMI</span> starts at{" "}
        <span className="font-medium">{formatPrice(emiCents, currency)}</span>/month.{" "}
        <button type="button" className="amazon-link text-product-meta">
          No Cost EMI available
        </button>
      </p>
    </div>
  );
}
