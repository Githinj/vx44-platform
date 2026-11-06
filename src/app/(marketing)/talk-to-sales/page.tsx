import type { Metadata } from "next";
import { pageHeading } from "@/components/marketing/styles";
import { CalendlyBooking } from "@/components/marketing/calendly-booking";

export const metadata: Metadata = {
  title: "Talk to sales",
  description:
    "Book a 30-minute call with VX44 to get pricing built around your cameras and sites.",
};

const bringAlong = [
  "How many cameras you have",
  "How many sites they cover",
  "The brand of your DVR or NVR, if you know it",
];

export default function TalkToSalesPage() {
  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className={`hero-rise ${pageHeading}`}>
            Get pricing for your sites
          </h1>
          <p className="mt-5 text-lg text-pretty">
            Pick a time for a 30-minute call. We’ll learn about your setup and put together a price
            that fits.
          </p>
          <h2 className="mt-12 text-xl font-semibold">Helpful to have ready</h2>
          <ul className="mt-4 space-y-3 leading-relaxed">
            {bringAlong.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-line bg-panel p-3 sm:p-8">
          <CalendlyBooking />
        </div>
      </div>
    </main>
  );
}
