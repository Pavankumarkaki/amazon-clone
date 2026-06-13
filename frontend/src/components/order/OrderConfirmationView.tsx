"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { DeliveryTracker } from "@/components/order/DeliveryTracker";
import { Button } from "@/components/ui/button";
import { DEFAULT_CURRENCY, formatOrderNumber, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

interface OrderConfirmationViewProps {
  order: Order;
  userEmail?: string;
}

export function OrderConfirmationView({ order, userEmail }: OrderConfirmationViewProps) {
  const address = order.shipping_address;
  const subtotalCents = order.items.reduce(
    (sum, item) => sum + item.unit_price_cents * item.quantity,
    0,
  );
  const taxCents = order.total_cents - subtotalCents;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-(--container-max) space-y-4 px-4 py-6">
      <div className="flex gap-4 rounded border-2 border-green-500 bg-green-50 p-5 sm:p-6">
        <CheckCircle className="h-10 w-10 shrink-0 text-green-600" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-(--color-text-secondary) sm:text-base">
            Your order has been confirmed.
            {userEmail && (
              <>
                {" "}
                A confirmation email has been sent to{" "}
                <span className="font-medium text-(--color-text-primary)">{userEmail}</span>.
              </>
            )}
          </p>
          <p className="mt-3 text-sm text-(--color-text-secondary)">
            Order ID:{" "}
            <span className="font-mono font-semibold text-amazon-link">
              {formatOrderNumber(order.id, order.created_at)}
            </span>
          </p>
        </div>
      </div>

      <DeliveryTracker status={order.status} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="amazon-card p-5">
          <h2 className="text-lg font-bold text-(--color-text-primary)">Shipping To</h2>
          <div className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
            <p className="font-medium text-(--color-text-primary)">{address.full_name}</p>
            <p>{address.address_line1}</p>
            {address.address_line2 && <p>{address.address_line2}</p>}
            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p>{address.country}</p>
            <p className="mt-2">{address.phone}</p>
          </div>
        </div>

        <div className="amazon-card p-5">
          <h2 className="text-lg font-bold text-(--color-text-primary)">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-(--color-text-secondary)">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{formatPrice(subtotalCents, DEFAULT_CURRENCY)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-medium text-green-700">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>GST &amp; Taxes:</span>
              <span>{formatPrice(taxCents, DEFAULT_CURRENCY)}</span>
            </div>
            <div className="flex justify-between border-t border-(--color-border) pt-3 text-base font-bold text-(--color-text-primary)">
              <span>Total:</span>
              <span className="text-[22px] text-(--color-deal)">
                {formatPrice(order.total_cents, DEFAULT_CURRENCY)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="amazon-card p-5">
        <h2 className="text-lg font-bold text-(--color-text-primary)">
          Items Ordered ({itemCount})
        </h2>
        <div className="mt-4 divide-y divide-(--color-border)">
          {order.items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.product_id}`}
              className="flex items-center gap-4 rounded-sm py-4 transition-colors first:pt-0 last:pb-0 hover:bg-[#F7FAFA]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-(--color-border) bg-white">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-(--color-text-muted)">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-(--color-text-primary) hover:text-amazon-link hover:underline">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-(--color-text-secondary)">Qty: {item.quantity}</p>
              </div>
              <p className="shrink-0 font-medium text-(--color-text-primary)">
                {formatPrice(item.unit_price_cents * item.quantity, DEFAULT_CURRENCY)}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-3 pt-2 sm:flex-row">
        <Link href="/" className="flex-1">
          <Button variant="amazon" className="w-full rounded-full py-6 text-base" size="lg">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/orders" className="flex-1">
          <Button variant="outline" className="w-full rounded-full py-6 text-base" size="lg">
            View All Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
