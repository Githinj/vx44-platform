export const DVR_BRANDS = ["Hikvision", "Dahua", "Other", "Not sure"] as const;

export const DVR_PASSWORD_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

export type LeadFieldErrors = Record<string, string>;

export type LeadResponse =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: LeadFieldErrors };
