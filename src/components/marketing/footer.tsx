import Link from "next/link";
import { formatAddress, navLinks, placeholders } from "@/content/site";
import { EmailLink, PhoneLink } from "./contact-links";
import { Wordmark } from "./wordmark";

const getStarted = [
  { href: "/demo", label: "Book a demo" },
  { href: "/check", label: "Check my cameras" },
  { href: "/talk-to-sales", label: "Talk to sales" },
];

const heading = "text-sm font-semibold text-text";
const list = "mt-4 grid gap-0.5";
const link =
  "inline-flex min-h-10 items-center text-[0.9375rem] transition-colors duration-180 hover:text-text";
const legalLink = "inline-flex min-h-11 items-center transition-colors duration-180 hover:text-text";

// A quiet, structured close: who VX44 is, where to go next, and how to reach a person.
export function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-10 lg:py-20">
          <div className="col-span-2 max-w-xs lg:col-span-1">
            <Wordmark />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-pretty">
              AI monitoring for the cameras you already own. Every alert is checked by a trained
              VX44 operator.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className={heading}>Explore</h2>
            <ul className={list}>
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Get started">
            <h2 className={heading}>Get started</h2>
            <ul className={list}>
              {getStarted.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Each detail is labelled, so nobody has to guess which line is which. */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className={heading}>Contact</h2>
            <address className="mt-4 not-italic">
              <dl className="grid gap-4 text-[0.9375rem]">
                <div>
                  <dt className="text-xs text-muted">Email</dt>
                  <dd className="text-text">
                    <EmailLink className="inline-flex min-h-8 items-center" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Phone</dt>
                  <dd className="text-text">
                    <PhoneLink className="inline-flex min-h-8 items-center" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Address</dt>
                  <dd className="mt-1 leading-relaxed text-text">{formatAddress()}</dd>
                </div>
              </dl>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-line py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="py-2 sm:py-0">&copy; {placeholders.legalEntity}. All rights reserved.</p>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className={legalLink}>
              Privacy
            </Link>
            <Link href="/terms" className={legalLink}>
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
