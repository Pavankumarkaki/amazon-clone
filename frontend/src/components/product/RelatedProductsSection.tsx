"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { PriceTag } from "@/components/product/PriceTag";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/utils";
import type { ProductCard, ProductDetail } from "@/types";

interface RelatedProductsSectionProps {
  product: ProductDetail;
  onAddToCart?: (product: ProductCard) => void;
}

export function RelatedProductsSection({ product, onAddToCart }: RelatedProductsSectionProps) {
  const { data, isLoading } = useProducts({
    category: product.category.slug,
    page_size: 8,
  });

  const related = data?.items.filter((p) => p.id !== product.id).slice(0, 6) ?? [];
  const fbtItems = related.slice(0, 2);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading || related.length === 0) return null;

  const fbtTotal = product.price_cents + fbtItems.reduce((sum, p) => sum + p.price_cents, 0);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <>
      {fbtItems.length >= 2 && (
        <section className="border-t border-[var(--color-border-light,#E7E7E7)] bg-white py-6">
          <div className="mx-auto max-w-[var(--container-max)] px-4">
            <h2 className="text-product-section-heading mb-4">Frequently bought together</h2>

            <div className="flex flex-wrap items-center gap-4">
              <FBTProduct product={product} isMain />
              <span className="text-2xl text-[var(--color-text-muted)]">+</span>
              {fbtItems.map((item, i) => (
                <div key={item.id} className="flex items-center gap-4">
                  <FBTProduct product={item} />
                  {i < fbtItems.length - 1 && (
                    <span className="text-2xl text-[var(--color-text-muted)]">+</span>
                  )}
                </div>
              ))}

              <div className="ml-2 flex flex-col gap-2 border-l border-[var(--color-border)] pl-6">
                <p className="text-sm text-[var(--color-text-primary)]">
                  Total price:{" "}
                  <span className="font-medium">{formatPrice(fbtTotal, product.currency)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart?.(product);
                    fbtItems.forEach((item) => onAddToCart?.(item));
                  }}
                  className="amazon-btn-primary rounded-sm px-4 py-1.5 text-sm"
                >
                  Add all to Cart
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[var(--color-border-light,#E7E7E7)] bg-white py-6">
        <div className="mx-auto max-w-[var(--container-max)] px-4">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-product-section-heading">Customers who viewed this item also viewed</h2>
            <Link href={`/?category=${product.category.slug}`} className="amazon-link text-sm">
              See more
            </Link>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-[var(--color-border)] bg-white shadow-sm hover:bg-[#F7FAFA] md:flex"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-0 overflow-x-auto scroll-smooth border border-[var(--color-border)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group flex w-[180px] shrink-0 flex-col border-r border-[var(--color-border)] bg-white p-3 last:border-r-0 hover:bg-[#FAFAFA]"
                >
                  <div className="flex h-[140px] items-center justify-center">
                    <img
                      src={item.images[0]?.url}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-snug text-[var(--color-text-link)] group-hover:text-[var(--color-text-link-hover)] group-hover:underline">
                    {item.title}
                  </p>
                  <div className="mt-1">
                    <PriceTag cents={item.price_cents} currency={item.currency} size="sm" />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-in-stock)]">FREE Delivery</p>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-[var(--color-border)] bg-white shadow-sm hover:bg-[#F7FAFA] md:flex"
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function FBTProduct({ product, isMain }: { product: ProductCard; isMain?: boolean }) {
  const imageUrl = product.images[0]?.url;

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex w-[120px] flex-col items-center text-center"
    >
      <div className="flex h-[100px] w-[100px] items-center justify-center border border-[var(--color-border)] bg-white p-2">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">No image</span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-link)] hover:underline">
        {isMain ? "This item" : product.title}
      </p>
      <PriceTag cents={product.price_cents} currency={product.currency} size="sm" className="mt-0.5" />
    </Link>
  );
}
