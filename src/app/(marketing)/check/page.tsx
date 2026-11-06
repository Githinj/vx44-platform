import type { Metadata } from "next";
import { CameraCheck } from "@/components/marketing/camera-check";

export const metadata: Metadata = {
  alternates: { canonical: "/check" },
  title: "Check my cameras",
  description: "Three quick questions to see whether VX44 works with the cameras and DVR you already have.",
};

export default function CheckPage() {
  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <p className="font-mono text-[13px] tracking-[0.14em] text-gold">CHECK MY CAMERAS</p>
          <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            Will VX44 work with what you have?
          </h1>
          <p className="mt-5 text-lg text-pretty">
            Answer three questions and see straight away. No contact details needed.
          </p>
        </div>
        <CameraCheck />
      </div>
    </main>
  );
}
