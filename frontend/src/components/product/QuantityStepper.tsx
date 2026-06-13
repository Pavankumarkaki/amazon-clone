"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-sm border border-[#D5D9D9] shadow-sm">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-l-sm bg-[#F0F2F2] text-[var(--color-text-primary)] transition-colors hover:bg-[#E3E6E6] disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="flex h-8 w-10 items-center justify-center border-x border-[#D5D9D9] bg-white text-sm font-medium">
        {value}
      </span>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-r-sm bg-[#F0F2F2] text-[var(--color-text-primary)] transition-colors hover:bg-[#E3E6E6] disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
