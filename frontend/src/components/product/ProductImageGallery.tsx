"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

const LENS_DIVISOR = 2;
const FLYOUT_GAP = 8;
const VIEWPORT_EDGE_MARGIN = 16;
const RIGHT_PART_COVERAGE = 0.95;

interface LensState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageBounds {
  width: number;
  height: number;
}

interface ZoomWindow extends ImageBounds {
  scaleX: number;
  scaleY: number;
  top: number;
  left: number;
}

function calculateZoomWindow(imgRect: DOMRect): ImageBounds {
  const flyoutLeft = imgRect.right + FLYOUT_GAP;
  const rightPartWidth = window.innerWidth - flyoutLeft - VIEWPORT_EDGE_MARGIN;
  const width = Math.max(480, rightPartWidth * RIGHT_PART_COVERAGE);
  const maxHeight = window.innerHeight - imgRect.top - VIEWPORT_EDGE_MARGIN;
  const height = Math.min(maxHeight, Math.max(imgRect.height, 650));
  return { width, height };
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [lens, setLens] = useState<LensState>({ x: 0, y: 0, width: 0, height: 0 });
  const [imageBounds, setImageBounds] = useState<ImageBounds>({ width: 0, height: 0 });
  const [zoomWindow, setZoomWindow] = useState<ZoomWindow>({
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    top: 0,
    left: 0,
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleThumbnailHover = useCallback((index: number) => {
    setSelected(index);
    setIsHovering(false);
  }, []);

  const handleSelectImage = useCallback((index: number) => {
    setSelected(index);
    setIsHovering(false);
  }, []);

  const updateImageBounds = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    setImageBounds({ width: img.offsetWidth, height: img.offsetHeight });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width: imgW, height: imgH } = rect;

    if (x < 0 || y < 0 || x > imgW || y > imgH) {
      setIsHovering(false);
      return;
    }

    setIsHovering(true);

    const lensW = imgW / LENS_DIVISOR;
    const lensH = imgH / LENS_DIVISOR;

    let lensX = x - lensW / 2;
    let lensY = y - lensH / 2;
    lensX = Math.max(0, Math.min(lensX, imgW - lensW));
    lensY = Math.max(0, Math.min(lensY, imgH - lensH));

    const zoom = calculateZoomWindow(rect);
    const scaleX = zoom.width / lensW;
    const scaleY = zoom.height / lensH;

    setLens({ x: lensX, y: lensY, width: lensW, height: lensH });
    setImageBounds({ width: imgW, height: imgH });
    setZoomWindow({
      ...zoom,
      scaleX,
      scaleY,
      top: rect.top,
      left: rect.right + FLYOUT_GAP,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-white text-(--color-text-muted)">
        No image
      </div>
    );
  }

  const currentImage = images[selected];

  const zoomFlyout =
    isHovering && imageBounds.width > 0 && zoomWindow.width > 0 ? (
      <div
        className="pointer-events-none fixed overflow-hidden border border-(--color-border) bg-white shadow-(--shadow-drawer)"
        style={{
          top: zoomWindow.top,
          left: zoomWindow.left,
          width: zoomWindow.width,
          height: zoomWindow.height,
          zIndex: 9999,
          backgroundImage: `url(${currentImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${imageBounds.width * zoomWindow.scaleX}px ${imageBounds.height * zoomWindow.scaleY}px`,
          backgroundPosition: `-${lens.x * zoomWindow.scaleX}px -${lens.y * zoomWindow.scaleY}px`,
        }}
        aria-hidden
      />
    ) : null;

  return (
    <div className="sticky top-[calc(var(--header-height)+var(--subnav-height)+12px)]">
      {/* Desktop gallery with Amazon-style hover zoom */}
      <div className="relative hidden lg:flex lg:gap-4">
        {images.length > 1 && (
          <div className="flex shrink-0 flex-col gap-2 pt-2" role="tablist" aria-label="Product images">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selected}
                onClick={() => handleSelectImage(i)}
                onMouseEnter={() => handleThumbnailHover(i)}
                onFocus={() => handleThumbnailHover(i)}
                className={cn(
                  "rounded p-1 transition-all duration-150",
                  i === selected
                    ? "border-2 border-amazon-link shadow-sm"
                    : "border border-transparent hover:border-(--color-text-muted)",
                )}
                aria-label={`View image ${i + 1}`}
              >
                <img src={url} alt="" className="h-[50px] w-[38px] object-contain" />
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-0 flex-1">
          <div
            className="relative inline-block max-w-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={updateImageBounds}
          >
            <img
              ref={imageRef}
              src={currentImage}
              alt={`${alt} - ${selected + 1}`}
              className="h-auto max-h-[575px] w-full object-contain"
              onLoad={updateImageBounds}
            />

            {isHovering && imageBounds.width > 0 && (
              <div
                className="pointer-events-none absolute amazon-zoom-lens"
                style={{
                  left: lens.x,
                  top: lens.y,
                  width: lens.width,
                  height: lens.height,
                }}
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>

      {typeof document !== "undefined" && zoomFlyout && createPortal(zoomFlyout, document.body)}

      {/* Mobile swipeable gallery */}
      <div className="lg:hidden">
        <div className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {images.map((url, i) => (
            <div key={i} className="w-full shrink-0 snap-center">
              <img
                src={url}
                alt={`${alt} - ${i + 1}`}
                className="mx-auto h-auto max-h-[400px] w-full object-contain"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === selected ? "w-4 bg-(--color-text-primary)" : "w-1.5 bg-[#C6C6C6]",
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
