import Link from "next/link";
import type { CSSProperties } from "react";
import { FootageSlot } from "@/components/marketing/footage-slot";
import { SectionHeading } from "@/components/marketing/section-heading";
import { StructuredData } from "@/components/marketing/structured-data";
import { primaryButton, textLink } from "@/components/marketing/styles";
import { faqs, features, heroFootage, liveAiSlots, pricing, steps } from "@/content/site";

const sectionClass = "mx-auto mt-28 max-w-6xl px-4 sm:px-6 lg:mt-40";

export default function HomePage() {
  return (
    <main>
      <StructuredData />
      <section data-ambient className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="ambient-grid" />
          <div className="gold-glow ambient-glow absolute inset-0" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[5.4vw] xl:text-[4.25rem]">
            <span className="hero-rise block">Your cameras see everything.</span>
            <span className="hero-rise block" style={{ "--i": 1 } as CSSProperties}>
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

          <div className="hero-rise relative mt-14 text-left sm:mt-16" style={{ "--i": 5 } as CSSProperties}>
            <FootageSlot
              camera={heroFootage.camera}
              src={heroFootage.src}
              poster={heroFootage.poster}
              detection={heroFootage.detection}
            />
            <div
              data-ui
              className="hero-alert relative mt-3 border border-line bg-panel-solid p-4 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] sm:absolute sm:right-6 sm:bottom-6 sm:m-0 sm:w-80"
            >
              <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-cyan">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan" />
                AI ALERT · CAM 01
              </p>
              <p className="mt-2 font-display font-semibold text-text">
                Person detected on the forecourt
              </p>
              <p className="hero-verified mt-2 flex items-center gap-2 text-sm text-green">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
                Verified. Site contact notified.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Compatibility" className="border-y border-line bg-panel">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center sm:px-6">
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

      <section id="how-it-works" className={sectionClass}>
        <SectionHeading title="From motion to a clear answer" />
        {/* The four bars meet into one line, so the sequence reads as a single track from
            detection to report. They draw in order as the section arrives. */}
        <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-1">
          {steps.map((step, index) => (
            <li key={step.title} className="md:pr-6">
              <div
                aria-hidden="true"
                data-reveal="bar"
                style={{ "--i": index } as CSSProperties}
                className={`h-1 w-full ${step.accent}`}
              />
              <div data-reveal style={{ "--i": index + 1 } as CSSProperties}>
                <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-pretty">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="live-ai" className={sectionClass}>
        <SectionHeading title="It knows what it’s looking at" />
        {/* One frame per row until there is room for three, so the HUD never crowds. */}
        <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-4">
          {liveAiSlots.map((slot, index) => (
            <div
              key={slot.title}
              data-reveal
              style={{ "--i": index } as CSSProperties}
              className="grid gap-5 md:grid-cols-[3fr_2fr] md:items-center md:gap-8 lg:grid-cols-1 lg:items-start lg:gap-0"
            >
              <FootageSlot
                camera={slot.camera}
                src={slot.src}
                poster={slot.poster}
                detection={slot.detection}
              />
              <div className="lg:mt-5">
                <h3 className="text-2xl font-semibold">{slot.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty">{slot.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className={`${sectionClass} grid gap-14 lg:grid-cols-[1fr_2fr] lg:gap-16`}
      >
        <SectionHeading title="Built on what you own" />
        <div className="grid gap-x-10 gap-y-10 border border-line bg-panel p-6 sm:grid-cols-2 sm:p-10">
          {features.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-pretty">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className={sectionClass}>
        <SectionHeading
         
          title="Pricing built around your sites"
          intro="Every business is set up differently. Tell us how many cameras and sites you have, and we’ll put together a price that fits."
        />
        <article className="mt-14 grid gap-10 border border-gold bg-panel p-6 sm:p-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <div className="flex flex-col">
            <h3 className="font-display text-4xl font-semibold tracking-tight text-text">
              Custom pricing
            </h3>
            <p className="mt-2 text-muted">{pricing.summary}</p>
            <Link href="/talk-to-sales" className={`mt-8 self-start ${primaryButton}`}>
              Talk to sales
            </Link>
          </div>
          <div>
            <p className="font-mono text-[13px] tracking-[0.14em] text-gold">WHAT YOUR PLAN CAN INCLUDE</p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 text-text sm:grid-cols-2">
              {pricing.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section id="faq" className={`${sectionClass} grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16`}>
        <SectionHeading title="Questions we get first" />
        <div className="space-y-1">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0} className="group bg-panel px-5 py-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-text [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span aria-hidden="true" className="text-xl text-gold transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[65ch] leading-relaxed text-pretty">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative mt-28 overflow-hidden lg:mt-40">
        <div aria-hidden="true" className="gold-glow absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 lg:py-40">
          <h2 className="text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
            Are your cameras ready?
          </h2>
          <p className="mt-6 text-lg text-pretty sm:text-xl">
            Tell us about your setup and we’ll check compatibility.
          </p>
          <Link href="/demo" className={`mt-9 ${primaryButton}`}>
            Book a demo
          </Link>
        </div>
      </section>
    </main>
  );
}
