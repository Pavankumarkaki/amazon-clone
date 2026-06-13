"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderListCard } from "@/components/order/OrderListCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/auth.store";

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { data: orders, isLoading: ordersLoading } = useOrders();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || ordersLoading) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-6">
        <Skeleton className="mb-6 h-9 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-(--color-text-primary)">Your Orders</h1>
        <p className="mt-4 text-(--color-text-secondary)">You haven&apos;t placed any orders yet.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="amazon">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-max) px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-(--color-text-primary)">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderListCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
