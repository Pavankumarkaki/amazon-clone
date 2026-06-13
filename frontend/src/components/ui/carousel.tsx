"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function Carousel({ images, alt, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!images.length) {
    return (
      <div className={cn("flex aspect-square items-center justify-center bg-[#F7FAFA]", className)}>
        <span className="text-[var(--color-text-muted)]">No image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden rounded-sm border border-[var(--color-border)]" ref={emblaRef}>
        <div className="flex">
          {images.map((url, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <img
                src={url}
                alt={`${alt} - ${i + 1}`}
                className="aspect-square w-full object-contain bg-white p-4"
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-white/90 text-[var(--color-text-primary)] shadow-md transition-all hover:bg-white"
            onClick={scrollPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-white/90 text-[var(--color-text-primary)] shadow-md transition-all hover:bg-white"
            onClick={scrollNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-3 flex justify-center gap-2">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "h-12 w-12 overflow-hidden rounded-sm border-2 transition-colors",
                  i === selectedIndex
                    ? "border-[var(--color-accent-orange)]"
                    : "border-[var(--color-border)] hover:border-[#888C8C]",
                )}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={url} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
