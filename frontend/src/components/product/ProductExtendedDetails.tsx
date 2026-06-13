import { Search } from "lucide-react";
import { SpecTable } from "@/components/product/SpecTable";
import { StarRating } from "@/components/product/StarRating";
import { getProductBrand, getProductRating } from "@/lib/productPricing";
import type { ProductDetail } from "@/types";

interface ProductExtendedDetailsProps {
  product: ProductDetail;
}

export function ProductExtendedDetails({ product }: ProductExtendedDetailsProps) {
  const { rating, count } = getProductRating(product);
  const brand = getProductBrand(product);
  const asin = `B0${product.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const additionalInfo = getAdditionalInfo(product, brand);

  return (
    <>
      <section className="border-t border-(--color-border-light,#E7E7E7) bg-white py-5">
        <div className="mx-auto max-w-(--container-max) px-4">
          <h2 className="text-product-section-heading">Looking for specific info?</h2>
          <div className="mt-4 w-full max-w-xl rounded border border-[#888C8C] px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
              <Search className="h-4 w-4" />
              <span>Search in reviews, Q&amp;A...</span>
            </div>
          </div>
        </div>
      </section>

      {Object.keys(product.specs).length > 0 && (
        <section className="border-t border-(--color-border-light,#E7E7E7) bg-white py-5">
          <div className="mx-auto max-w-(--container-max) px-4">
            <h2 className="text-product-section-heading mb-4">Technical Details</h2>
            <SpecTable specs={product.specs} />
          </div>
        </section>
      )}

      <section className="border-t border-(--color-border-light,#E7E7E7) bg-white py-5">
        <div className="mx-auto max-w-(--container-max) px-4">
          <h2 className="text-product-section-heading mb-4">Additional Information</h2>
          <SpecTable specs={additionalInfo} />
        </div>
      </section>

      <section className="border-t border-(--color-border-light,#E7E7E7) bg-white py-5">
        <div className="mx-auto max-w-(--container-max) px-4">
          <h2 className="text-product-section-heading mb-4">Product information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-(--color-text-secondary)">ASIN</span>
              <span>{asin}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-(--color-text-secondary)">Brand</span>
              <span>{brand}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-(--color-text-secondary)">Department</span>
              <span>{product.category.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-(--color-text-secondary)">Customer reviews</span>
              <div className="flex items-center gap-2">
                <span>{rating.toFixed(1)}</span>
                <StarRating rating={rating} reviewCount={count} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function getAdditionalInfo(product: ProductDetail, brand: string): Record<string, string> {
  const info: Record<string, string> = {
    Manufacturer: brand,
    "Country of Origin": product.specs["Country of Origin"] || "India",
  };

  const optionalFields = [
    "Warranty",
    "Voltage",
    "Energy Rating",
    "Weight",
    "Dimensions",
    "Material",
  ] as const;

  for (const field of optionalFields) {
    const value = product.specs[field] || product.specs[field.toLowerCase()];
    if (value) {
      info[field] = value;
    }
  }

  return info;
}
