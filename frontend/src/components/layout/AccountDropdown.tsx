"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const YOUR_LISTS_LINKS = [
  { label: "Create a Wish List", href: "/wishlist" },
  { label: "Find a Wish List", href: "/wishlist" },
  { label: "Your Wishlist", href: "/wishlist" },
];

const YOUR_ACCOUNT_LINKS = [
  { label: "Your Orders", href: "/orders" },
  { label: "Your Wish List", href: "/wishlist" },
  { label: "Your Recommendations", href: "/" },
  { label: "Returns", href: "/orders" },
];

function DropdownLink({
  href,
  children,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const className =
    "block rounded-sm px-2 py-2 text-sm text-(--color-text-primary) transition-colors hover:bg-[#F7FAFA] hover:text-(--color-text-link-hover) active:bg-[#F7FAFA]";

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(className, "w-full text-left")}>
      {children}
    </button>
  );
}

function DropdownSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-3 sm:px-5 sm:py-4", className)}>
      <h3 className="mb-1.5 text-sm font-bold text-(--color-text-primary) sm:mb-2 sm:text-base">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function AccountDropdown() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPanelTop(triggerRef.current.getBoundingClientRect().bottom + 6);
  }, []);

  const handleSignOut = async () => {
    await logout();
    close();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobileLayout(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || !isMobileLayout) return;

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, isMobileLayout, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  const handleTriggerClick = () => {
    if (isMobileLayout) {
      setOpen((prev) => {
        const next = !prev;
        if (next) updatePanelPosition();
        return next;
      });
      return;
    }
    setOpen(true);
  };

  const firstName = user?.full_name.split(" ")[0];

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={!isMobileLayout ? () => setOpen(true) : undefined}
      onMouseLeave={!isMobileLayout ? () => setOpen(false) : undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className="max-w-[42vw] rounded-sm px-1.5 py-1 text-left transition-colors hover:outline hover:outline-white sm:max-w-none sm:px-2"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={handleTriggerClick}
      >
        {user ? (
          <>
            <span className="block truncate text-[11px]">Hello, {firstName}</span>
            <span className="hidden text-sm font-bold sm:block">Account &amp; Lists</span>
          </>
        ) : (
          <>
            <span className="block truncate text-[11px]">Hello, sign in</span>
            <span className="hidden text-sm font-bold sm:block">Account &amp; Lists</span>
          </>
        )}
      </button>

      {open && (
        <>
          {isMobileLayout && (
            <div
              className="fixed inset-0 z-55 bg-black/40 md:hidden"
              aria-hidden
              onClick={close}
            />
          )}

          <div
            className={cn(
              "z-60",
              isMobileLayout
                ? "fixed left-2 right-2"
                : "absolute right-0 top-full w-[480px] max-w-[480px] shrink-0 pt-2",
            )}
            style={isMobileLayout ? { top: panelTop } : undefined}
            role="menu"
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-sm border border-(--color-border) bg-white shadow-(--shadow-drawer)",
                isMobileLayout &&
                  "max-h-[min(70dvh,calc(100dvh-6rem))] w-full overflow-y-auto",
                !isMobileLayout && "w-[480px]",
              )}
            >
              <div
                className="absolute -top-2 right-8 hidden h-4 w-4 rotate-45 border-l border-t border-(--color-border) bg-white md:block"
                aria-hidden
              />

              {!user && (
                <div className="border-b border-(--color-border) px-4 py-3 sm:px-5">
                  <Link
                    href="/login"
                    className="amazon-btn-primary inline-block w-full px-6 py-2 text-center text-sm font-medium sm:w-auto sm:py-1.5"
                    onClick={close}
                  >
                    Sign in
                  </Link>
                  <p className="mt-2 text-xs text-(--color-text-secondary)">
                    New customer?{" "}
                    <Link
                      href="/register"
                      className="text-amazon-link hover:text-(--color-text-link-hover) hover:underline"
                      onClick={close}
                    >
                      Start here.
                    </Link>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2">
                <DropdownSection
                  title="Your Lists"
                  className="border-b border-(--color-border) md:border-r md:border-b-0"
                >
                  {YOUR_LISTS_LINKS.map((link) => (
                    <DropdownLink key={link.label} href={link.href} onClick={close}>
                      {link.label}
                    </DropdownLink>
                  ))}
                </DropdownSection>

                <DropdownSection title="Your Account">
                  {user ? (
                    <>
                      <DropdownLink onClick={handleSignOut}>Sign Out</DropdownLink>
                      {YOUR_ACCOUNT_LINKS.map((link) => (
                        <DropdownLink key={link.label} href={link.href} onClick={close}>
                          {link.label}
                        </DropdownLink>
                      ))}
                    </>
                  ) : (
                    <>
                      <DropdownLink href="/login" onClick={close}>
                        Sign In
                      </DropdownLink>
                      <DropdownLink href="/register" onClick={close}>
                        Create an Account
                      </DropdownLink>
                      {YOUR_ACCOUNT_LINKS.map((link) => (
                        <DropdownLink key={link.label} href={link.href} onClick={close}>
                          {link.label}
                        </DropdownLink>
                      ))}
                    </>
                  )}
                </DropdownSection>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
