"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Heart, Package, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/product/SearchBar";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useUIStore((s) => s.openCart);
  const user = useAuthStore((s) => s.user);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-gray-900 text-white shadow">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 text-xl font-bold text-amber-400">
          <Image src="/logo.svg" alt="Amazon Clone" width={100} height={100} className="h-12 w-24" />
        </Link>

        <nav className="ml-auto flex items-center gap-2 md:order-3">
          {user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </Button>
              </Link>
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Wishlist</span>
                </Button>
              </Link>
              <span className="hidden text-sm text-gray-300 sm:inline">
                Hello, {user.full_name.split(" ")[0]}
              </span>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-white hover:bg-gray-800"
            onClick={openCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                {itemCount}
              </span>
            )}
            <span className="hidden sm:inline">Cart</span>
          </Button>
        </nav>

        <div className="w-full md:order-2 md:flex-1">
          <Suspense fallback={<div className="h-10 w-full rounded-md bg-gray-800" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
