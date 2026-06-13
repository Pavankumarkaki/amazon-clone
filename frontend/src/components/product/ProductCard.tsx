"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/product/PriceTag";
import { StarRating } from "@/components/product/StarRating";
import { useAddToCart } from "@/hooks/useCart";
import { getProductRating } from "@/lib/productPricing";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();
  const imageUrl = product.images[0]?.url;
  const { rating, count } = getProductRating(product);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }
    try {
      await addToCart.mutateAsync({
        item: {
          productId: product.id,
          title: product.title,
          priceCents: product.price_cents,
          currency: product.currency,
          imageUrl,
          stock: product.stock,
        },
        quantity: 1,
      });
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <article className="group flex h-full flex-col bg-white p-3 transition-shadow hover:shadow-(--shadow-card-hover)">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden bg-white">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
              No image
            </div>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm leading-snug text-(--color-text-primary) group-hover:text-(--color-text-link-hover)">
          {product.title}
        </h3>

        <div className="mt-1.5">
          <StarRating rating={rating} reviewCount={count} />
        </div>

        <div className="mt-1.5">
          <PriceTag cents={product.price_cents} currency={product.currency} size="md" />
        </div>

        {isOutOfStock && (
          <p className="mt-1 text-xs font-medium text-(--color-deal)">Currently unavailable</p>
        )}
      </Link>

      <Button
        variant="amazon"
        size="sm"
        className="mt-3 w-full"
        onClick={handleAddToCart}
        disabled={isOutOfStock || addToCart.isPending}
      >
        Add to Cart
      </Button>
    </article>
  );
}
