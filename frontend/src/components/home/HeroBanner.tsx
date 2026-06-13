"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Great Indian Festival",
    subtitle: "Up to 60% off on electronics, fashion & more",
    gradient: "from-[#232F3E] via-[#37475A] to-[#131921]",
    accent: "Shop deals",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Discover the latest products across all categories",
    gradient: "from-[#007185] via-[#005F6B] to-[#232F3E]",
    accent: "Explore now",
  },
  {
    id: 3,
    title: "Free Delivery",
    subtitle: "On orders over ₹499 — limited time offer",
    gradient: "from-[#C7511F] via-[#A9441A] to-[#232F3E]",
    accent: "Start shopping",
  },
];

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(interval);
    };
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {HERO_SLIDES.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
              <div
                className={cn(
                  "relative flex h-[200px] items-center bg-gradient-to-r sm:h-[280px] md:h-[320px] lg:h-[400px]",
                  slide.gradient,
                )}
              >
                <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6">
                  <div className="max-w-lg animate-fade-in">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/90 sm:text-base md:text-lg">
                      {slide.subtitle}
                    </p>
                    <span className="mt-4 inline-block rounded-sm bg-[var(--color-accent-yellow)] px-6 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm transition-colors hover:bg-[var(--color-accent-yellow-hover)]">
                      {slide.accent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-white/90 text-[var(--color-text-primary)] shadow-md transition-all hover:bg-white md:left-4"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-white/90 text-[var(--color-text-primary)] shadow-md transition-all hover:bg-white md:right-4"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              "h-2 rounded-full transition-all",
              i === selectedIndex ? "w-6 bg-white" : "w-2 bg-white/50",
            )}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
