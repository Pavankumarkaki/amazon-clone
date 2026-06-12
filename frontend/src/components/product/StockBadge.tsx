import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock < 10) {
    return <Badge variant="default">Only {stock} left</Badge>;
  }
  return <Badge variant="success">In Stock</Badge>;
}
