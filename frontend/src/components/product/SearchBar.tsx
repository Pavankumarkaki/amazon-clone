"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams.toString());
  searchParamsRef.current = searchParams.toString();

  const [query, setQuery] = useState(searchParams.get("search") || "");
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
    params.delete("page");
    router.replace(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <Input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-10 text-black"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
