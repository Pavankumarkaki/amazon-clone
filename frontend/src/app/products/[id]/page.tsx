"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerReviewsSection } from "@/components/product/CustomerReviewsSection";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductDescriptionSection } from "@/components/product/ProductDescriptionSection";
import { ProductExtendedDetails } from "@/components/product/ProductExtendedDetails";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductInfoPanel } from "@/components/product/ProductInfoPanel";
import { ProductMobileBuyBar } from "@/components/product/ProductMobileBuyBar";
import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";
import { useAddToCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/auth.store";
import { useCheckoutStore } from "@/store/checkout.store";
import type { ProductCard } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const addToCart = useAddToCart();
  const user = useAuthStore((s) => s.user);
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isWishlisted = wishlist?.some((w) => w.product_id === id);

  const addProductToCart = async (item: ProductCard, quantity = 1) => {
    if (item.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    try {
      await addToCart.mutateAsync({
        item: {
          productId: item.id,
          title: item.title,
          priceCents: item.price_cents,
          currency: item.currency,
          imageUrl: item.images[0]?.url,
          stock: item.stock,
        },
        quantity,
      });
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <>
        <ProductBreadcrumb />
        <div className="mx-auto max-w-(--container-max) px-4 py-6">
          <div className="grid gap-8 lg:grid-cols-[646px_1fr_254px]">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="hidden h-96 w-full lg:block" />
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-(--color-text-primary)">Product not found</h1>
        <Button variant="amazon" className="mt-4" onClick={() => router.push("/")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const images = product.images
    .map((img) => img.url)
    .filter((url) => !url.toLowerCase().includes("thumbnail"));

  const handleAddToCart = async (quantity = 1) => {
    await addProductToCart(product, quantity);
    toast.success(quantity > 1 ? `Added ${quantity} items to cart` : "Added to cart");
  };

  const handleBuyNow = (quantity = 1) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    useCheckoutStore.getState().setBuyNowItems([
      {
        productId: product.id,
        title: product.title,
        priceCents: product.price_cents,
        quantity,
        currency: product.currency,
        imageUrl: product.images[0]?.url,
        stock: product.stock,
      },
    ]);
    router.push("/checkout?buyNow=1");
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist.mutateAsync(product.id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist.mutateAsync(product.id);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleRelatedAddToCart = async (item: ProductCard) => {
    await addProductToCart(item);
    toast.success("Added to cart");
  };

  return (
    <>
      <ProductBreadcrumb categorySlug={product.category.slug} productTitle={product.title} />

      <div className="bg-white pb-24 lg:pb-6">
        <div className="mx-auto max-w-(--container-max) px-2 py-4 sm:px-4 lg:py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,646px)_1fr_254px] lg:gap-8">
            <div className="order-1 min-w-0 overflow-visible">
              <ProductImageGallery
                product={product}
                images={images}
                alt={product.title}
                isWishlisted={isWishlisted}
                onToggleWishlist={handleToggleWishlist}
                wishlistLoading={addToWishlist.isPending || removeFromWishlist.isPending}
              />
            </div>

            <div className="order-2 min-w-0">
              <ProductInfoPanel product={product} />
            </div>

            <div className="order-3 min-w-0">
              <div className="hidden lg:block">
                <ProductBuyBox
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAddToList={handleToggleWishlist}
                  isWishlisted={isWishlisted}
                />
              </div>

              <div className="hidden md:block lg:hidden">
                <ProductBuyBox
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAddToList={handleToggleWishlist}
                  isWishlisted={isWishlisted}
                  sticky={false}
                />
              </div>
            </div>
          </div>
        </div>

        <ProductDescriptionSection product={product} />
        <ProductExtendedDetails product={product} />
        <div id="customer-reviews">
          <CustomerReviewsSection product={product} />
        </div>
        <RelatedProductsSection product={product} onAddToCart={handleRelatedAddToCart} />
      </div>

      <ProductMobileBuyBar product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </>
  );
}
