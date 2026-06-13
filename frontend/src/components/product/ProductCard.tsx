"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/product/PriceTag";
import { getProductRating, StarRating } from "@/components/product/StarRating";
import { useCartStore } from "@/store/cart.store";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = product.images[0]?.url;
  const { rating, count } = getProductRating(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      title: product.title,
      priceCents: product.price_cents,
      currency: product.currency,
      imageUrl,
    });
    toast.success("Added to cart");
  };

  return (
    <article className="group flex h-full flex-col bg-white p-3 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden bg-white">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
              No image
            </div>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm leading-snug text-[var(--color-text-primary)] group-hover:text-[var(--color-text-link-hover)]">
          {product.title}
        </h3>

        <div className="mt-1.5">
          <StarRating rating={rating} reviewCount={count} />
        </div>

        <div className="mt-1.5">
          <PriceTag cents={product.price_cents} currency={product.currency} size="md" />
        </div>

        {isOutOfStock && (
          <p className="mt-1 text-xs font-medium text-[var(--color-deal)]">Currently unavailable</p>
        )}
      </Link>

      <Button
        variant="amazon"
        size="sm"
        className="mt-3 w-full"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        Add to Cart
      </Button>
    </article>
  );
}
