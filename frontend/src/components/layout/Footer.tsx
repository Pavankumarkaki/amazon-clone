import Link from "next/link";
import { Globe } from "lucide-react";

const FOOTER_LINKS = {
  "Get to Know Us": ["Careers", "Blog", "About Amazon Clone", "Investor Relations"],
  "Make Money with Us": ["Sell products", "Become an Affiliate", "Advertise Your Products"],
  "Amazon Clone Payment": ["Payment Methods", "Shop with Points", "Currency Converter"],
  "Let Us Help You": ["Your Account", "Your Orders", "Shipping Rates", "Returns & Replacements", "Help"],
};

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-[var(--color-footer-top)] py-8 text-center">
        <Link
          href="#"
          className="text-sm text-white transition-colors hover:underline"
        >
          Back to top
        </Link>
      </div>

      <div className="bg-[var(--color-footer-main)] px-4 py-10 text-white">
        <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 gap-8 sm:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-base font-bold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-[#DDD] transition-colors hover:underline"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-header-hover)] bg-[var(--color-footer-main)] px-4 py-6">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/" className="text-lg font-bold text-white">
            amazon<span className="text-[var(--color-accent-orange)]">clone</span>
          </Link>
          <button
            type="button"
            className="flex items-center gap-2 rounded-sm border border-[#848688] px-3 py-1.5 text-sm text-[#CCC] transition-colors hover:bg-[var(--color-header-hover)]"
          >
            <Globe className="h-4 w-4" />
            English
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-[#999]">
          &copy; {new Date().getFullYear()} Amazon Clone &mdash; SDE Fullstack Assignment. Built with Next.js &amp; FastAPI.
        </p>
      </div>
    </footer>
  );
}
