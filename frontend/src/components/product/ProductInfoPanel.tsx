"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { ProductOffersSection } from "@/components/product/ProductOffersSection";
import { ProductPriceSection } from "@/components/product/ProductPriceSection";
import { ProductServiceBadges } from "@/components/product/ProductServiceBadges";
import { getProductRating, StarRating } from "@/components/product/StarRating";
import { getProductPricing, getPurchaseCount } from "@/lib/productPricing";
import type { ProductDetail } from "@/types";

interface ProductInfoPanelProps {
  product: ProductDetail;
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const { rating, count } = getProductRating(product.id);
  const brand = getBrand(product);
  const pricing = getProductPricing(product.id, product.price_cents);
  const purchaseCount = getPurchaseCount(product.id);
  const size = product.specs.Size || product.specs.size;
  const color = product.specs.Color || product.specs.color;
  const aboutBullets = getAboutBullets(product.description);
  const detailSpecs = getDetailSpecs(product.specs);
  const isBestSeller = count > 500;

  return (
    <div className="min-w-0 flex-1 space-y-4 lg:max-w-[680px]">
      {/* 1. Product Title */}
      <h1 className="text-product-title">{product.title}</h1>

      {/* 2. Brand Link */}
      <Link href={`/?category=${product.category.slug}`} className="amazon-link text-sm">
        Visit the {brand} Store
      </Link>

      {/* 3–5. Ratings, Review Count, Purchase Count */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {isBestSeller && (
          <>
            <span className="text-sm font-medium text-[var(--color-text-link)]">
              #1 Best Seller in {product.category.name}
            </span>
            <span className="text-[var(--color-border)]">|</span>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-[var(--color-text-primary)]">{rating}</span>
          <StarRating rating={rating} reviewCount={count} showCount={false} size="md" />
          <ChevronDown className="h-3 w-3 text-[var(--color-text-secondary)]" />
        </div>
        <Link href="#customer-reviews" className="amazon-link text-sm">
          {count.toLocaleString()} ratings
        </Link>
        <span className="text-[var(--color-border)]">|</span>
        <span className="text-sm text-[var(--color-text-secondary)]">{purchaseCount}</span>
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* 6–10. Deal, Price, Discounts, EMI */}
      <ProductPriceSection
        pricing={pricing}
        currency={product.currency}
        hasDeal={pricing.hasDeal}
      />

      {/* 11. Offers Section */}
      <ProductOffersSection />

      {/* Service badges carousel */}
      <ProductServiceBadges />

      {/* Variant selectors */}
      {(size || color) && (
        <div className="space-y-3 pt-1">
          {color && (
            <div>
              <p className="text-sm">
                <span className="font-medium text-[var(--color-text-primary)]">Colour: </span>
                <span>{color}</span>
              </p>
            </div>
          )}
          {size && (
            <div>
              <p className="text-sm">
                <span className="font-medium text-[var(--color-text-primary)]">Size: </span>
                <span>{size}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* 12. Feature Bullets — About this item */}
      <div>
        <h2 className="text-product-section-heading mb-2">About this item</h2>
        <ul className="list-none space-y-2 pl-0">
          {aboutBullets.map((bullet, i) => (
            <li
              key={i}
              className="relative pl-5 text-sm leading-relaxed text-[var(--color-text-primary)] before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-text-primary)]"
            >
              {bullet}
            </li>
          ))}
        </ul>
        <button type="button" className="amazon-link mt-2 flex items-center gap-1 text-sm">
          <ChevronDown className="h-3 w-3" />
          See more product details
        </button>
      </div>

      {/* 13. Product Specifications (inline summary) */}
      {detailSpecs.length > 0 && (
        <div>
          <h2 className="text-product-section-heading mb-3">Product details</h2>
          <div className="overflow-hidden rounded-sm border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <tbody>
                {detailSpecs.slice(0, 5).map(([key, value], i) => (
                  <tr
                    key={key}
                    className={i % 2 === 0 ? "bg-[#F0F2F2]" : "bg-white"}
                  >
                    <th className="w-2/5 px-3 py-2 text-left font-normal text-[var(--color-text-primary)]">
                      {key}
                    </th>
                    <td className="px-3 py-2 text-[var(--color-text-secondary)]">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button type="button" className="amazon-link text-sm">
        Report an issue with this product
      </button>
    </div>
  );
}

function getBrand(product: ProductDetail): string {
  return product.specs.Brand || product.specs.brand || product.category.name;
}

function getAboutBullets(description: string): string[] {
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  return sentences.length > 0 ? sentences.slice(0, 6) : [description];
}

function getDetailSpecs(specs: Record<string, string>): [string, string][] {
  const skip = new Set(["Brand", "brand", "Size", "size", "Color", "color"]);
  return Object.entries(specs).filter(([key]) => !skip.has(key));
}
