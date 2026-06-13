"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useCategories } from "@/hooks/useCategories";
import { useMounted } from "@/hooks/useMounted";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams.toString());
  searchParamsRef.current = searchParams.toString();
  const mounted = useMounted();
  const { data: categories } = useCategories();

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [debouncedQuery] = useDebounce(query, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsRef.current);
    const currentSearch = params.get("search") || "";

    if (debouncedQuery === currentSearch) return;

    if (debouncedQuery) {
      params.set("search", debouncedQuery);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.replace(`/?${params.toString()}`);
  }, [debouncedQuery, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParamsRef.current);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.replace(`/?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value);
    const params = new URLSearchParams(searchParamsRef.current);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.replace(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-(--search-height) w-full min-w-0 max-w-full">
      <select
        value={category}
        onChange={handleCategoryChange}
        className="hidden h-full shrink-0 cursor-pointer rounded-l-sm border-0 bg-[#dadada] px-3 py-1 text-xs text-(--color-text-primary) focus:outline-none md:block md:max-w-[140px] md:px-5 md:text-sm"
        aria-label="Search category"
      >
        <option value="">All</option>
        {mounted &&
          categories?.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
      </select>

      <input
        type="search"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-full min-w-0 flex-1 basis-0 rounded-l-sm border-0 bg-[#ffffff] px-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) sm:px-3 md:rounded-none"
        aria-label="Search products"
      />

      <button
        type="submit"
        className="flex h-full w-10 shrink-0 items-center justify-center rounded-r-sm bg-amazon-orange transition-colors hover:bg-(--color-accent-orange-hover) focus:outline focus:outline-white sm:w-11"
        aria-label="Search"
      >
        <Search className="h-5 w-5 text-(--color-text-primary)" />
      </button>
    </form>
  );
}
