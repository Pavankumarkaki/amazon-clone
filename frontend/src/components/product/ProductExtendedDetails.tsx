import { Search } from "lucide-react";
import { SpecTable } from "@/components/product/SpecTable";
import { getProductRating, StarRating } from "@/components/product/StarRating";
import type { ProductDetail } from "@/types";

interface ProductExtendedDetailsProps {
  product: ProductDetail;
}

export function ProductExtendedDetails({ product }: ProductExtendedDetailsProps) {
  const { rating, count } = getProductRating(product.id);
  const asin = `B0${product.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const technicalSpecs = getTechnicalSpecs(product.specs);
  const additionalInfo = getAdditionalInfo(product);

  return (
    <>
      <section className="border-t border-[var(--color-border-light,#E7E7E7)] bg-white py-5">
        <div className="mx-auto max-w-[var(--container-max)] px-4">
          <h2 className="text-product-section-heading">Looking for specific info?</h2>
          <div className="mt-4 w-full max-w-xl rounded border border-[#888C8C] px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Search className="h-4 w-4" />
              <span>Search in reviews, Q&amp;A...</span>
            </div>
          </div>
        </div>
      </section>

      {technicalSpecs.length > 0 && (
        <section className="border-t border-[var(--color-border-light,#E7E7E7)] bg-white py-5">
          <div className="mx-auto max-w-[var(--container-max)] px-4">
            <h2 className="text-product-section-heading mb-4">Technical Details</h2>
            <SpecTable specs={Object.fromEntries(technicalSpecs)} />
          </div>
        </section>
      )}

      <section className="border-t border-[var(--color-border-light,#E7E7E7)] bg-white py-5">
        <div className="mx-auto max-w-[var(--container-max)] px-4">
          <h2 className="text-product-section-heading mb-4">Additional Information</h2>
          <SpecTable specs={additionalInfo} />
        </div>
      </section>

      <section className="border-t border-[var(--color-border-light,#E7E7E7)] bg-white py-5">
        <div className="mx-auto max-w-[var(--container-max)] px-4">
          <h2 className="text-product-section-heading mb-4">Product information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-[var(--color-text-secondary)]">ASIN</span>
              <span>{asin}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--color-text-secondary)]">Department</span>
              <span>{product.category.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[var(--color-text-secondary)]">Customer reviews</span>
              <div className="flex items-center gap-2">
                <span>{rating}</span>
                <StarRating rating={rating} reviewCount={count} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function getTechnicalSpecs(specs: Record<string, string>): [string, string][] {
  const priority = [
    "Brand", "brand", "Operating System", "RAM", "CPU", "Processor",
    "Memory", "Storage", "Colour", "Color", "Size", "Weight", "Dimensions",
  ];
  const entries = Object.entries(specs);
  const sorted = entries.sort(([a], [b]) => {
    const ai = priority.findIndex((p) => a.toLowerCase().includes(p.toLowerCase()));
    const bi = priority.findIndex((p) => b.toLowerCase().includes(p.toLowerCase()));
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
  return sorted;
}

function getAdditionalInfo(product: ProductDetail): Record<string, string> {
  const brand = product.specs.Brand || product.specs.brand || product.category.name;
  return {
    Manufacturer: brand,
    "Country of Origin": product.specs["Country of Origin"] || "India",
    "Item Weight": product.specs.Weight || product.specs.weight || "—",
    "Product Dimensions": product.specs.Dimensions || product.specs.dimensions || "—",
    "Date First Available": new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}
