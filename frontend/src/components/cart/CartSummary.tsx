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
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Items ({itemCount})</span>
          <span>{formatPrice(subtotalCents)}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span className="text-amber-700">{formatPrice(subtotalCents)}</span>
          </div>
        </div>
        {showCheckoutButton && (
          <Link href="/checkout">
            <Button className="w-full" size="lg" disabled={itemCount === 0}>
              Proceed to Checkout
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
