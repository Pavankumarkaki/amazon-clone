"use client";

import { ChevronLeft, ChevronRight, CreditCard, Package, RotateCcw, Shield, Truck } from "lucide-react";
import { useRef } from "react";

const SERVICE_BADGES = [
  { icon: RotateCcw, label: "10 days Returnable" },
  { icon: Truck, label: "Free Delivery" },
  { icon: Shield, label: "1 Year Warranty" },
  { icon: CreditCard, label: "Pay on Delivery" },
  { icon: Package, label: "Top Brand" },
  { icon: Shield, label: "Secure transaction" },
];

export function ProductServiceBadges() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="relative border-y border-[var(--color-border)] py-4">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute -left-1 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-sm hover:bg-[#F7FAFA] sm:flex"
        aria-label="Previous services"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SERVICE_BADGES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
          >
            <Icon className="h-9 w-9 text-[var(--color-text-link)]" strokeWidth={1.5} />
            <span className="text-xs leading-snug text-[var(--color-text-link)]">{label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute -right-1 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-sm hover:bg-[#F7FAFA] sm:flex"
        aria-label="Next services"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
