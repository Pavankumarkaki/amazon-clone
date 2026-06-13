import type { ProductDetail } from "@/types";

interface ProductDescriptionSectionProps {
  product: ProductDetail;
}

export function ProductDescriptionSection({ product }: ProductDescriptionSectionProps) {
  return (
    <section
      id="product-description"
      className="border-t-[3px] border-(--color-border-light,#E7E7E7) bg-white py-5"
    >
      <div className="mx-auto max-w-(--container-max) px-4">
        <h2 className="text-product-section-heading mb-4">Product description</h2>

        <div className="space-y-6 pl-0 lg:pl-8">
          <p className="whitespace-pre-line text-sm leading-relaxed text-(--color-text-primary)">
            {product.description}
          </p>

          {product.features.length > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold text-(--color-text-primary)">Key features</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-(--color-text-primary)">
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {product.images.length > 1 && (
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              {product.images.slice(1, 3).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={`${product.title} - image ${img.sort_order + 1}`}
                  className="w-full rounded-sm border border-(--color-border) object-contain"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
