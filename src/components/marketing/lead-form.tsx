"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { placeholders } from "@/content/site";
import {
  DVR_BRANDS,
  DVR_PASSWORD_OPTIONS,
  type LeadFieldErrors,
  type LeadResponse,
} from "@/lib/leads/options";
import { TurnstileWidget } from "./turnstile-widget";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const inputClass =
  "mt-2 w-full border border-white/20 bg-panel px-3 py-2.5 text-base text-text placeholder:text-muted focus:border-gold focus:outline-none aria-invalid:border-red";

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

export function LeadForm() {
  const [token, setToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      setError("Please complete the security check.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    let result: LeadResponse;
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(event.currentTarget)),
          turnstileToken: token,
        }),
      });
      result = (await response.json()) as LeadResponse;
    } catch {
      result = {
        ok: false,
        error: "We couldn't reach the server. Check your connection and try again.",
      };
    }

    setSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
      return;
    }

    setError(result.error);
    setFieldErrors(result.fieldErrors ?? {});
    setToken("");
    setTurnstileReset((count) => count + 1);
  }

  if (submitted) {
    return (
      <div role="status" className="border border-line bg-panel p-8">
        <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.14em] text-green">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
          REQUEST RECEIVED
        </p>
        <h2 ref={confirmationRef} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight outline-none">
          Thanks. We’ve got your details.
        </h2>
        <p className="mt-3 text-pretty">
          We’ll be in touch to arrange your demo and check that your cameras are compatible.
        </p>
      </div>
    );
  }

  if (!siteKey) {
    return (
      <div role="alert" className="border border-line bg-panel p-8">
        <h2 className="text-xl font-semibold">This form isn’t available right now.</h2>
        <p className="mt-3">
          Please contact us at {placeholders.contactEmail} or {placeholders.phone}.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-5 border border-line bg-[#0b111d] p-5 sm:grid-cols-2 sm:p-8"
    >
      <Field name="fullName" label="Name" error={fieldErrors.fullName}>
        {(props) => <input {...props} className={inputClass} required maxLength={120} autoComplete="name" />}
      </Field>
      <Field name="businessName" label="Business" error={fieldErrors.businessName}>
        {(props) => <input {...props} className={inputClass} required maxLength={160} autoComplete="organization" />}
      </Field>
      <Field name="email" label="Email" error={fieldErrors.email}>
        {(props) => <input {...props} className={inputClass} type="email" required maxLength={254} autoComplete="email" />}
      </Field>
      <Field name="phone" label="Phone" error={fieldErrors.phone}>
        {(props) => <input {...props} className={inputClass} type="tel" required maxLength={32} autoComplete="tel" />}
      </Field>
      <Field name="city" label="City" error={fieldErrors.city}>
        {(props) => <input {...props} className={inputClass} required maxLength={120} autoComplete="address-level2" />}
      </Field>
      <Field name="state" label="State" error={fieldErrors.state}>
        {(props) => <input {...props} className={inputClass} required maxLength={80} autoComplete="address-level1" />}
      </Field>
      <Field name="cameraCount" label="Approx. cameras" error={fieldErrors.cameraCount}>
        {(props) => <input {...props} className={inputClass} type="number" inputMode="numeric" required min={1} max={100000} step={1} />}
      </Field>
      <Field name="dvrBrand" label="DVR brand" error={fieldErrors.dvrBrand}>
        {(props) => (
          <select {...props} className={`${inputClass} [&>option]:bg-ink`} required defaultValue="">
            <option value="" disabled>
              Select a brand
            </option>
            {DVR_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        )}
      </Field>

      <fieldset className="sm:col-span-2" aria-describedby="lead-password-hint">
        <legend className="text-sm font-medium text-text">
          Do you know your DVR admin password?
        </legend>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {DVR_PASSWORD_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-text">
              <input
                type="radio"
                name="knowsDvrPassword"
                value={option.value}
                required
                className="size-4 accent-gold"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p id="lead-password-hint" className="mt-2 text-sm text-muted">
          Just tell us yes or no. Please don’t send us the password itself.
        </p>
        {fieldErrors.knowsDvrPassword && (
          <p className="mt-1.5 text-sm text-red">{fieldErrors.knowsDvrPassword}</p>
        )}
      </fieldset>

      <Field name="message" label="Message (optional)" error={fieldErrors.message} className="sm:col-span-2">
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
          className="w-full bg-gold px-6 py-3.5 font-semibold text-ink transition hover:brightness-110 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Sending..." : "Book my demo"}
        </button>
        <p className="mt-3 text-sm text-muted">
          We use these details to respond to your request. See our{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-text">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
