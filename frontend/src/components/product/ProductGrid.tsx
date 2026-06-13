import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductGridProps {
  products: ProductCardType[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export function ProductGrid({ products, isLoading, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  };

  if (isLoading) {
    return (
      <div className={`grid gap-0 divide-x divide-y divide-[var(--color-border)] border border-[var(--color-border)] ${gridCols[columns]}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 bg-white p-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-7 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm bg-white py-16 text-[var(--color-text-secondary)]">
        <p className="text-lg font-medium text-[var(--color-text-primary)]">No products found</p>
        <p className="mt-1 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-0 divide-x divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-white ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
