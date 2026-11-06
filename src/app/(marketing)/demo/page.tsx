import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { LeadForm } from "@/components/marketing/lead-form";
import { pageHeading } from "@/components/marketing/styles";

export const metadata: Metadata = {
  alternates: { canonical: "/demo" },
  title: "Book a demo",
  description: "Book a VX44 demo and find out whether your existing cameras are compatible.",
};

const nextSteps = [
  "We review your details and run a compatibility check on your DVR.",
  "We show you how monitoring works and put together pricing for your cameras and sites.",
  "Once you’re approved, we ship a cloud adapter for your DVR and get you live.",
];

export default function DemoPage() {
  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className={`hero-focus ${pageHeading}`}>Let’s check your cameras</h1>
          <p className="hero-rise mt-5 text-lg text-pretty" style={{ "--i": 1 } as CSSProperties}>
            Tell us a little about your site and the system you have now.
          </p>
          <h2 className="hero-rise mt-12 text-xl font-semibold" style={{ "--i": 2 } as CSSProperties}>
            What happens next
          </h2>
          {/* A short vertical track: the order is the information, so the steps keep numbers. */}
          <ol className="relative mt-6 space-y-7 before:absolute before:top-2 before:bottom-2 before:left-[0.9375rem] before:w-px before:bg-line">
            {nextSteps.map((step, index) => (
              <li
                key={step}
                className="hero-rise relative flex gap-5"
                style={{ "--i": index + 3 } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-ink font-mono text-[13px] text-gold"
                >
                  {index + 1}
                </span>
                <span className="pt-1 leading-relaxed text-pretty">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="hero-rise" style={{ "--i": 2 } as CSSProperties}>
          <LeadForm />
        </div>
      </div>
    </main>
  );
}
