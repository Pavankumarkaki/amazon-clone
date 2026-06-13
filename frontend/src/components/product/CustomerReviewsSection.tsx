import { ChevronDown, Star } from "lucide-react";
import { getProductRating } from "@/components/product/StarRating";

interface CustomerReviewsSectionProps {
  productId: string;
}

const MOCK_REVIEWS = [
  {
    author: "Brooke",
    title: "Favorite dress",
    rating: 5,
    date: "Reviewed in the United States on 6 August 2024",
    meta: ["Size: 40", "Color: Black", "Verified Purchase"],
    body: "I initially purchased this dress on sale. It turned out to be my favorite dress of this summer. It is extremely versatile and unexpectedly flattering.",
  },
  {
    author: "Elva S. D.",
    title: "Lindo!!",
    rating: 5,
    date: "Reviewed in the Mexico on 11 August 2023",
    meta: ["Verified Purchase"],
    body: "Bien hecho, bonita tela y bonita caída, fresco y casual. La marca lo dice!!",
  },
  {
    author: "Ana Patricia Rodriguez",
    title: "COMODIDAD",
    rating: 5,
    date: "Reviewed in the United State on 29 June 2023",
    meta: ["Verified Purchase"],
    body: "ES LINDO COMODO Y LIGERO PARA CLIMA CALIDO, ES LA TELA ADECUADA",
  },
];

const STAR_DISTRIBUTION = [
  { stars: 5, percent: 0 },
  { stars: 4, percent: 0 },
  { stars: 3, percent: 0 },
  { stars: 2, percent: 0 },
  { stars: 1, percent: 100 },
];

export function CustomerReviewsSection({ productId }: CustomerReviewsSectionProps) {
  const { rating, count } = getProductRating(productId);

  return (
    <section className="border-t border-[#E7E7E7] bg-white py-8">
      <div className="mx-auto grid max-w-[var(--container-max)] gap-10 px-4 lg:grid-cols-[395px_1fr]">
        <div>
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#FFA41C] text-[#FFA41C]" />
              ))}
            </div>
            <span className="text-xl">{rating} out of 5</span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {count} global {count === 1 ? "rating" : "ratings"}
          </p>

          <div className="mt-4 space-y-2">
            {STAR_DISTRIBUTION.map(({ stars, percent }) => (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-10">{stars} star</span>
                <div className="h-6 flex-1 overflow-hidden rounded-sm bg-[#F0F2F2]">
                  <div
                    className="h-full bg-[#FFA41C]"
                    style={{ width: `${percent}%` }}
                  />
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
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
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

          <h3 className="text-lg font-bold">Top reviews from Saudi Arabia</h3>
          <p className="mt-4 rounded bg-[#F0F2F2] px-4 py-3 text-sm">
            There are 0 reviews and 0 ratings from Saudi Arabia
          </p>

          <h3 className="mt-6 text-lg font-bold">Top reviews from other countries</h3>
          <button
            type="button"
            className="mt-3 rounded border border-[#D5D9D9] bg-white px-4 py-2 text-sm hover:bg-[#F7FAFA]"
          >
            Translate all reviews to English
          </button>

          <div className="mt-6 space-y-8">
            {MOCK_REVIEWS.map((review) => (
              <article key={review.author} className="border-b border-[#E7E7E7] pb-6 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E3E6E6] text-sm font-medium">
                    {review.author.charAt(0)}
                  </div>
                  <span className="font-medium">{review.author}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{review.title}</span>
                </div>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{review.date}</p>

                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  {review.meta.map((item, i) => (
                    <span key={item} className="flex items-center gap-2">
                      {i > 0 && <span className="text-[var(--color-border)]">|</span>}
                      {item}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-sm leading-relaxed">{review.body}</p>
                <button type="button" className="mt-2 text-sm text-[#1f8394] hover:underline">
                  Report
                </button>
              </article>
            ))}
          </div>

          <button type="button" className="mt-4 text-sm text-[#1f8394] hover:underline">
            See all reviews
          </button>
        </div>
      </div>
    </section>
  );
}
