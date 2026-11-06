import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "@/components/marketing/footer";
import { Nav } from "@/components/marketing/nav";
import { RevealRoot } from "@/components/marketing/reveal-root";
import { SkipLink } from "@/components/marketing/skip-link";
import { pageHeading, primaryButton, textLink } from "@/components/marketing/styles";

export const metadata: Metadata = { title: "Page not found" };

const hud = "font-mono text-[10px] tracking-[0.12em] text-text sm:text-[11px]";

// Unmatched URLs render here inside the root layout only, which has no nav or footer since the
// marketing pages moved into their own route group, so this page adds them itself.
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <Nav />
      <main
        id="content"
        tabIndex={-1}
        className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-20 outline-none sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-32"
      >
        <div>
          <h1 className={`hero-rise max-w-xl ${pageHeading}`}>We couldn’t find that page</h1>
          <p className="hero-rise mt-5 max-w-xl text-lg text-pretty" style={{ "--i": 1 } as CSSProperties}>
            The link may be out of date, or the address may have a typo.
          </p>
          <div
            className="hero-rise mt-9 flex flex-col gap-x-7 gap-y-2 sm:flex-row sm:items-center"
            style={{ "--i": 2 } as CSSProperties}
          >
            <Link href="/" className={primaryButton}>
              Back to the homepage
            </Link>
            <Link href="/demo" className={`${textLink} justify-center`}>
              Book a demo
            </Link>
          </div>
        </div>

        {/* A camera frame with no feed: the site's HUD language, saying "nothing here". */}
        <div
          data-ambient
          className="hero-rise relative aspect-video w-full overflow-hidden border border-line bg-footage"
          style={{ "--i": 3 } as CSSProperties}
        >
          <div aria-hidden="true" className="no-signal absolute inset-0" />
          <div aria-hidden="true" className="footage-corners absolute inset-[3%]" />
          <p aria-hidden="true" className={`absolute top-[6%] left-[5%] ${hud}`}>
            CAM 404
          </p>
          <p aria-hidden="true" className={`absolute top-[6%] right-[5%] flex items-center gap-1.5 ${hud}`}>
            <span className="size-1.5 rounded-full bg-muted" />
            OFFLINE
          </p>
          <p className="absolute inset-0 flex items-center justify-center font-mono text-sm tracking-[0.3em] text-muted">
            404 · NO SIGNAL
          </p>
        </div>
      </main>
      <Footer />
      <RevealRoot />
    </>
  );
}
