"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
      <div className={cn("flex h-80 items-center justify-center bg-gray-100", className)}>
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((url, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <img src={url} alt={`${alt} - ${i + 1}`} className="h-80 w-full object-contain bg-white" />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="mt-2 flex justify-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i === selectedIndex ? "bg-amber-500" : "bg-gray-300",
                )}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
