"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartSummary } from "@/components/cart/CartSummary";
import { formatPrice } from "@/lib/utils";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCartStore } from "@/store/cart.store";

const addressSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  address_line1: z.string().min(3, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(7, "Phone is required"),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotalCents());
  const itemCount = useCartStore((s) => s.getItemCount());
  const clearCart = useCartStore((s) => s.clear);
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "United States" },
  });

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: AddressForm) => {
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        shipping_address: data,
      });
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register("full_name")} />
                  {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input id="address_line1" {...register("address_line1")} />
                  {errors.address_line1 && <p className="mt-1 text-xs text-red-500">{errors.address_line1.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
                  <Input id="address_line2" {...register("address_line2")} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} />
                  {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input id="postal_code" {...register("postal_code")} />
                  {errors.postal_code && <p className="mt-1 text-xs text-red-500">{errors.postal_code.message}</p>}
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...register("country")} />
                  {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>
                        {item.title} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.priceCents * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <CartSummary subtotalCents={subtotal} itemCount={itemCount} showCheckoutButton={false} />
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || createOrder.isPending}>
              {isSubmitting || createOrder.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
