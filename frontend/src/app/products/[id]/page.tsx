"use client";

import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel } from "@/components/ui/carousel";
import { PriceTag } from "@/components/product/PriceTag";
import { SpecTable } from "@/components/product/SpecTable";
import { StockBadge } from "@/components/product/StockBadge";
import { useProduct } from "@/hooks/useProduct";
import { useAddToWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();

  const isWishlisted = wishlist?.some((w) => w.product_id === id);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const images = product.images.map((img) => img.url);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      title: product.title,
      priceCents: product.price_cents,
      currency: product.currency,
      imageUrl: images[0],
    });
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await addToWishlist.mutateAsync(product.id);
      toast.success("Added to wishlist");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Carousel images={images} alt={product.title} />
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500">{product.category.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <PriceTag cents={product.price_cents} currency={product.currency} size="lg" />
            <StockBadge stock={product.stock} />
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock <= 0}>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow} disabled={product.stock <= 0}>
            <Zap className="h-5 w-5" />
            Buy Now
          </Button>
          {user && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlist}
              disabled={isWishlisted || addToWishlist.isPending}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          )}
        </div>
        {Object.keys(product.specs).length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Specifications</h2>
            <SpecTable specs={product.specs} />
          </div>
        )}
      </div>
    </div>
  );
}
