"use client";

import { Check, Home, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Order Confirmed", icon: Check },
  { label: "Processing", icon: Package },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: Home },
] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
};

interface DeliveryTrackerProps {
  status: string;
}

export function DeliveryTracker({ status }: DeliveryTrackerProps) {
  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <div className="amazon-card p-6">
      <div className="flex items-start justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index <= currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.label} className="relative flex flex-1 flex-col items-center">
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[calc(50%+20px)] top-5 h-0.5 w-[calc(100%-40px)]",
                    index < currentIndex ? "bg-green-500" : "bg-(--color-border)",
                  )}
                  aria-hidden="true"
                />
              )}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
                  isComplete
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-(--color-border) bg-white text-(--color-text-muted)",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  "mt-2 text-center text-xs sm:text-sm",
                  isComplete ? "font-medium text-green-700" : "text-(--color-text-secondary)",
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
