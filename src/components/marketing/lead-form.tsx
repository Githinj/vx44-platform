"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import {
  DVR_BRANDS,
  DVR_PASSWORD_OPTIONS,
  type LeadFieldErrors,
  type LeadResponse,
} from "@/lib/leads/options";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { rich } from "@/i18n/format";
import { CalendlyBooking } from "./calendly-booking";
import { cardClass, fieldClass, primaryButton } from "./styles";
import { TurnstileWidget } from "./turnstile-widget";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const inputClass = `${fieldClass} aria-invalid:border-red`;

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  className?: string;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
};

function Field({ name, label, error, className, children }: FieldProps) {
  const id = `lead-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      {children({
        id,
        name,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red">
          {error}
        </p>
      )}
    </div>
  );
}

type LeadFormProps = {
  locale: Locale;
  t: Dictionary["leadForm"];
  options: Dictionary["options"];
  calendly: Dictionary["calendly"];
  privacyHref: string;
};

// Server messages are in English, so the form shows its own translated text for each outcome.
function messageFor(status: number, t: LeadFormProps["t"]) {
  if (status === 422) return t.errors.checkFields;
  if (status === 429) return t.errors.tooMany;
  if (status === 403) return t.errors.securityCheck;
  return t.errors.generic;
}

export function LeadForm({ t, options, calendly, privacyHref }: LeadFormProps) {
  const [token, setToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // Kept after a successful request so the booking calendar can be filled in for them.
  const [submitted, setSubmitted] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({});
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (submitted) confirmationRef.current?.focus();
  }, [submitted]);

  // Answers from /check arrive in the URL. Only known values are applied.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams(window.location.search);

    const brand = params.get("dvrBrand");
    const brandField = form.elements.namedItem("dvrBrand");
    if (brandField instanceof HTMLSelectElement && DVR_BRANDS.some((option) => option === brand)) {
      brandField.value = brand as string;
    }

    const cameras = Number(params.get("cameraCount"));
    const camerasField = form.elements.namedItem("cameraCount");
    if (camerasField instanceof HTMLInputElement && Number.isInteger(cameras) && cameras >= 1 && cameras <= 100000) {
      camerasField.value = String(cameras);
    }

    const password = params.get("adminAccess");
    if (DVR_PASSWORD_OPTIONS.some((option) => option.value === password)) {
      const radio = form.querySelector<HTMLInputElement>(`input[name="knowsDvrPassword"][value="${password}"]`);
      if (radio) radio.checked = true;
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!token) {
      setError(t.errors.securityCheck);
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const fields = Object.fromEntries(new FormData(event.currentTarget));
    let result: LeadResponse;
    let status = 0;
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, turnstileToken: token }),
      });
      status = response.status;
      result = (await response.json()) as LeadResponse;
    } catch {
      result = {
        ok: false,
        error: t.errors.network,
      };
    }

    setSubmitting(false);
    if (result.ok) {
      setSubmitted({ name: String(fields.fullName ?? ""), email: String(fields.email ?? "") });
      return;
    }

    setError(status === 0 ? result.error : messageFor(status, t));
    const translated: LeadFieldErrors = {};
    for (const field of Object.keys(result.fieldErrors ?? {})) {
      translated[field] = t.errors.fields[field as keyof typeof t.errors.fields] ?? t.errors.checkFields;
    }
    setFieldErrors(translated);
    setToken("");
    setTurnstileReset((count) => count + 1);
  }

  if (submitted) {
    return (
      <div role="status" className={`${cardClass} p-8`}>
        <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.14em] text-green">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
          {t.received}
        </p>
        <h2 ref={confirmationRef} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight outline-none">
          {t.thanks}
        </h2>
        <p className="mt-3 text-pretty">
          {t.thanksBody}
        </p>
        <CalendlyBooking t={calendly} prefill={submitted} className="mt-6" />
      </div>
    );
  }

  // Without the bot check the form can't send, so visitors book a time directly instead.
  if (!siteKey) {
    return (
      <div className={`${cardClass} p-3 sm:p-8`}>
        <h2 className="px-2 pt-2 text-xl font-semibold sm:p-0">{t.pickTime}</h2>
        <p className="mt-2 px-2 text-pretty sm:p-0">
          {t.pickTimeBody}
        </p>
        <CalendlyBooking t={calendly} className="mt-6" />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`${cardClass} grid gap-5 p-5 sm:grid-cols-2 sm:p-8`}
    >
      <Field name="fullName" label={t.name} error={fieldErrors.fullName}>
        {(props) => <input {...props} className={inputClass} required maxLength={120} autoComplete="name" />}
      </Field>
      <Field name="businessName" label={t.business} error={fieldErrors.businessName}>
        {(props) => <input {...props} className={inputClass} required maxLength={160} autoComplete="organization" />}
      </Field>
      <Field name="email" label={t.email} error={fieldErrors.email}>
        {(props) => <input {...props} className={inputClass} type="email" required maxLength={254} autoComplete="email" />}
      </Field>
      <Field name="phone" label={t.phone} error={fieldErrors.phone}>
        {(props) => <input {...props} className={inputClass} type="tel" required maxLength={32} autoComplete="tel" />}
      </Field>
      <Field name="city" label={t.city} error={fieldErrors.city}>
        {(props) => <input {...props} className={inputClass} required maxLength={120} autoComplete="address-level2" />}
      </Field>
      <Field name="state" label={t.state} error={fieldErrors.state}>
        {(props) => <input {...props} className={inputClass} required maxLength={80} autoComplete="address-level1" />}
      </Field>
      <Field name="cameraCount" label={t.cameras} error={fieldErrors.cameraCount}>
        {(props) => <input {...props} className={inputClass} type="number" inputMode="numeric" required min={1} max={100000} step={1} />}
      </Field>
      <Field name="dvrBrand" label={t.brand} error={fieldErrors.dvrBrand}>
        {(props) => (
          <select {...props} className={`${inputClass} [&>option]:bg-ink`} required defaultValue="">
            <option value="" disabled>
              {t.selectBrand}
            </option>
            {DVR_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {options.brands[brand]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <fieldset className="sm:col-span-2" aria-describedby="lead-password-hint">
        <legend className="text-sm font-medium text-text">
          {t.passwordLegend}
        </legend>
        <div className="mt-1 flex flex-wrap gap-x-6">
          {DVR_PASSWORD_OPTIONS.map((option) => (
            <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-2 text-text">
              <input
                type="radio"
                name="knowsDvrPassword"
                value={option.value}
                required
                className="size-4 accent-gold"
              />
              {options.password[option.value]}
            </label>
          ))}
        </div>
        <p id="lead-password-hint" className="mt-2 text-sm text-muted">
          {t.passwordHint}
        </p>
        {fieldErrors.knowsDvrPassword && (
          <p className="mt-1.5 text-sm text-red">{fieldErrors.knowsDvrPassword}</p>
        )}
      </fieldset>

      <Field name="message" label={t.message} error={fieldErrors.message} className="sm:col-span-2">
        {(props) => <textarea {...props} className={inputClass} rows={4} maxLength={4000} />}
      </Field>

      <div className="sm:col-span-2">
        <TurnstileWidget siteKey={siteKey} onToken={setToken} resetKey={turnstileReset} />
      </div>

      <div className="sm:col-span-2">
        {error && (
          <p role="alert" className="mb-4 text-sm text-red">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className={`${primaryButton} w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 sm:w-auto`}
        >
          {submitting ? t.sending : t.submit}
        </button>
        <p className="mt-3 text-sm text-muted">
          {rich(t.privacyNote, {
            link: (
              <a href={privacyHref} className="underline underline-offset-4 hover:text-text">
                {t.privacyLink}
              </a>
            ),
          })}
        </p>
      </div>
    </form>
  );
}
