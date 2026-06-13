"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { checkoutAddressSchema, type CheckoutAddressForm } from "@/lib/checkoutSchema";
import { INDIAN_STATES } from "@/lib/indian-states";
import { DEFAULT_CURRENCY } from "@/lib/utils";
import { clearServerCart, useCartItems } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useCheckoutStore } from "@/store/checkout.store";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-(--container-max) px-4 py-16 text-center">
          <p className="text-(--color-text-secondary)">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "1";
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const buyNowItems = useCheckoutStore((s) => s.buyNowItems);
  const clearBuyNow = useCheckoutStore((s) => s.clearBuyNow);
  const { items: cartItems, isLoading: cartLoading } = useCartItems();
  const clearGuestCart = useCartStore((s) => s.clear);
  const createOrder = useCreateOrder();

  const items = isBuyNow ? (buyNowItems ?? []) : cartItems;

  const { subtotalCents, taxCents, totalCents, currency } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    return {
      subtotalCents: subtotal,
      taxCents: tax,
      totalCents: subtotal + tax,
      currency: items[0]?.currency ?? DEFAULT_CURRENCY,
    };
  }, [items]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutAddressForm>({
    resolver: zodResolver(checkoutAddressSchema),
    defaultValues: {
      country: "India",
      state: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      reset((values) => ({
        ...values,
        email: user.email,
      }));
    }
  }, [user, reset]);

  useEffect(() => {
    if (!isBuyNow) {
      clearBuyNow();
    }
  }, [isBuyNow, clearBuyNow]);

  if (authLoading || (!isBuyNow && cartLoading)) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-16 text-center">
        <p className="text-(--color-text-secondary)">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--container-max) px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-(--color-text-primary)">
          {isBuyNow ? "No item selected for checkout" : "Your cart is empty"}
        </h1>
        <Button variant="amazon" className="mt-4" onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutAddressForm) => {
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        shipping_address: {
          full_name: data.full_name,
          email: data.email,
          address_line1: data.address_line1,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          phone: data.phone,
        },
      });

      if (isBuyNow) {
        clearBuyNow();
      } else {
        clearGuestCart();
        if (user) {
          await clearServerCart();
          queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
        }
      }

      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    }
  };

  return (
    <div className="mx-auto max-w-(--container-max) px-4 py-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-(--color-text-primary)">Checkout</h1>
        <span className="flex items-center gap-1 text-sm text-(--color-text-secondary)">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Secure checkout
        </span>
      </div>

      {isBuyNow && (
        <p className="mb-6 text-sm text-(--color-text-secondary)">
          Buying now — only this item will be ordered. Your saved cart is unchanged.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="amazon-card shadow-(--shadow-card)">
            <div className="border-b border-(--color-border) px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-(--color-text-primary)">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amazon-orange text-sm font-bold text-(--color-text-primary)">
                  1
                </span>
                Shipping Address
              </h2>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  className="mt-1"
                  placeholder="John Doe"
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-amazon-deal">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-amazon-deal">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="mt-1"
                    placeholder="10-digit mobile number"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-amazon-deal">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postal_code">PIN Code</Label>
                  <Input
                    id="postal_code"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-1"
                    placeholder="6-digit PIN code"
                    {...register("postal_code")}
                  />
                  {errors.postal_code && (
                    <p className="mt-1 text-xs text-amazon-deal">{errors.postal_code.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address_line1">
                  Flat, House no., Building, Company, Apartment
                </Label>
                <Input
                  id="address_line1"
                  className="mt-1"
                  placeholder="Street address"
                  {...register("address_line1")}
                />
                {errors.address_line1 && (
                  <p className="mt-1 text-xs text-amazon-deal">{errors.address_line1.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">Town/City</Label>
                  <Input id="city" className="mt-1" placeholder="City" {...register("city")} />
                  {errors.city && (
                    <p className="mt-1 text-xs text-amazon-deal">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select id="state" className="mt-1" defaultValue="" {...register("state")}>
                    <option value="" disabled>
                      Select state
                    </option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Select>
                  {errors.state && (
                    <p className="mt-1 text-xs text-amazon-deal">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" className="mt-1 bg-[#F0F2F2]" readOnly {...register("country")} />
              </div>

              <Button
                type="submit"
                variant="amazon"
                className="w-full rounded-sm py-6 text-base"
                size="lg"
                disabled={isSubmitting || createOrder.isPending}
              >
                {isSubmitting || createOrder.isPending ? "Placing Order..." : "Use this address"}
              </Button>

              {!isBuyNow && (
                <p className="text-center text-xs text-(--color-text-secondary)">
                  By placing your order, you agree to Amazon Clone&apos;s{" "}
                  <Link href="#" className="amazon-link">
                    privacy notice
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="amazon-link">
                    conditions of use
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-height)+var(--subnav-height)+16px)] lg:self-start">
            <CheckoutOrderSummary
              items={items}
              subtotalCents={subtotalCents}
              taxCents={taxCents}
              totalCents={totalCents}
              currency={currency}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
