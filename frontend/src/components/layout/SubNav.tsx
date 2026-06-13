"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const QUICK_LINKS = [
  { label: "Today's Deals", href: "/?deals=true" },
  { label: "Customer Service", href: "#" },
  { label: "Registry", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "Sell", href: "#" },
];

export function SubNav() {
  const { data: categories } = useCategories();

  return (
    <nav
      className="bg-[var(--color-header-secondary)] text-white"
      aria-label="Secondary navigation"
    >
      <div className="mx-auto flex h-[var(--subnav-height)] max-w-[var(--container-max)] items-center gap-0 overflow-x-auto px-2 sm:px-4">
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-sm px-2 py-1.5 text-sm font-bold transition-colors hover:outline hover:outline-1 hover:outline-white"
        >
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline">All</span>
        </button>

        {QUICK_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="shrink-0 rounded-sm px-2 py-1.5 text-sm transition-colors hover:outline hover:outline-1 hover:outline-white"
          >
            {link.label}
          </Link>
        ))}

        {categories?.slice(0, 4).map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className="hidden shrink-0 rounded-sm px-2 py-1.5 text-sm transition-colors hover:outline hover:outline-1 hover:outline-white md:inline"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
