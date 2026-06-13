"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderConfirmationView } from "@/components/order/OrderConfirmationView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/auth.store";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { data: order, isLoading, error } = useOrder(id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-(--container-max) space-y-4 px-4 py-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold text-(--color-text-primary)">Order not found</h1>
        <Link href="/">
          <Button variant="amazon" className="mt-4">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return <OrderConfirmationView order={order} userEmail={user?.email ?? order.shipping_address.email} />;
}
