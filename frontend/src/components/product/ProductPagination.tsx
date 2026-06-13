"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPaginationItems } from "@/lib/pagination";
import { usePaginationSiblingCount } from "@/hooks/usePaginationSiblingCount";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

function PageButton({
  href,
  children,
  isActive = false,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-9 shrink-0 items-center justify-center rounded-sm border px-2 text-sm transition-colors",
        isActive
          ? "border-amazon-orange bg-amazon-orange font-bold text-(--color-text-primary)"
          : "border-(--color-border) bg-white text-(--color-text-primary) hover:bg-[#F7FAFA]",
      )}
    >
      {children}
    </Link>
  );
}

export function ProductPagination({ currentPage, totalPages, buildHref }: ProductPaginationProps) {
  const navRef = useRef<HTMLElement>(null);
  const siblingCount = usePaginationSiblingCount(navRef, currentPage, totalPages);

  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages, siblingCount);

  return (
    <nav ref={navRef} className="w-full pb-6" aria-label="Product pagination">
      <div className="mx-auto flex w-full max-w-full items-center justify-center gap-1 overflow-x-auto px-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {currentPage > 1 && (
          <PageButton href={buildHref(currentPage - 1)} ariaLabel="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </PageButton>
        )}

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 min-w-9 shrink-0 items-center justify-center px-1 text-sm text-(--color-text-secondary)"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              href={buildHref(item)}
              isActive={item === currentPage}
              ariaLabel={`Page ${item}`}
            >
              {item}
            </PageButton>
          ),
        )}

        {currentPage < totalPages && (
          <PageButton href={buildHref(currentPage + 1)} ariaLabel="Next page">
            <ChevronRight className="h-4 w-4" />
          </PageButton>
        )}
      </div>
    </nav>
  );
}
