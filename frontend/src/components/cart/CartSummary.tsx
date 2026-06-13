"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  subtotalCents: number;
  itemCount: number;
  showCheckoutButton?: boolean;
}

export function CartSummary({ subtotalCents, itemCount, showCheckoutButton = true }: CartSummaryProps) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader className="border-b border-[var(--color-border)]">
        <CardTitle className="text-lg">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-2xl font-normal text-[var(--color-deal)]">
          {formatPrice(subtotalCents)}
        </p>

        <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <div className="flex justify-between">
            <span>Items ({itemCount}):</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-bold text-[var(--color-text-primary)]">
            <span>Order Total:</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
        </div>

        {showCheckoutButton && (
          <Link href="/checkout">
            <Button variant="amazon" className="w-full" size="lg" disabled={itemCount === 0}>
              Proceed to checkout
            </Button>
          </Link>
        )}

        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          Prices and shipping costs are not final until you complete your order.
        </p>
      </CardContent>
    </Card>
  );
}
