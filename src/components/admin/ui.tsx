import type { ReactNode } from "react";

export const inputClass =
  "mt-1.5 w-full rounded-lg border border-white/20 bg-panel px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none disabled:opacity-60";
export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110 active:brightness-90 disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-white/8 px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/14 active:bg-white/10 disabled:opacity-60";
export const tableClass = "w-full min-w-max border-collapse text-start text-sm";
export const thClass = "border-b border-line px-3 py-2 text-start font-medium whitespace-nowrap text-muted";
export const tdClass = "border-b border-line px-3 py-2.5 align-top";

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold tracking-[-0.02em]">{children}</h1>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-panel p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="mt-6 text-sm text-muted">{label}</p>;
}

type FieldProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, className, children }: FieldProps) {
  return (
    <label className={`block text-sm font-medium text-text ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  options: readonly string[];
  defaultValue?: string | null;
  /** Translated label for each stored value. */
  labels?: Record<string, string>;
  /** Shows an "Any" choice first, labelled with this text. */
  emptyLabel?: string;
  className?: string;
};

export function SelectField({ label, name, options, defaultValue, labels, emptyLabel, className }: SelectFieldProps) {
  return (
    <Field label={label} className={className}>
      <select name={name} defaultValue={defaultValue ?? ""} className={inputClass}>
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={option} value={option} className="bg-ink">
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </Field>
  );
}

// Dates and money are formatted in the admin's language. `tag` comes from getAppText().format.
export function formatDate(value: string | null | undefined, tag = "en-US") {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(value: string, tag = "en-US") {
  return `${new Date(value).toLocaleString(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  })} UTC`;
}

export function formatMoney(value: number, tag = "en-US") {
  return value.toLocaleString(tag, { style: "currency", currency: "USD" });
}
