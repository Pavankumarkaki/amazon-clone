"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PriceTag } from "@/components/product/PriceTag";
import { useCartStore } from "@/store/cart.store";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = product.images[0]?.url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) {
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
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-white p-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">No image</div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{product.title}</h3>
          <PriceTag cents={product.price_cents} currency={product.currency} />
          <Button
            className="w-full"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
