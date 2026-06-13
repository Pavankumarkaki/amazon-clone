"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { MapPin, ShoppingCart } from "lucide-react";
import { SearchBar } from "@/components/product/SearchBar";
import { useCartTotals } from "@/hooks/useCart";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCartTotals();
  const openCart = useUIStore((s) => s.openCart);
  const user = useAuthStore((s) => s.user);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-amazon-header text-white">
      <div className="mx-auto flex max-w-(--container-max) flex-wrap items-center gap-x-2 gap-y-2 px-2 py-2 sm:gap-x-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-sm p-1 transition-colors hover:outline hover:outline-white"
          aria-label="Amazon Clone Home"
        >
          <Image
            src="/logo.svg"
            alt="Amazon"
            width={100}
            height={30}
            className="h-[30px] w-[100px] object-contain object-left"
            priority
          />
        </Link>

        <button
          type="button"
          className="hidden shrink-0 rounded-sm px-2 py-1 text-left transition-colors hover:outline hover:outline-white sm:flex"
        >
          <div className="flex items-start gap-1">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="leading-tight">
              <span className="block text-[11px] text-[#CCC]">Deliver to</span>
              <span className="block text-sm font-bold">India</span>
            </div>
          </div>
        </button>

        <div className="order-3 w-full min-w-0 flex-1 sm:order-0">
          <Suspense
            fallback={
              <div className="h-(--search-height) w-full rounded-sm bg-amazon-subnav" />
            }
          >
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          {user ? (
            <>
              <Link
                href="/orders"
                className="hidden rounded-sm px-2 py-1 transition-colors hover:outline hover:outline-white lg:block"
              >
                <span className="block text-[11px]">Returns</span>
                <span className="block text-sm font-bold">&amp; Orders</span>
              </Link>
              <Link
                href="/wishlist"
                className="hidden rounded-sm px-2 py-1 transition-colors hover:outline hover:outline-white md:block"
              >
                <span className="block text-[11px]">Your</span>
                <span className="block text-sm font-bold">Wishlist</span>
              </Link>
              <Link
                href="/orders"
                className="rounded-sm px-2 py-1 transition-colors hover:outline-1 hover:outline-white"
              >
                <span className="block text-[11px]">Hello, {user.full_name.split(" ")[0]}</span>
                <span className="block text-sm font-bold">Account &amp; Lists</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-sm px-2 py-1 transition-colors hover:outline hover:outline-white"
            >
              <span className="block text-[11px]">Hello, sign in</span>
              <span className="block text-sm font-bold">Account &amp; Lists</span>
            </Link>
          )}

          <button
            type="button"
            className="relative flex items-end gap-1 rounded-sm px-2 py-1 transition-colors hover:outline  hover:outline-white"
            onClick={openCart}
            aria-label={`Cart with ${mounted ? itemCount : 0} items`}
          >
            <div className="relative">
              <ShoppingCart className="h-8 w-8" strokeWidth={1.5} />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amazon-orange px-1 text-xs font-bold text-[var(--color-text-primary)]">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden pb-1 text-sm font-bold sm:inline">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
}
