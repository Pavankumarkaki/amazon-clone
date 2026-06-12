"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";

function ProductListing() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = useProducts({ search, category, page, page_size: 12 });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {data && (
            <p className="text-sm text-gray-500">{data.total} results</p>
          )}
        </div>
        <CategoryFilter />
      </div>
      <ProductGrid products={data?.items || []} isLoading={isLoading} />
      {data && data.total > data.page_size && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(data.total / data.page_size) }).map((_, i) => {
            const pageNum = i + 1;
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(pageNum));
            return (
              <a
                key={pageNum}
                href={`/?${params.toString()}`}
                className={`rounded px-3 py-1 text-sm ${
                  pageNum === page
                    ? "bg-amber-500 font-medium text-black"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<ProductGrid products={[]} isLoading />}>
      <ProductListing />
    </Suspense>
  );
}
