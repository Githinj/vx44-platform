import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FootageSlot } from "@/components/marketing/footage-slot";
import { SectionHeading } from "@/components/marketing/section-heading";
import { StructuredData } from "@/components/marketing/structured-data";
import { cardClass, primaryButton, textLink } from "@/components/marketing/styles";
import { faqs, features, heroFootage, liveAiSlots, pricing, steps } from "@/content/site";

// The title and description come from the root layout. The canonical tells search engines to
// index https://www.vx44ai.com/ rather than the bare or http:// addresses that redirect here.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const container = "mx-auto max-w-6xl px-4 sm:px-6";
const sectionClass = `${container} mt-28 lg:mt-40`;

export default function HomePage() {
  return (
    <main>
      <StructuredData />
      <section data-ambient className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="ambient-grid" />
          <div className="gold-glow ambient-glow absolute inset-0" />
        </div>
        <div className={`relative ${container} pt-16 pb-20 text-center sm:pt-24 lg:pb-28`}>
          <h1 className="text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[5.4vw] xl:text-[4.25rem]">
            <span className="hero-focus block">Your cameras see everything.</span>
            <span className="hero-focus block" style={{ "--i": 1 } as CSSProperties}>
              Now someone’s watching.
            </span>
          </h1>
          <p
            className="hero-rise mx-auto mt-8 max-w-2xl text-lg text-pretty sm:text-xl"
            style={{ "--i": 2 } as CSSProperties}
          >
            VX44 adds AI monitoring to the cameras you already own, so what happens at your site
            gets noticed, checked and acted on.
          </p>
          <div
            className="hero-rise mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-2 sm:flex-row"
            style={{ "--i": 3 } as CSSProperties}
          >
            <Link href="/demo" className={`${primaryButton} w-full sm:w-auto`}>
              Book a demo
            </Link>
            <Link href="/check" className={textLink}>
              Check my cameras
            </Link>
          </div>

          {/* The footage paints immediately: it is the largest element on screen, so delaying it
              would delay Largest Contentful Paint. The boot sweep and the alert card arriving over
              it are the motion. */}
          <div className="relative mt-14 text-left sm:mt-16">
            <div aria-hidden="true" className="desk-glow absolute inset-x-[5%] -bottom-16 h-40" />
            <FootageSlot
              camera={heroFootage.camera}
              src={heroFootage.src}
              poster={heroFootage.poster}
              detection={heroFootage.detection}
              priority
              className="shadow-[0_40px_80px_-32px_rgba(0,0,0,0.9)]"
            />
            <div
              data-ui
              className="hero-alert relative mt-3 rounded-card border border-white/10 bg-panel-solid/90 p-4 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md sm:absolute sm:right-6 sm:bottom-6 sm:m-0 sm:w-80 sm:p-5"
            >
              <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-cyan">
                <span aria-hidden="true" className="ping-loop relative size-1.5 rounded-full bg-cyan" />
                AI ALERT · CAM 01
              </p>
              <p className="mt-2 font-display font-semibold text-text">
                Person detected on the forecourt
              </p>
              {/* The operator's review, shown as a bar that fills before the result lands. */}
              <div aria-hidden="true" className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
                <div className="review-bar h-full rounded-full bg-text/80" />
              </div>
              <p className="hero-verified mt-3 flex items-center gap-2 text-sm text-green">
                <span aria-hidden="true" className="ping-once relative size-1.5 rounded-full bg-green" />
                Verified. Site contact notified.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Compatibility" className="border-y border-line bg-panel">
        <p className={`${container} py-6 text-center`}>
          Built for existing <span className="font-semibold text-text">Hikvision</span> and{" "}
          <span className="font-semibold text-text">Dahua</span> DVRs. Other brand?{" "}
          <Link
            href="/demo"
            className="text-gold underline underline-offset-4 transition-colors duration-180 hover:text-text"
          >
            Ask us to check
          </Link>
          .
        </p>
      </section>

      <section id="how-it-works" data-ambient className={sectionClass}>
        <SectionHeading title="From motion to a clear answer" />
        {/* The four bars meet into one line, so the sequence reads as a single track from
            detection to report. They draw in order, then a glint runs along them now and then. */}
        <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-1">
          {steps.map((step, index) => (
            <li key={step.title} className="md:pr-6">
              <div
                aria-hidden="true"
                data-reveal="bar"
                style={{ "--i": index } as CSSProperties}
                className={`relative h-1 w-full overflow-hidden rounded-full ${step.accent}`}
              >
                <span className="track-glint hidden md:block" />
              </div>
              <div data-reveal style={{ "--i": index + 1 } as CSSProperties}>
                <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-pretty">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* The monitor wall: a navy band, the one place Deep Navy takes a whole surface. */}
      <section id="live-ai" className="relative mt-16 py-12 lg:mt-24 lg:py-16">
        <div aria-hidden="true" className="navy-band pointer-events-none absolute inset-x-0 -inset-y-24" />
        <div className={`relative ${container}`}>
          <SectionHeading title="It knows what it’s looking at" />
          {/* One frame per row until there is room for three, so the HUD never crowds. */}
          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-5">
            {liveAiSlots.map((slot, index) => (
              <div
                key={slot.title}
                className="grid gap-5 md:grid-cols-[3fr_2fr] md:items-center md:gap-8 lg:grid-cols-1 lg:items-start lg:gap-0"
              >
                <FootageSlot
                  camera={slot.camera}
                  src={slot.src}
                  poster={slot.poster}
                  detection={slot.detection}
                  reveal
                  index={index}
                />
                <div data-reveal style={{ "--i": index + 2 } as CSSProperties} className="lg:mt-5">
                  <h3 className="text-2xl font-semibold">{slot.title}</h3>
                  <p className="mt-2 leading-relaxed text-pretty">{slot.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className={`${container} mt-16 grid gap-14 lg:mt-24 lg:grid-cols-[1fr_2fr] lg:gap-16`}
      >
        <SectionHeading title="Built on what you own" />
        {/* A ruled spec list rather than a grid of boxes: each hairline draws in before its
            feature rises onto it. */}
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className="relative py-6 sm:py-8 [&:first-child>.rule]:hidden sm:[&:nth-child(2)>.rule]:hidden"
            >
              <span
                aria-hidden="true"
                data-reveal="bar"
                style={{ "--i": index % 2 } as CSSProperties}
                className="rule absolute inset-x-0 top-0 h-px bg-white/10"
              />
              <div data-reveal style={{ "--i": (index % 2) + 1 } as CSSProperties}>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty">{feature.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="pricing" className={sectionClass}>
        <SectionHeading
          title="Pricing built around your sites"
          intro="Every business is set up differently. Tell us how many cameras and sites you have, and we’ll put together a price that fits."
        />
        <article
          data-reveal
          className={`${cardClass} mt-14 grid gap-10 border-gold/60! p-6 sm:p-10 md:grid-cols-[1fr_1.3fr] md:gap-16`}
        >
          <div className="flex flex-col">
            <h3 className="font-display text-4xl font-semibold tracking-tight text-text">
              Custom pricing
            </h3>
            <p className="mt-2 text-muted">{pricing.summary}</p>
            <Link href="/talk-to-sales" className={`mt-8 self-start ${primaryButton}`}>
              Talk to sales
            </Link>
          </div>
          <div className="md:border-l md:border-line md:pl-12">
            <h4 className="text-sm font-semibold text-text">What your plan can include</h4>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {pricing.includes.map((item) => (
                <li key={item} className="flex items-baseline gap-3 border-b border-line py-2.5">
                  <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0 translate-y-px text-muted">
                    <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section id="faq" className={`${sectionClass} grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16`}>
        <SectionHeading title="Questions we get first" />
        <div className="grid content-start gap-3">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              open={index === 0}
              data-reveal
              style={{ "--i": index } as CSSProperties}
              className="faq-item group rounded-card border border-line bg-white/[0.015] px-5 transition-[background-color,border-color] duration-300 open:border-white/15 open:bg-white/[0.035] hover:border-white/15 sm:px-6"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-semibold text-text transition-colors duration-180 hover:text-gold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-gold transition-[transform,background-color] duration-300 ease-calm group-open:rotate-45 group-open:bg-gold/10"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5">
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="faq-answer max-w-[65ch] pb-6 leading-relaxed text-pretty">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section data-ambient className="relative mt-28 overflow-hidden lg:mt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="gold-glow ambient-glow absolute inset-0" />
          <div className="scan-line [--scan-distance:640px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 lg:py-40">
          {/* The visitor's site, framed in the viewfinder: the brackets close in as it arrives. */}
          <div
            aria-hidden="true"
            data-reveal="frame"
            className="footage-corners pointer-events-none absolute inset-x-4 inset-y-14 [--len:32px] sm:inset-x-6 lg:inset-y-20 lg:[--len:44px]"
          />
          <h2
            data-reveal="focus"
            className="text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-6xl"
          >
            Are your cameras ready?
          </h2>
          <p data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-6 text-lg text-pretty sm:text-xl">
            Tell us about your setup and we’ll check compatibility.
          </p>
          <div
            data-reveal
            style={{ "--i": 2 } as CSSProperties}
            className="mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-2 sm:flex-row"
          >
            <Link href="/demo" className={`${primaryButton} w-full sm:w-auto`}>
              Book a demo
            </Link>
            <Link href="/check" className={textLink}>
              Check my cameras
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
