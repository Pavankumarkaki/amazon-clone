"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { ProductOffersSection } from "@/components/product/ProductOffersSection";
import { ProductPriceSection } from "@/components/product/ProductPriceSection";
import { ProductServiceBadges } from "@/components/product/ProductServiceBadges";
import { StarRating } from "@/components/product/StarRating";
import {
  getAboutBullets,
  getProductBrand,
  getProductPricing,
  getProductRating,
  getPurchaseCount,
} from "@/lib/productPricing";
import type { ProductDetail } from "@/types";

interface ProductInfoPanelProps {
  product: ProductDetail;
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const { rating, count } = getProductRating(product);
  const brand = getProductBrand(product);
  const pricing = getProductPricing(product);
  const purchaseCount = getPurchaseCount(product);
  const color = product.specs.Color || product.specs.color;
  const size = product.specs.Size || product.specs.size;
  const aboutBullets = getAboutBullets(product);
  const detailSpecs = getDetailSpecs(product.specs);
  const isBestSeller = count > 5000;

  return (
    <div className="min-w-0 flex-1 space-y-4 lg:max-w-[680px]">
      <h1 className="text-product-title">{product.title}</h1>

      <Link href={`/?search=${encodeURIComponent(brand)}`} className="amazon-link text-sm">
        Visit the {brand} Store
      </Link>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {isBestSeller && (
          <>
            <span className="text-sm font-medium text-(--color-text-link)">
              #1 Best Seller in {product.category.name}
            </span>
            <span className="text-(--color-border)">|</span>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-(--color-text-primary)">{rating.toFixed(1)}</span>
          <StarRating rating={rating} reviewCount={count} showCount={false} size="md" />
          <ChevronDown className="h-3 w-3 text-(--color-text-secondary)" />
        </div>
        <Link href="#customer-reviews" className="amazon-link text-sm">
          {count.toLocaleString("en-IN")} ratings
        </Link>
        <span className="text-(--color-border)">|</span>
        <span className="text-sm text-(--color-text-secondary)">{purchaseCount}</span>
      </div>

      <hr className="border-(--color-border)" />

      <ProductPriceSection
        pricing={pricing}
        currency={product.currency}
        hasDeal={pricing.hasDeal}
      />

      <ProductOffersSection />
      <ProductServiceBadges />

      {(size || color) && (
        <div className="space-y-3 pt-1">
          {color && (
            <p className="text-sm">
              <span className="font-medium text-(--color-text-primary)">Colour: </span>
              <span>{color}</span>
            </p>
          )}
          {size && (
            <p className="text-sm">
              <span className="font-medium text-(--color-text-primary)">Size: </span>
              <span>{size}</span>
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-product-section-heading mb-2">About this item</h2>
        <ul className="list-none space-y-2 pl-0">
          {aboutBullets.map((bullet) => (
            <li
              key={bullet}
              className="relative pl-5 text-sm leading-relaxed text-(--color-text-primary) before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-(--color-text-primary)"
            >
              {bullet}
            </li>
          ))}
        </ul>
        <a href="#product-description" className="amazon-link mt-2 flex items-center gap-1 text-sm">
          <ChevronDown className="h-3 w-3" />
          See more product details
        </a>
      </div>

      {detailSpecs.length > 0 && (
        <div>
          <h2 className="text-product-section-heading mb-3">Product details</h2>
          <div className="overflow-hidden rounded-sm border border-(--color-border)">
            <table className="w-full text-sm">
              <tbody>
                {detailSpecs.slice(0, 5).map(([key, value], i) => (
                  <tr key={key} className={i % 2 === 0 ? "bg-[#F0F2F2]" : "bg-white"}>
                    <th className="w-2/5 px-3 py-2 text-left font-normal text-(--color-text-primary)">
                      {key}
                    </th>
                    <td className="px-3 py-2 text-(--color-text-secondary)">{value}</td>
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

function getDetailSpecs(specs: Record<string, string>): [string, string][] {
  const skip = new Set(["Brand", "brand", "Size", "size", "Color", "color"]);
  return Object.entries(specs).filter(([key]) => !skip.has(key));
}
