import Link from "next/link";
import { formatAddress, placeholders } from "@/content/site";
import { EmailLink, PhoneLink } from "./contact-links";

const rowLink = "inline-flex min-h-11 items-center";

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line bg-panel">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-text">
            <p>
              <EmailLink className={rowLink} />
            </p>
            <p>
              <PhoneLink className={rowLink} />
            </p>
            <address className="mt-2 text-sm not-italic text-muted">{formatAddress()}</address>
          </div>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className={`${rowLink} transition-colors duration-180 hover:text-text`}>
              Privacy
            </Link>
            <Link href="/terms" className={`${rowLink} transition-colors duration-180 hover:text-text`}>
              Terms
            </Link>
          </nav>
          <p className="text-muted md:pt-3">&copy; {placeholders.legalEntity}</p>
        </div>
        <p
          aria-hidden="true"
          data-reveal
          className="mt-12 font-display text-[min(35vw,26rem)] leading-[0.8] font-bold tracking-[-0.05em] text-text select-none"
        >
          VX<span className="text-gold">44</span>
        </p>
      </div>
    </footer>
  );
}
