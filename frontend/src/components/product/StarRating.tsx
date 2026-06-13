import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

export function getProductRating(productId: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = productId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 3.5 + (Math.abs(hash) % 15) / 10;
  const count = 50 + (Math.abs(hash) % 9950);
  return { rating: Math.round(rating * 10) / 10, count };
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className,
}: StarRatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < fullStars
                ? "fill-[#FFA41C] text-[#FFA41C]"
                : i === fullStars && hasHalf
                  ? "fill-[#FFA41C]/50 text-[#FFA41C]"
                  : "fill-[#E3E6E6] text-[#E3E6E6]",
            )}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] hover:underline">
          {reviewCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}
