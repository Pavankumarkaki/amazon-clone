"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();
  const current = searchParams.get("category") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("category", e.target.value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="h-8 cursor-pointer rounded-sm border border-[var(--color-border)] bg-[#F0F2F2] px-3 text-sm text-[var(--color-text-primary)] shadow-sm focus:border-[var(--color-accent-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-orange)]"
      aria-label="Filter by category"
    >
      <option value="">All Categories</option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.slug}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
