"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  { id: 1, title: "Great Indian Festival", bannerImage: "/Header-PCa.jpg" },
  { id: 2, title: "New Arrivals", bannerImage: "/electronics.jpg" },
  { id: 3, title: "Free Delivery", bannerImage: "/free-delivery.png" },
];

const BANNER_HEIGHT =
  "h-[180px] sm:h-[280px] md:h-[320px] lg:h-[400px]";

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
    <div className={cn("relative w-full", BANNER_HEIGHT)}>
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative flex h-full min-w-0 flex-[0_0_100%] items-center justify-center bg-amazon-header"
            >
              <img
                src={slide.bannerImage}
                alt={slide.title}
                draggable={false}
                className="h-full w-full object-fill object-center"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm bg-white/90 text-(--color-text-primary) shadow-md transition-all hover:bg-white sm:flex md:left-4 md:h-10 md:w-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm bg-white/90 text-(--color-text-primary) shadow-md transition-all hover:bg-white sm:flex md:right-4 md:h-10 md:w-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-3 sm:gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              "h-1.5 rounded-full transition-all sm:h-2",
              i === selectedIndex ? "w-5 bg-white sm:w-6" : "w-1.5 bg-white/50 sm:w-2",
            )}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
