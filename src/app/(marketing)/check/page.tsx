import type { Metadata } from "next";
import { pageHeading } from "@/components/marketing/styles";
import { CameraCheck } from "@/components/marketing/camera-check";

export const metadata: Metadata = {
  title: "Check my cameras",
  description: "Three quick questions to see whether VX44 works with the cameras and DVR you already have.",
};

export default function CheckPage() {
  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className={`hero-rise ${pageHeading}`}>
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
