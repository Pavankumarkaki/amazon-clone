"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
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
    <Select value={current} onChange={handleChange} className="w-48">
      <option value="">All Categories</option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.slug}>
          {cat.name}
        </option>
      ))}
    </Select>
  );
}
