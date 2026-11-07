import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { FootageSlot } from "@/components/marketing/footage-slot";
import { SectionHeading } from "@/components/marketing/section-heading";
import { StructuredData } from "@/components/marketing/structured-data";
import { cardClass, primaryButton, textLink } from "@/components/marketing/styles";
import { heroFootage, liveAiSlots, stepAccents } from "@/content/site";
import { isLocale, languageAlternates, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { rich } from "@/i18n/format";

// The title and description come from the layout. The canonical tells search engines to index
// this language's address rather than the bare or http:// addresses that redirect here.
export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: { canonical: localePath(lang, "/"), languages: languageAlternates("/") } };
}

const container = "mx-auto max-w-6xl px-4 sm:px-6";
const sectionClass = `${container} mt-28 lg:mt-40`;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const home = t.home;
  const href = (path: string) => localePath(lang, path);

  return (
    <main>
      <StructuredData />
      <section data-ambient className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="ambient-grid" />
          <div className="gold-glow ambient-glow absolute inset-0" />
        </div>
        <div className={`relative ${container} pt-16 pb-20 text-center sm:pt-24 lg:pb-28`}>
          <h1 className="display-tight text-[2.5rem] font-semibold text-balance sm:text-[5.4vw] xl:text-[4.25rem]">
            <span className="hero-focus block">{home.headline[0]}</span>
            <span className="hero-focus block" style={{ "--i": 1 } as CSSProperties}>
              {home.headline[1]}
            </span>
          </h1>
          <p
            className="hero-rise mx-auto mt-8 max-w-2xl text-lg text-pretty sm:text-xl"
            style={{ "--i": 2 } as CSSProperties}
          >
            {home.sub}
          </p>
          <div
            className="hero-rise mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-2 sm:flex-row"
            style={{ "--i": 3 } as CSSProperties}
          >
            <Link href={href("/demo")} className={`${primaryButton} w-full sm:w-auto`}>
              {t.common.bookDemo}
            </Link>
            <Link href={href("/check")} className={textLink}>
              {t.common.checkCameras}
            </Link>
          </div>

          {/* The footage paints immediately: it is the largest element on screen, so delaying it
              would delay Largest Contentful Paint. The boot sweep and the alert card arriving over
              it are the motion. */}
          <div className="relative mt-14 text-start sm:mt-16">
            <div aria-hidden="true" className="desk-glow absolute inset-x-[5%] -bottom-16 h-40" />
            <FootageSlot
              camera={heroFootage.camera}
              src={heroFootage.src}
              poster={heroFootage.poster}
              detection={heroFootage.detection}
              disclosure={t.common.stockFootage}
              priority
              className="shadow-[0_40px_80px_-32px_rgba(0,0,0,0.9)]"
            />
            <div
              data-ui
              className="hero-alert relative mt-3 rounded-card border border-white/10 bg-panel-solid/90 p-4 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md sm:absolute sm:end-6 sm:bottom-6 sm:m-0 sm:w-80 sm:p-5"
            >
              <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-cyan">
                <span aria-hidden="true" className="ping-loop relative size-1.5 rounded-full bg-cyan" />
                AI ALERT · CAM 01
              </p>
              <p className="mt-2 font-display font-semibold text-text">
                {home.alert.event}
              </p>
              {/* The operator's review, shown as a bar that fills before the result lands. */}
              <div aria-hidden="true" className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
                <div className="review-bar h-full rounded-full bg-text/80" />
              </div>
              <p className="hero-verified mt-3 flex items-center gap-2 text-sm text-green">
                <span aria-hidden="true" className="ping-once relative size-1.5 rounded-full bg-green" />
                {home.alert.verified}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={home.compatibilityLabel} className="border-y border-line bg-panel">
        <p className={`${container} py-6 text-center`}>
          {rich(home.compatibility, {
            hikvision: <span className="font-semibold text-text">Hikvision</span>,
            dahua: <span className="font-semibold text-text">Dahua</span>,
            link: (
              <Link
                href={href("/demo")}
                className="text-gold underline underline-offset-4 transition-colors duration-180 hover:text-text"
              >
                {home.compatibilityLink}
              </Link>
            ),
          })}
        </p>
      </section>

      <section id="how-it-works" data-ambient className={sectionClass}>
        <SectionHeading title={home.how.title} intro={home.how.intro} />
        {/* The four bars meet into one line, so the sequence reads as a single track from
            detection to report. They draw in order, then a glint runs along them now and then. */}
        <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-1">
          {home.how.steps.map((step, index) => (
            <li key={index} className="md:pe-6">
              <div
                aria-hidden="true"
                data-reveal="bar"
                style={{ "--i": index } as CSSProperties}
                className={`relative h-1 w-full overflow-hidden rounded-full ${stepAccents[index]}`}
              >
                <span className="track-glint hidden md:block" />
              </div>
              <div data-reveal style={{ "--i": index + 1 } as CSSProperties}>
                <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-[1.0625rem] leading-[1.7] text-pretty">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* The monitor wall: a navy band, the one place Deep Navy takes a whole surface. */}
      <section id="live-ai" className="relative mt-16 py-12 lg:mt-24 lg:py-16">
        <div aria-hidden="true" className="navy-band pointer-events-none absolute inset-x-0 -inset-y-24" />
        <div className={`relative ${container}`}>
          <SectionHeading title={home.live.title} intro={home.live.intro} />
          {/* One frame per row until there is room for three, so the HUD never crowds. */}
          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-5">
            {liveAiSlots.map((slot, index) => (
              <div
                key={slot.camera}
                className="grid gap-5 md:grid-cols-[3fr_2fr] md:items-center md:gap-8 lg:grid-cols-1 lg:items-start lg:gap-0"
              >
                <FootageSlot
                  camera={slot.camera}
                  src={slot.src}
                  poster={slot.poster}
                  detection={slot.detection}
                  disclosure={t.common.stockFootage}
                  reveal
                  index={index}
                />
                <div data-reveal style={{ "--i": index + 2 } as CSSProperties} className="lg:mt-5">
                  <h3 className="text-2xl font-semibold">{home.live.slots[index].title}</h3>
                  <p className="mt-2 text-[1.0625rem] leading-[1.7] text-pretty">{home.live.slots[index].body}</p>
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
        <SectionHeading title={home.features.title} />
        {/* A ruled spec list rather than a grid of boxes: each hairline draws in before its
            feature rises onto it. */}
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {home.features.items.map((feature, index) => (
            <li
              key={index}
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
                <p className="mt-2 text-[1.0625rem] leading-[1.7] text-pretty">{feature.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="pricing" className={sectionClass}>
        <SectionHeading title={home.pricing.title} intro={home.pricing.intro} />
        <article
          data-reveal
          className={`${cardClass} mt-14 grid gap-10 border-gold/60! p-6 sm:p-10 md:grid-cols-[1fr_1.3fr] md:gap-16`}
        >
          <div className="flex flex-col">
            <h3 className="font-display text-4xl font-semibold tracking-tight text-text">
              {home.pricing.cardTitle}
            </h3>
            <p className="mt-2 text-muted">{home.pricing.summary}</p>
            <Link href={href("/talk-to-sales")} className={`mt-8 self-start ${primaryButton}`}>
              {t.common.talkToSales}
            </Link>
          </div>
          <div className="md:border-s md:border-line md:ps-12">
            <h4 className="text-sm font-semibold text-text">{home.pricing.includesTitle}</h4>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {home.pricing.includes.map((item) => (
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
        <SectionHeading title={home.faq.title} />
        <div className="grid content-start gap-3">
          {home.faq.items.map((faq, index) => (
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
              <p className="faq-answer max-w-[62ch] pb-6 text-[1.0625rem] leading-[1.7] text-pretty">{faq.answer}</p>
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
            className="display-tight text-4xl font-semibold text-balance sm:text-6xl"
          >
            {home.cta.title}
          </h2>
          <p data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-6 text-lg text-pretty sm:text-xl">
            {home.cta.body}
          </p>
          <div
            data-reveal
            style={{ "--i": 2 } as CSSProperties}
            className="mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-2 sm:flex-row"
          >
            <Link href={href("/demo")} className={`${primaryButton} w-full sm:w-auto`}>
              {t.common.bookDemo}
            </Link>
            <Link href={href("/check")} className={textLink}>
              {t.common.checkCameras}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
