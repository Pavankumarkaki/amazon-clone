"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PriceTag } from "@/components/product/PriceTag";
import { useRemoveFromCart, useUpdateCartQuantity } from "@/hooks/useCart";
import { LoginRequiredError, useSaveForLater } from "@/hooks/useWishlist";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const saveForLater = useSaveForLater();
  const inStock = (item.stock ?? 1) > 0;

  const handleSaveForLater = async () => {
    try {
      await saveForLater.mutateAsync(item);
      toast.success("Saved for later");
    } catch (err) {
      if (err instanceof LoginRequiredError) {
        toast.info("Sign in to save items for later");
        router.push("/login");
        return;
      }
      toast.error("Failed to save for later");
    }
  };

  const saveForLaterButton = (
    <button
      type="button"
      className="flex items-center gap-1 text-xs text-amazon-link hover:text-(--color-text-link-hover) hover:underline disabled:opacity-50"
      onClick={handleSaveForLater}
      disabled={saveForLater.isPending}
    >
      <Bookmark className="h-3 w-3" />
      Save for later
    </button>
  );

  return (
    <div className="grid gap-4 border-b border-(--color-border) py-5 last:border-b-0 sm:grid-cols-[120px_1fr_auto]">
      <Link
        href={`/products/${item.productId}`}
        className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-sm bg-white p-2 transition-shadow hover:shadow-sm sm:mx-0"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-(--color-text-muted)">
            No img
          </div>
        )}
      </Link>

      <div className="min-w-0 space-y-2">
        <Link
          href={`/products/${item.productId}`}
          className="line-clamp-2 text-sm text-(--color-text-primary) hover:text-(--color-text-link-hover) hover:underline"
        >
          {item.title}
        </Link>

        <p className={`text-xs ${inStock ? "text-(--color-in-stock)" : "text-(--color-out-of-stock)"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        <p className="text-xs text-(--color-text-secondary)">
          Sold by: <span className="text-(--color-text-primary)">Amazon Clone</span>
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="relative">
            <label htmlFor={`qty-${item.productId}`} className="sr-only">
              Quantity
            </label>
            <select
              id={`qty-${item.productId}`}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity.mutate({ item, quantity: Number(e.target.value) })
              }
              className="appearance-none rounded border border-[#888C8C] bg-[#F0F2F2] py-1.5 pl-3 pr-8 text-xs shadow-sm focus:border-(--color-accent-orange) focus:outline-none"
            >
              {Array.from({ length: Math.min(item.stock ?? 10, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Qty: {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--color-text-secondary)" />
          </div>

          <span className="hidden text-(--color-border) sm:inline">|</span>

          <button
            type="button"
            className="text-xs text-(--color-text-link) hover:text-(--color-text-link-hover) hover:underline"
            onClick={() => removeItem.mutate(item)}
          >
            Delete
          </button>

          <span className="hidden text-(--color-border) sm:inline">|</span>

          <span className="hidden sm:inline">{saveForLaterButton}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:hidden">
          {saveForLaterButton}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-(--color-text-link) hover:text-(--color-text-link-hover) hover:underline"
            onClick={() => removeItem.mutate(item)}
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>

      <div className="text-left sm:text-right">
        <PriceTag cents={item.priceCents * item.quantity} currency={item.currency} size="md" />
        {item.quantity > 1 && (
          <p className="mt-1 text-xs text-(--color-text-secondary)">
            <PriceTag cents={item.priceCents} currency={item.currency} size="sm" /> each
          </p>
        )}
      </div>
    </div>
  );
}
