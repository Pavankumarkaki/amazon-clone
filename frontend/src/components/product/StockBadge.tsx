interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className="text-sm font-medium text-[var(--color-deal)]">Currently unavailable</span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="text-sm font-medium text-[var(--color-deal)]">
        Only {stock} left in stock - order soon
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-[var(--color-in-stock)]">In Stock</span>
  );
}
