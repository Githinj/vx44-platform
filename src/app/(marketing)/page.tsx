import Link from "next/link";
import { FootageSlot } from "@/components/marketing/footage-slot";
import { SectionHeading } from "@/components/marketing/section-heading";
import { faqs, features, heroFootage, liveAiSlots, placeholders, plans, steps } from "@/content/site";

const primaryButton =
  "inline-flex items-center justify-center bg-gold px-6 py-3.5 font-semibold text-ink transition hover:brightness-110 active:brightness-90";
const secondaryButton =
  "inline-flex items-center justify-center bg-white/8 px-6 py-3.5 font-semibold text-text transition hover:bg-white/14 active:bg-white/10";
const sectionClass = "mx-auto mt-28 max-w-6xl px-4 sm:px-6 lg:mt-40";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="gold-glow absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[5.4vw] xl:text-[4.25rem]">
            <span className="block">Your cameras see everything.</span>
            <span className="block">Now someone’s watching.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-pretty sm:text-xl">
            VX44 adds AI monitoring to the cameras you already own, so what happens at your site
            gets noticed, checked and acted on.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-4 sm:flex-row">
            <Link href="/demo" className={`${primaryButton} w-full sm:w-auto`}>
              Book a demo
            </Link>
            <Link
              href="/demo"
              className="font-semibold text-text underline underline-offset-4 transition hover:text-gold"
            >
              Check my cameras
            </Link>
          </div>

          <div className="relative mt-14 text-left sm:mt-16">
            <FootageSlot
              camera={heroFootage.camera}
              src={heroFootage.src}
              poster={heroFootage.poster}
              detection={heroFootage.detection}
            />
            <div
              data-ui
              className="relative mx-3 -mt-6 border border-line bg-[#0b111d] p-4 shadow-2xl sm:absolute sm:bottom-6 sm:right-6 sm:m-0 sm:w-80"
            >
              <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-cyan">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan" />
                AI ALERT · CAM 01
              </p>
              <p className="mt-2 font-display font-semibold text-text">
                Person detected on the forecourt
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-green">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
                Verified. Site contact notified.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Compatibility" className="bg-panel">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-text sm:px-6">
          Built for existing Hikvision and Dahua DVRs. Other brand?{" "}
          <Link href="/demo" className="text-gold underline underline-offset-4">
            Ask us to check
          </Link>
          .
        </p>
      </section>

      <section id="how-it-works" className={sectionClass}>
        <SectionHeading eyebrow="HOW IT WORKS" title="From motion to a clear answer" />
        <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-1">
          {steps.map((step) => (
            <li key={step.title} className="md:pr-6">
              <div aria-hidden="true" className={`h-1 w-full ${step.accent}`} />
              <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-pretty">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="live-ai" className={sectionClass}>
        <SectionHeading eyebrow="LIVE AI" title="It knows what it’s looking at" />
        <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-4">
          {liveAiSlots.map((slot) => (
            <div key={slot.title}>
              <FootageSlot
                camera={slot.camera}
                src={slot.src}
                poster={slot.poster}
                detection={slot.detection}
              />
              <h3 className="mt-5 text-2xl font-semibold">{slot.title}</h3>
              <p className="mt-2 leading-relaxed text-pretty">{slot.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className={`${sectionClass} grid gap-14 lg:grid-cols-[1fr_2fr] lg:gap-16`}
      >
        <SectionHeading eyebrow="FEATURES" title="Built on what you own" />
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
          eyebrow="PRICING"
          title="Priced per camera, per month"
          intro="Pay for the cameras you put under monitoring. We confirm your price after a compatibility check."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col border bg-panel p-6 sm:p-8 ${
                plan.featured ? "border-gold" : "border-line"
              }`}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-3 leading-relaxed text-pretty">{plan.summary}</p>
              <p className="mt-8 font-display text-4xl font-semibold tracking-tight text-text">
                {placeholders.price}
                <span className="ml-2 font-sans text-sm font-normal tracking-normal text-muted">
                  per camera/month
                </span>
              </p>
              <ul className="mt-8 flex-1 space-y-2.5 text-text">
                {plan.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <Link
                href="/demo"
                className={`mt-10 ${plan.featured ? primaryButton : secondaryButton}`}
              >
                Book a demo
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className={`${sectionClass} grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16`}>
        <SectionHeading eyebrow="FAQ" title="Questions we get first" />
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
