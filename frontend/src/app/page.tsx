"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HeroBanner } from "@/components/home/HeroBanner";
import { HomeSection } from "@/components/home/HomeSection";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPagination } from "@/components/product/ProductPagination";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryImages } from "@/hooks/useCategoryImages";
import { useMounted } from "@/hooks/useMounted";
import { getCategoryImage } from "@/lib/categoryImages";

function ProductListing() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const showAllCategories = searchParams.get("categories") === "all";
  const isFiltered = Boolean(search || category);

  const { data, isLoading } = useProducts({ search, category, page, page_size: 12 });
  const { data: categories } = useCategories();
  const categoryImages = useCategoryImages();

  const showCategories = mounted && categories && categories.length > 0;
  const visibleCategories = showAllCategories ? categories : categories?.slice(0, 5);
  const categorySkeletonCount = showAllCategories ? 10 : 4;

  return (
    <>
      {!isFiltered && <HeroBanner />}

      <div className={isFiltered ? "" : "-mt-10  relative z-10 px-2 sm:px-4"}>
        <div className="mx-auto max-w-(--container-max) space-y-4">
          {!isFiltered && (
            <HomeSection
              title="Shop by Category"
              linkText={showAllCategories ? "See less" : "See all"}
              href={showAllCategories ? "/" : "/?categories=all"}
            >
              {showCategories ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  {visibleCategories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/?category=${cat.slug}`}
                      className="group flex flex-col items-center gap-2 rounded-sm p-3 transition-colors hover:bg-[#F7FAFA]"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded-full bg-[#F0F2F2] transition-transform group-hover:scale-105">
                        <img
                          src={getCategoryImage(cat.slug, categoryImages[cat.slug])}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-center text-sm font-medium text-(--color-text-primary) group-hover:text-(--color-text-link-hover)">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: categorySkeletonCount }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3">
                      <div className="h-20 w-20 animate-pulse rounded-full bg-[#F0F2F2]" />
                      <div className="h-4 w-16 animate-pulse rounded bg-[#F0F2F2]" />
                    </div>
                  ))}
                </div>
              )}
            </HomeSection>
          )}

          <HomeSection
            title={isFiltered ? (search ? `Results for "${search}"` : "Filtered Products") : "Today's Deals"}
            noPadding
          >
            <div className="border-b border-(--color-border) px-5 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {mounted && data && (
                    <p className="text-sm text-(--color-text-secondary)">
                      {data.total} results
                      {category && ` in ${category}`}
                    </p>
                  )}
                </div>
                <CategoryFilter />
              </div>
            </div>
            <ProductGrid
              products={mounted ? data?.items || [] : []}
              isLoading={!mounted || isLoading}
            />
          </HomeSection>

          {mounted && data && data.total > data.page_size && (
            <ProductPagination
              currentPage={page}
              totalPages={Math.ceil(data.total / data.page_size)}
              buildHref={(pageNum) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(pageNum));
                return `/?${params.toString()}`;
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<ProductGrid products={[]} isLoading />}>
      <ProductListing />
    </Suspense>
  );
}
