import type { Metadata } from "next";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = {
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
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <p className="font-mono text-[13px] tracking-[0.14em] text-gold">BOOK A DEMO</p>
          <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            Let’s check your cameras
          </h1>
          <p className="mt-5 text-lg text-pretty">
            Tell us a little about your site and the system you have now.
          </p>
          <h2 className="mt-12 text-xl font-semibold">What happens next</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed marker:text-gold">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <LeadForm />
      </div>
    </main>
  );
}
