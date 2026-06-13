"use client";

import { ChevronDown, Star } from "lucide-react";
import { StarRating } from "@/components/product/StarRating";
import { getProductBrand, getProductRating, getStarDistribution } from "@/lib/productPricing";
import type { ProductDetail } from "@/types";

interface CustomerReviewsSectionProps {
  product: ProductDetail;
}

export function CustomerReviewsSection({ product }: CustomerReviewsSectionProps) {
  const { rating, count } = getProductRating(product);
  const brand = getProductBrand(product);
  const color = product.specs.Color || product.specs.color;
  const starDistribution = getStarDistribution(rating);
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <section className="border-t border-[#E7E7E7] bg-white py-8">
      <div className="mx-auto grid max-w-(--container-max) gap-10 px-4 lg:grid-cols-[395px_1fr]">
        <div>
          <h2 className="text-xl font-bold">Customer reviews</h2>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < fullStars
                      ? "fill-[#FFA41C] text-[#FFA41C]"
                      : i === fullStars && hasHalf
                        ? "fill-[#FFA41C]/50 text-[#FFA41C]"
                        : "fill-[#E3E6E6] text-[#E3E6E6]"
                  }`}
                />
              ))}
            </div>
            <span className="text-xl">{rating.toFixed(1)} out of 5</span>
          </div>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            {count.toLocaleString("en-IN")} global {count === 1 ? "rating" : "ratings"}
          </p>

          <div className="mt-4 space-y-2">
            {starDistribution.map(({ stars, percent }) => (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-10">{stars} star</span>
                <div className="h-6 flex-1 overflow-hidden rounded-sm bg-[#F0F2F2]">
                  <div className="h-full bg-[#FFA41C]" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-8 text-right">{percent}%</span>
              </div>
            ))}
          </div>

          <button type="button" className="mt-4 flex items-center gap-1 text-sm text-[#1f8394] hover:underline">
            <ChevronDown className="h-3 w-3" />
            How are ratings calculated?
          </button>

          <hr className="my-6 border-[#E7E7E7]" />

          <h3 className="font-bold">Review this product</h3>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Share your thoughts with other customers
          </p>
          <button
            type="button"
            className="mt-3 rounded border border-[#D5D9D9] bg-[#F0F2F2] px-6 py-2 text-sm shadow-sm hover:bg-[#E3E6E6]"
          >
            Write a customer review
          </button>
        </div>

        <div>
          <div className="mb-4 inline-flex rounded border border-[#D5D9D9] bg-[#F0F2F2] px-3 py-1.5 text-xs">
            Top reviews
            <ChevronDown className="ml-1 h-3 w-3" />
          </div>

          <h3 className="text-lg font-bold">Top reviews from India</h3>
          <p className="mt-4 rounded bg-[#F0F2F2] px-4 py-3 text-sm">
            {count > 0
              ? `${count.toLocaleString("en-IN")} customers rated this ${brand} product an average of ${rating.toFixed(1)} stars.`
              : "There are 0 reviews and 0 ratings from India"}
          </p>

          {product.features.length > 0 && (
            <div className="mt-6 space-y-8">
              <article className="border-b border-[#E7E7E7] pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E3E6E6] text-sm font-medium">
                    V
                  </div>
                  <span className="font-medium">Verified Buyer</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRating rating={rating} size="sm" showCount={false} />
                  <span className="text-lg font-medium">Worth the price</span>
                </div>

                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  Reviewed in India · Verified Purchase
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  {color && <span>Colour: {color}</span>}
                  {color && <span className="text-(--color-border)">|</span>}
                  <span>Brand: {brand}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed">{product.features[0]}</p>
                {product.features[1] && (
                  <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                    {product.features[1]}
                  </p>
                )}
              </article>
            </div>
          )}

          <button type="button" className="mt-4 text-sm text-[#1f8394] hover:underline">
            See all reviews
          </button>
        </div>
      </div>
    </section>
  );
}
