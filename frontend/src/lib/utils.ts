import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_CURRENCY = "INR";

export function formatPrice(cents: number, currency = DEFAULT_CURRENCY) {
  const locale = currency === "INR" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatOrderNumber(id: string, createdAt: string) {
  const dateStr = createdAt.slice(0, 10).replace(/-/g, "");
  const suffix = id.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `AMZ-${dateStr}-${suffix}`;
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatOrderItemSummary(items: { title: string }[]) {
  if (items.length === 0) return "No items";
  if (items.length === 1) return items[0].title;
  const remaining = items.length - 1;
  return `${items[0].title} and ${remaining} more item(s)`;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Confirmed",
  paid: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}
