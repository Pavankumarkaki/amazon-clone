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
import { useProduct } from "@/hooks/useProduct";
import { useAddToWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { ProductCard } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();

  const isWishlisted = wishlist?.some((w) => w.product_id === id);

  const addProductToCart = (item: ProductCard, quantity = 1) => {
    if (item.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem(
      {
        productId: item.id,
        title: item.title,
        priceCents: item.price_cents,
        currency: item.currency,
        imageUrl: item.images[0]?.url,
      },
      quantity,
    );
  };

  if (isLoading) {
    return (
      <>
        <ProductBreadcrumb />
        <div className="mx-auto max-w-[var(--container-max)] px-4 py-6">
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
      <div className="mx-auto max-w-[var(--container-max)] px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Product not found</h1>
        <Button variant="amazon" className="mt-4" onClick={() => router.push("/")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const images = product.images.map((img) => img.url);

  const handleAddToCart = (quantity = 1) => {
    addProductToCart(product, quantity);
    toast.success(quantity > 1 ? `Added ${quantity} items to cart` : "Added to cart");
  };

  const handleBuyNow = (quantity = 1) => {
    handleAddToCart(quantity);
    router.push("/checkout");
  };

  const handleAddToList = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (isWishlisted) {
      toast.info("Already in your wishlist");
      return;
    }
    try {
      await addToWishlist.mutateAsync(product.id);
      toast.success("Added to list");
    } catch {
      toast.error("Failed to add to list");
    }
  };

  const handleRelatedAddToCart = (item: ProductCard) => {
    addProductToCart(item);
    toast.success("Added to cart");
  };

  return (
    <>
      <ProductBreadcrumb categorySlug={product.category.slug} productTitle={product.title} />

      <div className="bg-white pb-24 lg:pb-6">
        <div className="mx-auto max-w-[var(--container-max)] px-4 py-4 lg:py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[646px_1fr_254px] lg:gap-8">
            <div className="order-1 overflow-visible">
              <ProductImageGallery images={images} alt={product.title} />
            </div>

            <div className="order-2">
              <ProductInfoPanel product={product} />
            </div>

            <div className="order-3">
              <div className="hidden lg:block">
                <ProductBuyBox
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAddToList={handleAddToList}
                />
              </div>

              <div className="hidden md:block lg:hidden">
                <ProductBuyBox
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAddToList={handleAddToList}
                  sticky={false}
                />
              </div>
            </div>
          </div>
        </div>

        <ProductDescriptionSection product={product} />
        <ProductExtendedDetails product={product} />
        <div id="customer-reviews">
          <CustomerReviewsSection productId={product.id} />
        </div>
        <RelatedProductsSection product={product} onAddToCart={handleRelatedAddToCart} />
      </div>

      <ProductMobileBuyBar
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </>
  );
}
