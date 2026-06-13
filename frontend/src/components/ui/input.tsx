import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-8 w-full rounded-sm border border-[#888C8C] bg-white px-3 py-1 text-sm text-[var(--color-text-primary)] shadow-sm placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-accent-orange)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-orange)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
