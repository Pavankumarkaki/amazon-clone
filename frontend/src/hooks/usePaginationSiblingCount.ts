import { useEffect, useState } from "react";
import { getPaginationItems } from "@/lib/pagination";

const BUTTON_SLOT_WIDTH = 40;
const NAV_HORIZONTAL_PADDING = 16;

function getSiblingCap(viewportWidth: number): number {
  if (viewportWidth < 640) return 1;
  if (viewportWidth < 1024) return 3;
  return 6;
}

function estimatePaginationWidth(
  itemCount: number,
  showPrev: boolean,
  showNext: boolean,
): number {
  const arrowSlots = (showPrev ? 1 : 0) + (showNext ? 1 : 0);
  return NAV_HORIZONTAL_PADDING + (itemCount + arrowSlots) * BUTTON_SLOT_WIDTH;
}

export function getFittingSiblingCount(
  containerWidth: number,
  currentPage: number,
  totalPages: number,
): number {
  if (containerWidth <= 0 || totalPages <= 1) return 0;

  const showPrev = currentPage > 1;
  const showNext = currentPage < totalPages;
  const cap = getSiblingCap(containerWidth);

  for (let siblingCount = cap; siblingCount >= 0; siblingCount -= 1) {
    const items = getPaginationItems(currentPage, totalPages, siblingCount);
    if (estimatePaginationWidth(items.length, showPrev, showNext) <= containerWidth) {
      return siblingCount;
    }
  }

  return 0;
}

export function usePaginationSiblingCount(
  containerRef: React.RefObject<HTMLElement | null>,
  currentPage: number,
  totalPages: number,
): number {
  const [siblingCount, setSiblingCount] = useState(1);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      const width = element.clientWidth;
      setSiblingCount(getFittingSiblingCount(width, currentPage, totalPages));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef, currentPage, totalPages]);

  return siblingCount;
}
