import Link from "next/link";
import { placeholders } from "@/content/site";
import { EmailLink, PhoneLink } from "./contact-links";

export function Footer() {
  return (
    <footer className="overflow-hidden bg-panel">
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-text">
            <p>
              <EmailLink />
            </p>
            <p className="mt-1">
              <PhoneLink />
            </p>
          </div>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className="transition hover:text-text">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-text">
              Terms
            </Link>
          </nav>
          <p className="text-muted">&copy; {placeholders.legalEntity}</p>
        </div>
        <p
          aria-label="VX44 AI Monitoring"
          className="mt-12 font-display text-[min(35vw,26rem)] leading-[0.8] font-bold tracking-[-0.05em] text-text"
        >
          VX<span className="text-gold">44</span>
        </p>
      </div>
    </footer>
  );
}
