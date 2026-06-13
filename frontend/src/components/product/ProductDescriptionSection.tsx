import type { ProductDetail } from "@/types";

interface ProductDescriptionSectionProps {
  product: ProductDetail;
}

export function ProductDescriptionSection({ product }: ProductDescriptionSectionProps) {
  const paragraphs = product.description.split(/\n\n+/).filter(Boolean);
  const sections = paragraphs.length > 1 ? paragraphs : splitIntoSections(product.description);

  return (
    <section className="border-t-[3px] border-[var(--color-border-light,#E7E7E7)] bg-white py-5">
      <div className="mx-auto max-w-[var(--container-max)] px-4">
        <h2 className="text-product-section-heading mb-4">Product description</h2>

        <div className="space-y-6 pl-0 lg:pl-8">
          {sections.map((section, i) => (
            <div key={i}>
              {sections.length > 1 && (
                <h3 className="mb-2 text-base font-bold text-[var(--color-text-primary)]">
                  {getSectionHeading(i)}
                </h3>
              )}
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-primary)]">
                {section}
              </p>
            </div>
          ))}

          {product.images.length > 1 && (
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              {product.images.slice(1, 3).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="w-full rounded-sm border border-[var(--color-border)] object-contain"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function splitIntoSections(description: string): string[] {
  const sentences = description.match(/[^.!?]+[.!?]+/g) ?? [description];
  if (sentences.length <= 3) return [description];

  const mid = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, mid).join(" ").trim(),
    sentences.slice(mid).join(" ").trim(),
  ];
}

function getSectionHeading(index: number): string {
  const headings = ["Overview", "Features & Benefits", "Additional Details"];
  return headings[index] ?? `Section ${index + 1}`;
}
