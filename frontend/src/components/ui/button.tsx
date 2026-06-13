import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text-link)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "amazon-btn-primary",
        secondary:
          "rounded-sm border border-[var(--color-border)] bg-[#F0F2F2] text-[var(--color-text-primary)] shadow-sm hover:bg-[#E3E6E6] active:bg-[#D5D9D9]",
        outline:
          "rounded-sm border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[#F7FAFA]",
        destructive:
          "rounded-sm bg-[#B12704] text-white hover:bg-[#9A2203]",
        ghost:
          "rounded-sm hover:bg-black/5",
        link:
          "amazon-link underline-offset-4 hover:underline p-0 h-auto",
        amazon:
          "amazon-btn-primary",
        "amazon-dark":
          "rounded-sm bg-[var(--color-header-secondary)] text-white hover:bg-[var(--color-header-hover)]",
      },
      size: {
        default: "h-8 px-4 py-1",
        sm: "h-7 px-3 text-xs",
        lg: "h-10 px-6 text-base",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
