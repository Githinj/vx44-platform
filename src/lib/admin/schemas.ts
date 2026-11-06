import { z } from "zod";
import {
  BILLING_METHODS,
  LEAD_STATUSES,
  ORG_STATUSES,
  PLAN_NAMES,
  SITE_STATUSES,
  SUBSCRIPTION_STATUSES,
} from "./types";

// HTML forms send blank fields as empty strings; the database stores those as null.
const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

const requiredText = (max = 200) => z.string().trim().min(1, "This field is required").max(max);

const optionalDate = z
  .string()
  .trim()
  .transform((value) => value || null)
  .refine((value) => value === null || !Number.isNaN(Date.parse(value)), "Enter a valid date");

const cameraCount = z.coerce
  .number()
  .int("Camera counts must be whole numbers")
  .min(0, "Camera counts can't be negative")
  .max(100000);

const money = z.coerce.number().min(0, "Amounts can't be negative").max(99999999);

export const leadUpdateSchema = z.object({
  id: z.uuid(),
  status: z.enum(LEAD_STATUSES),
  notes: optionalText(5000),
});

export const clientSchema = z.object({
  name: requiredText(),
  primary_contact_name: optionalText(200),
  email: z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(z.email("Enter a valid email").nullable()),
  phone: optionalText(50),
  billing_address: optionalText(),
  city: optionalText(100),
  state: optionalText(100),
  country: optionalText(100),
});

export const clientStatusSchema = z.object({ id: z.uuid(), status: z.enum(ORG_STATUSES) });
export const clientNotesSchema = z.object({ id: z.uuid(), notes: optionalText(10000) });

// This link opens from the client portal, so it must never be a javascript: or other unsafe URL.
const httpsUrl = z
  .string()
  .trim()
  .transform((value) => value || null)
  .pipe(
    z
      .url({ protocol: /^https$/, error: "Enter a full https:// link" })
      .nullable(),
  );

export const siteSchema = z.object({
  org_id: z.uuid(),
  name: requiredText(),
  address: optionalText(),
  city: optionalText(100),
  state: optionalText(100),
  country: optionalText(100),
  dvr_brand: optionalText(100),
  dvr_model: optionalText(100),
  dvr_password_known: z
    .enum(["", "yes", "no"])
    .transform((value) => (value === "" ? null : value === "yes")),
  camera_count: cameraCount,
  monitoring_hours: optionalText(200),
  provider_customer_ref: optionalText(200),
  cloud_adapter_id: optionalText(200),
  camera_access_url: httpsUrl,
  installed_at: optionalDate,
  status: z.enum(SITE_STATUSES),
});

export const subscriptionSchema = z.object({
  org_id: z.uuid(),
  plan_id: z.uuid("Choose a plan"),
  cameras_billed: cameraCount,
  status: z.enum(SUBSCRIPTION_STATUSES),
  billing_method: z.enum(BILLING_METHODS),
  payment_ref: optionalText(500),
  started_at: optionalDate,
  renews_at: optionalDate,
});

export const planSchema = z.object({
  name: z.enum(PLAN_NAMES),
  price_per_camera_month: money,
  provider_cost_per_camera_month: money,
  active: z.boolean(),
});

export const reconciliationSchema = z.object({
  site_id: z.uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-01$/),
  provider_camera_count: cameraCount,
  matched: z.boolean(),
  note: optionalText(1000),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
