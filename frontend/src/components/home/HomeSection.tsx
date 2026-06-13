import Link from "next/link";
import { cn } from "@/lib/utils";

interface HomeSectionProps {
  title: string;
  children: React.ReactNode;
  href?: string;
  linkText?: string;
  className?: string;
  noPadding?: boolean;
}

export function HomeSection({
  title,
  children,
  href,
  linkText = "See more",
  className,
  noPadding = false,
}: HomeSectionProps) {
  return (
    <section
      className={cn(
        "amazon-card",
        noPadding ? "overflow-hidden" : "p-5",
        className,
      )}
    >
      <div className={cn("flex items-baseline justify-between", !noPadding && "mb-4")}>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
        {href && (
          <Link href={href} className="amazon-link text-sm font-medium">
            {linkText}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
