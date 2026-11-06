"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { DVR_BRANDS, DVR_PASSWORD_OPTIONS } from "@/lib/leads/options";

type Brand = (typeof DVR_BRANDS)[number];
type Password = (typeof DVR_PASSWORD_OPTIONS)[number]["value"];
type Answers = { brand: Brand; cameras: number; password: Password };

const SUPPORTED: Brand[] = ["Hikvision", "Dahua"];

const inputClass =
  "mt-2 w-full border border-white/20 bg-panel px-3 py-2.5 text-base text-text placeholder:text-muted focus:border-gold focus:outline-none";

// The answers go to the demo form through the URL, so nothing is stored or sent until the
// visitor chooses to book.
function demoHref({ brand, cameras, password }: Answers) {
  const params = new URLSearchParams({
    dvrBrand: brand,
    cameraCount: String(cameras),
    // Not "password": URL scrubbers redact that name, and this only says yes, no or not sure.
    adminAccess: password,
  });
  return `/demo?${params}`;
}

function Result({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const supported = SUPPORTED.includes(answers.brand);
  const passwordKnown = answers.password === "yes";

  return (
    <div role="status" className="border border-line bg-[#0b111d] p-5 sm:p-8">
      <p className={`flex items-center gap-2 font-mono text-[13px] tracking-[0.14em] ${supported ? "text-green" : "text-gold"}`}>
        <span aria-hidden="true" className={`size-1.5 rounded-full ${supported ? "bg-green" : "bg-gold"}`} />
        {supported ? "LOOKS COMPATIBLE" : "NEEDS A QUICK CHECK"}
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight text-balance outline-none">
        {supported
          ? `Good news: VX44 is built for ${answers.brand} DVRs.`
          : "We’ll check your system before you commit to anything."}
      </h2>
      <ul className="mt-6 space-y-3 leading-relaxed">
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
          {supported
            ? "We still confirm every system with a compatibility check before you’re approved."
            : "Send us the details and we’ll run a compatibility check on your DVR."}
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
          {passwordKnown
            ? "You know your DVR admin password, which is what setup usually needs."
            : "Setup usually needs your DVR admin password. That’s common, and we’ll talk through the options."}
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
          {`Plans are priced per camera, so your price depends on how many of your ${answers.cameras} ${answers.cameras === 1 ? "camera" : "cameras"} you put under monitoring.`}
        </li>
      </ul>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={demoHref(answers)}
          className="bg-gold px-6 py-3.5 text-center font-semibold text-ink transition hover:brightness-110 active:brightness-90"
        >
          Book a demo with these details
        </Link>
        <button type="button" onClick={onRestart} className="text-text underline underline-offset-4 hover:text-gold">
          Change my answers
        </button>
      </div>
    </div>
  );
}

export function CameraCheck() {
  const [answers, setAnswers] = useState<Answers | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setAnswers({
      brand: data.get("brand") as Brand,
      cameras: Number(data.get("cameras")),
      password: data.get("password") as Password,
    });
  }

  if (answers) return <Result answers={answers} onRestart={() => setAnswers(null)} />;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 border border-line bg-[#0b111d] p-5 sm:p-8">
      <fieldset>
        <legend className="text-sm font-medium text-text">1. What brand is your DVR or NVR?</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DVR_BRANDS.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2 border border-white/15 px-3 py-3 text-text has-checked:border-gold">
              <input type="radio" name="brand" value={brand} required className="size-4 accent-gold" />
              {brand}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">The brand name is usually printed on the front of the recorder.</p>
      </fieldset>

      <div>
        <label htmlFor="check-cameras" className="text-sm font-medium text-text">
          2. Roughly how many cameras do you have?
        </label>
        <input
          id="check-cameras"
          name="cameras"
          type="number"
          inputMode="numeric"
          required
          min={1}
          max={100000}
          step={1}
          className={`${inputClass} max-w-40`}
        />
      </div>

      <fieldset aria-describedby="check-password-hint">
        <legend className="text-sm font-medium text-text">3. Do you know your DVR admin password?</legend>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {DVR_PASSWORD_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-text">
              <input type="radio" name="password" value={option.value} required className="size-4 accent-gold" />
              {option.label}
            </label>
          ))}
        </div>
        <p id="check-password-hint" className="mt-2 text-sm text-muted">
          Just yes or no. We never ask for the password itself.
        </p>
      </fieldset>

      <button
        type="submit"
        className="justify-self-start bg-gold px-6 py-3.5 font-semibold text-ink transition hover:brightness-110 active:brightness-90"
      >
        Check my cameras
      </button>
    </form>
  );
}
