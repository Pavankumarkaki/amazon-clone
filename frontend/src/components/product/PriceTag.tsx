import { DEFAULT_CURRENCY, formatPrice } from "@/lib/utils";

interface PriceTagProps {
  cents: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCents?: boolean;
}

export function PriceTag({
  cents,
  currency = DEFAULT_CURRENCY,
  className = "",
  size = "md",
  showCents = true,
}: PriceTagProps) {
  const formatted = formatPrice(cents, currency);
  const [dollars, centsPart] = formatted.split(".");

  const sizeClasses = {
    sm: { whole: "text-sm", cents: "text-xs" },
    md: { whole: "text-xl", cents: "text-sm" },
    lg: { whole: "text-3xl", cents: "text-lg" },
  };

  const { whole, cents: centsClass } = sizeClasses[size];

  if (!showCents || !centsPart) {
    return (
      <span className={`font-normal text-(--color-text-primary) ${whole} ${className}`}>
        {formatted}
      </span>
    );
  }

  return (
    <span className={`text-(--color-text-primary) ${className}`}>
      <span className={whole}>{dollars}</span>
      <sup className={`${centsClass} -top-1`}>{centsPart}</sup>
    </span>
  );
}
