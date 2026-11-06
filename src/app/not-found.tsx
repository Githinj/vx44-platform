import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/marketing/footer";
import { Nav } from "@/components/marketing/nav";

export const metadata: Metadata = { title: "Page not found" };

// Unmatched URLs render here inside the root layout only, which has no nav or footer since the
// marketing pages moved into their own route group, so this page adds them itself.
export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-24 sm:px-6 lg:py-32">
        <p className="font-mono text-[13px] tracking-[0.14em] text-gold">404 · NO SIGNAL</p>
        <h1 className="mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          We couldn’t find that page
        </h1>
        <p className="mt-5 max-w-xl text-lg text-pretty">
          The link may be out of date, or the address may have a typo.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="bg-gold px-5 py-3 text-center font-semibold text-ink transition hover:brightness-110 active:brightness-90"
          >
            Back to the homepage
          </Link>
          <Link href="/demo" className="text-center text-text underline underline-offset-4 hover:text-gold">
            Book a demo
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
