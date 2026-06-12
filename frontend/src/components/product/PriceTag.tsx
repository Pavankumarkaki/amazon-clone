import { formatPrice } from "@/lib/utils";

interface PriceTagProps {
  cents: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceTag({ cents, currency = "USD", className = "", size = "md" }: PriceTagProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl font-bold",
  };

  return (
    <span className={`text-amber-700 ${sizeClasses[size]} ${className}`}>
      {formatPrice(cents, currency)}
    </span>
  );
}
