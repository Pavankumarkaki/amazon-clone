"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/product/PriceTag";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { setQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 border-b border-gray-200 py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-300">No img</div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
          <PriceTag cents={item.priceCents} currency={item.currency} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) => setQuantity(item.productId, qty)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <PriceTag cents={item.priceCents * item.quantity} currency={item.currency} />
      </div>
    </div>
  );
}
