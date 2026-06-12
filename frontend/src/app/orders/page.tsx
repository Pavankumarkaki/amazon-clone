"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-gray-500">Start shopping to see your orders here</p>
        <Link href="/" className="mt-4 inline-block text-amber-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-700">{formatPrice(order.total_cents)}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
