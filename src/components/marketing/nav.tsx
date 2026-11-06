import Link from "next/link";
import { navLinks } from "@/content/site";
import { MobileMenu } from "./mobile-menu";
import { Wordmark } from "./wordmark";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-ink">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm transition hover:text-text">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="shrink-0 bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110 active:brightness-90"
          >
            Book a demo
          </Link>
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
