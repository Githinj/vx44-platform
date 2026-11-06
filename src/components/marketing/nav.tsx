import Link from "next/link";
import { navLinks } from "@/content/site";
import { MobileMenu } from "./mobile-menu";
import { NavShell } from "./nav-shell";
import { compactButton } from "./styles";
import { Wordmark } from "./wordmark";

export function Nav() {
  return (
    <NavShell>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center px-3 text-sm transition-colors duration-180 hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/demo" className={compactButton}>
            Book a demo
          </Link>
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </NavShell>
  );
}
