"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { useMounted } from "@/hooks/useMounted";

interface ProductBreadcrumbProps {
  categorySlug?: string;
  productTitle?: string;
}

export function ProductBreadcrumb({ categorySlug, productTitle }: ProductBreadcrumbProps) {
  const mounted = useMounted();
  const { data: categories } = useCategories();
  const category = mounted ? categories?.find((c) => c.slug === categorySlug) : undefined;

  const crumbs = [
    { label: "Home", href: "/" },
    ...(category ? [{ label: category.name, href: `/?category=${category.slug}` }] : []),
    ...(productTitle
      ? [{ label: truncateTitle(productTitle), href: undefined as string | undefined }]
      : []),
  ];

  return (
    <nav aria-label="Product breadcrumb" className="border-b border-[var(--color-border-light,#E7E7E7)] bg-white">
      <ol className="mx-auto flex max-w-[var(--container-max)] flex-wrap items-center gap-1 px-4 py-2 text-xs text-[var(--color-text-secondary)]">
        {crumbs.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
            )}
            {crumb.href ? (
              <Link href={crumb.href} className="amazon-link hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--color-text-primary)]" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function truncateTitle(title: string, max = 60): string {
  if (title.length <= max) return title;
  return `${title.slice(0, max).trim()}…`;
}
