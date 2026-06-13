"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_CURRENCY,
  formatOrderDate,
  formatOrderItemSummary,
  formatOrderNumber,
  formatOrderStatusLabel,
  formatPrice,
} from "@/lib/utils";
import type { Order } from "@/types";

interface OrderListCardProps {
  order: Order;
}

function statusBadgeVariant(status: string): "success" | "secondary" | "destructive" {
  if (status === "cancelled") return "destructive";
  if (status === "shipped" || status === "delivered") return "success";
  return "success";
}

export function OrderListCard({ order }: OrderListCardProps) {
  const thumbnails = order.items.slice(0, 2);

  return (
    <article className="overflow-hidden rounded border border-(--color-border) bg-white shadow-(--shadow-card)">
      <div className="grid gap-4 bg-[#F0F2F2] px-4 py-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
            Order Placed
          </p>
          <p className="mt-0.5 text-(--color-text-primary)">{formatOrderDate(order.created_at)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">Total</p>
          <p className="mt-0.5 text-(--color-text-primary)">
            {formatPrice(order.total_cents, DEFAULT_CURRENCY)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
            Ship To
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-(--color-text-primary)">
            {order.shipping_address.full_name}
            <ChevronDown className="h-3.5 w-3.5 text-(--color-text-muted)" aria-hidden="true" />
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
            Order # {formatOrderNumber(order.id, order.created_at)}
          </p>
          <Badge variant={statusBadgeVariant(order.status)} className="mt-1.5 rounded-sm px-2 py-0.5">
            {formatOrderStatusLabel(order.status)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 gap-2">
            {thumbnails.map((item) => (
              <div
                key={item.id}
                className="h-16 w-16 overflow-hidden rounded border border-(--color-border) bg-white p-1"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-(--color-text-muted)">
                    No image
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-(--color-text-primary)">{formatOrderItemSummary(order.items)}</p>
        </div>

        <Link
          href={`/orders/${order.id}`}
          className="amazon-link shrink-0 text-sm font-medium sm:ml-auto"
        >
          View Details &rsaquo;
        </Link>
      </div>
    </article>
  );
}
