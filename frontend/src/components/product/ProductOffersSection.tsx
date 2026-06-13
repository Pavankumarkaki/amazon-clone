"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Offer {
  title: string;
  description: string;
  count: number;
}

const DEFAULT_OFFERS: Offer[] = [
  {
    title: "No Cost EMI",
    description: "EMI interest savings on select Credit Cards, Pay Later options",
    count: 3,
  },
  {
    title: "Bank Offer",
    description: "Discount on select Credit Cards and Debit Cards",
    count: 2,
  },
  {
    title: "Cashback",
    description: "Cashback as store balance when you pay with partner bank cards",
    count: 1,
  },
  {
    title: "Exchange Offer",
    description: "Get up to exchange value on your old device",
    count: 2,
  },
];

interface ProductOffersSectionProps {
  offers?: Offer[];
  className?: string;
}

export function ProductOffersSection({ offers = DEFAULT_OFFERS, className }: ProductOffersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-product-section-heading">Offers</h3>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-sm hover:bg-[#F7FAFA] lg:flex"
          aria-label="Previous offers"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {offers.map((offer) => (
            <button
              key={offer.title}
              type="button"
              className="group flex min-w-[220px] max-w-[240px] shrink-0 flex-col rounded border border-[var(--color-border)] bg-white p-3 text-left transition-colors hover:border-[#C7511F] hover:bg-[#FAFAFA]"
            >
              <span className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-link-hover)]">
                {offer.title}
              </span>
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {offer.description}
              </span>
              <span className="mt-2 text-xs text-[var(--color-text-link)] group-hover:underline">
                {offer.count} {offer.count === 1 ? "offer" : "offers"}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-sm hover:bg-[#F7FAFA] lg:flex"
          aria-label="Next offers"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
