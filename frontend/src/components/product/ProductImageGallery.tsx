"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Link2,
  Minus,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types";

interface ProductImageGalleryProps {
  product: ProductDetail;
  images: string[];
  alt: string;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  wishlistLoading?: boolean;
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

export function ProductImageGallery({
  product,
  images,
  alt,
  isWishlisted = false,
  onToggleWishlist,
  wishlistLoading = false,
}: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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
  const shareRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!shareOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shareOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [modalOpen]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = product.title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
      setShareOpen(false);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
      instagram: shareUrl,
    };
    if (platform === "instagram") {
      handleCopyLink();
      toast.info("Link copied — paste it in your Instagram post or story");
      return;
    }
    window.open(links[platform], "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-white text-(--color-text-muted)">
        No image
      </div>
    );
  }

  const currentImage = images[selected];
  const size = product.specs.Size || product.specs.size;
  const color = product.specs.Color || product.specs.color;

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

  const galleryActions = (
    <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={onToggleWishlist}
        disabled={wishlistLoading || !onToggleWishlist}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-white shadow-(--shadow-card) transition-colors hover:bg-[#F7FAFA]",
          isWishlisted && "text-[#C7511F]",
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        title={isWishlisted ? "Wishlisted" : "Add to Wishlist"}
      >
        <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
      </button>

      <div ref={shareRef} className="relative">
        <button
          type="button"
          onClick={() => setShareOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-white shadow-(--shadow-card) transition-colors hover:bg-[#F7FAFA]"
          aria-label="Share product"
          aria-expanded={shareOpen}
        >
          <Share2 className="h-4 w-4" />
        </button>

        {shareOpen && (
          <div className="absolute right-0 top-10 z-20 w-44 rounded border border-(--color-border) bg-white py-1 shadow-(--shadow-drawer)">
            <p className="px-3 py-2 text-xs font-semibold text-(--color-text-primary)">Share Product</p>
            {[
              { id: "facebook", label: "Facebook" },
              { id: "instagram", label: "Instagram" },
              { id: "twitter", label: "X" },
              { id: "email", label: "Email" },
              { id: "copy", label: "Copy Link", icon: Link2 },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => (option.id === "copy" ? handleCopyLink() : handleShare(option.id))}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F0F2F2]"
              >
                {option.icon ? (
                  <option.icon className="h-4 w-4 shrink-0" />
                ) : (
                  <Share2 className="h-4 w-4 shrink-0" />
                )}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-[calc(var(--header-height)+var(--subnav-height)+12px)]">
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
            {galleryActions}
            <div
              className="relative inline-block max-w-full cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={updateImageBounds}
              onClick={() => setModalOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setModalOpen(true);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Open image gallery"
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

        <div className="relative lg:hidden">
          {galleryActions}
          <div className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                className="w-full shrink-0 snap-center"
                onClick={() => {
                  setSelected(i);
                  setModalOpen(true);
                }}
              >
                <img
                  src={url}
                  alt={`${alt} - ${i + 1}`}
                  className="mx-auto h-auto max-h-[400px] w-full object-contain"
                />
              </button>
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

      {modalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <GalleryModal
            product={product}
            images={images}
            selected={selected}
            onSelect={setSelected}
            onClose={() => setModalOpen(false)}
            size={size}
            color={color}
          />,
          document.body,
        )}
    </>
  );
}

interface GalleryModalProps {
  product: ProductDetail;
  images: string[];
  selected: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  size?: string;
  color?: string;
}

function GalleryModal({ product, images, selected, onSelect, onClose, size, color }: GalleryModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const clampZoom = (value: number) => Math.min(4, Math.max(1, value));

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    setZoom((current) => clampZoom(current + (event.deltaY < 0 ? 0.15 : -0.15)));
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (event.clientX - dragStart.current.x),
      y: dragStart.current.panY + (event.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selected]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-[#0F1111]/95 lg:flex-row">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close gallery"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex min-h-[50vh] flex-1 flex-col bg-[#0F1111] lg:min-h-0">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setZoom((current) => clampZoom(current - 0.25))}
            className="rounded border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            <Minus className="inline h-4 w-4" /> Zoom Out
          </button>
          <button
            type="button"
            onClick={() => setZoom((current) => clampZoom(current + 0.25))}
            className="rounded border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            <Plus className="inline h-4 w-4" /> Zoom In
          </button>
          <span className="text-sm text-white/70">{Math.round(zoom * 100)}%</span>
        </div>

        <div
          ref={imageContainerRef}
          className={cn(
            "relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4",
            zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default",
          )}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={images[selected]}
            alt={product.title}
            draggable={false}
            className="max-h-[75vh] max-w-full object-contain transition-transform duration-100 select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          />
        </div>
      </div>

      <div className="w-full overflow-y-auto bg-white p-4 lg:w-[360px] lg:shrink-0 lg:p-6">
        <h2 className="text-lg font-medium text-(--color-text-primary)">{product.title}</h2>
        <p className="mt-1 text-sm text-(--color-text-secondary)">{product.brand}</p>

        {(color || size) && (
          <div className="mt-4 space-y-2 text-sm">
            {color && (
              <p>
                <span className="font-medium">Colour:</span> {color}
              </p>
            )}
            {size && (
              <p>
                <span className="font-medium">Size:</span> {size}
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-(--color-text-primary)">Select an image</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "rounded border p-1 transition-all",
                  index === selected
                    ? "border-amazon-link ring-1 ring-amazon-link"
                    : "border-(--color-border) hover:border-(--color-text-muted)",
                )}
              >
                <img src={url} alt="" className="h-16 w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
