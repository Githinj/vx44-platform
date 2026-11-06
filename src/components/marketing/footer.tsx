import Link from "next/link";
import { formatAddress, placeholders } from "@/content/site";
import { EmailLink, PhoneLink } from "./contact-links";

const rowLink = "inline-flex min-h-11 items-center";

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line bg-panel">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Each detail is labelled, so nobody has to guess which line is which. */}
          <address className="not-italic">
            <dl className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 sm:grid-cols-[5rem_1fr]">
              <dt className="text-sm text-muted">Email</dt>
              <dd className="text-text">
                <EmailLink className={rowLink} />
              </dd>
              <dt className="text-sm text-muted">Phone</dt>
              <dd className="text-text">
                <PhoneLink className={rowLink} />
              </dd>
              <dt className="text-sm text-muted">Address</dt>
              <dd className="py-2.5 text-text">{formatAddress()}</dd>
            </dl>
          </address>
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
