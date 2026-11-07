"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import { DVR_BRANDS, DVR_PASSWORD_OPTIONS } from "@/lib/leads/options";
import { cardClass, fieldClass, primaryButton, textLink } from "./styles";

type Brand = (typeof DVR_BRANDS)[number];
type Password = (typeof DVR_PASSWORD_OPTIONS)[number]["value"];
type Answers = { brand: Brand; cameras: number; password: Password };

const SUPPORTED: Brand[] = ["Hikvision", "Dahua"];

const inputClass = fieldClass;

// The answers go to the demo form through the URL, so nothing is stored or sent until the
// visitor chooses to book.
function demoHref(demoPath: string, { brand, cameras, password }: Answers) {
  const params = new URLSearchParams({
    dvrBrand: brand,
    cameraCount: String(cameras),
    // Not "password": URL scrubbers redact that name, and this only says yes, no or not sure.
    adminAccess: password,
  });
  return `${demoPath}?${params}`;
}

type CheckText = Dictionary["check"];
type OptionText = Dictionary["options"];

function Result({
  answers,
  onRestart,
  t,
  options,
  demoPath,
}: {
  answers: Answers;
  onRestart: () => void;
  t: CheckText;
  options: OptionText;
  demoPath: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const supported = SUPPORTED.includes(answers.brand);
  const passwordKnown = answers.password === "yes";

  return (
    <div role="status" className={`${cardClass} p-5 sm:p-8`}>
      <p className={`flex items-center gap-2 font-mono text-[13px] tracking-[0.14em] ${supported ? "text-green" : "text-gold"}`}>
        <span aria-hidden="true" className={`size-1.5 rounded-full ${supported ? "bg-green" : "bg-gold"}`} />
        {supported ? t.compatible : t.needsCheck}
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight text-balance outline-none">
        {supported ? fill(t.goodNews, { brand: options.brands[answers.brand] }) : t.weWillCheck}
      </h2>
      <ul className="mt-6 space-y-3 leading-relaxed">
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
          {supported ? t.stillConfirm : t.sendDetails}
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
          {passwordKnown ? t.passwordKnown : t.passwordUnknown}
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
          {fill(t.pricing, { count: answers.cameras })}
        </li>
      </ul>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={demoHref(demoPath, answers)}
          className={primaryButton}
        >
          {t.bookWithDetails}
        </Link>
        <button type="button" onClick={onRestart} className={textLink}>
          {t.changeAnswers}
        </button>
      </div>
    </div>
  );
}

export function CameraCheck({ t, options, demoPath }: { t: CheckText; options: OptionText; demoPath: string }) {
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

  if (answers) {
    return (
      <Result answers={answers} onRestart={() => setAnswers(null)} t={t} options={options} demoPath={demoPath} />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} grid gap-6 p-5 sm:p-8`}>
      <fieldset>
        <legend className="text-sm font-medium text-text">{t.q1}</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DVR_BRANDS.map((brand) => (
            <label key={brand} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-field border border-white/15 bg-white/[0.02] px-3.5 text-text transition-[border-color,background-color] duration-180 hover:border-white/35 has-checked:border-gold has-checked:bg-gold/[0.07]">
              <input type="radio" name="brand" value={brand} required className="size-4 accent-gold" />
              {options.brands[brand]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{t.brandHint}</p>
      </fieldset>

      <div>
        <label htmlFor="check-cameras" className="text-sm font-medium text-text">
          {t.q2}
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
        <legend className="text-sm font-medium text-text">{t.q3}</legend>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {DVR_PASSWORD_OPTIONS.map((option) => (
            <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-2 text-text">
              <input type="radio" name="password" value={option.value} required className="size-4 accent-gold" />
              {options.password[option.value]}
            </label>
          ))}
        </div>
        <p id="check-password-hint" className="mt-2 text-sm text-muted">
          {t.passwordHint}
        </p>
      </fieldset>

      <button
        type="submit"
        className={`${primaryButton} justify-self-start`}
      >
        Check my cameras
      </button>
    </form>
  );
}
