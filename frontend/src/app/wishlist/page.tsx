"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceTag } from "@/components/product/PriceTag";
import { useRemoveFromWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/auth.store";

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist.mutateAsync(productId);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (isLoading || wishlistLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!wishlist?.length) {
    return (
      <div className="py-16 text-center">
        <Heart className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold">Your wishlist is empty</h1>
        <p className="mt-2 text-gray-500">Save items you love for later</p>
        <Link href="/">
          <Button className="mt-4">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your Wishlist</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {wishlist.map((item) => {
          const imageUrl = item.product.images[0]?.url;
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  <div className="aspect-square overflow-hidden rounded bg-white">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product.title} className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">No image</div>
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-medium">{item.product.title}</h3>
                  <PriceTag cents={item.product.price_cents} currency={item.product.currency} />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-red-500"
                  onClick={() => handleRemove(item.product_id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
