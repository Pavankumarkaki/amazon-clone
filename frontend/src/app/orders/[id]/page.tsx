"use client";

import { useParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useOrder } from "@/hooks/useOrders";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <Link href="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const address = order.shipping_address;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-gray-600">
          Thank you for your order. Your order number is{" "}
          <span className="font-mono font-semibold">{order.id.slice(0, 8)}</span>
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Details
            <Badge variant="secondary" className="capitalize">
              {order.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>Product x {item.quantity}</span>
                <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-amber-700">{formatPrice(order.total_cents)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">{address.full_name}</p>
          <p>{address.address_line1}</p>
          {address.address_line2 && <p>{address.address_line2}</p>}
          <p>
            {address.city}, {address.state} {address.postal_code}
          </p>
          <p>{address.country}</p>
          <p className="mt-1">{address.phone}</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-center gap-4">
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline">View All Orders</Button>
        </Link>
      </div>
    </div>
  );
}
