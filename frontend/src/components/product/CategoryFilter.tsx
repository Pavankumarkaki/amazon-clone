"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useMounted } from "@/hooks/useMounted";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
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
      disabled={!mounted}
      className="h-8 cursor-pointer rounded-sm border border-(--color-border) bg-[#F0F2F2] px-3 text-sm text-(--color-text-primary) shadow-sm focus:border-(--color-accent-orange) focus:outline-none focus:ring-1 focus:ring-(--color-accent-orange) disabled:cursor-wait disabled:opacity-70"
      aria-label="Filter by category"
    >
      <option value="">All Categories</option>
      {mounted &&
        categories?.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
    </select>
  );
}
