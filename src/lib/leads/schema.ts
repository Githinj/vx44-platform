import { z } from "zod";
import { DVR_BRANDS, DVR_PASSWORD_OPTIONS } from "./options";

const passwordValues = DVR_PASSWORD_OPTIONS.map((option) => option.value) as [
  (typeof DVR_PASSWORD_OPTIONS)[number]["value"],
  ...(typeof DVR_PASSWORD_OPTIONS)[number]["value"][],
];

function requiredText(label: string, max: number) {
  return z
    .string({ error: `Enter your ${label}.` })
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(max, `Keep your ${label} under ${max} characters.`);
}

export const leadSchema = z.object({
  fullName: requiredText("name", 120),
  businessName: requiredText("business name", 160),
  email: z
    .string({ error: "Enter a valid email address." })
    .trim()
    .toLowerCase()
    .max(254, "Enter a valid email address.")
    .pipe(z.email("Enter a valid email address.")),
  phone: z
    .string({ error: "Enter a valid phone number." })
    .trim()
    .regex(/^[+()\d\s.-]{7,32}$/, "Enter a valid phone number."),
  city: requiredText("city", 120),
  state: requiredText("state", 80),
  cameraCount: z.coerce
    .number({ error: "Enter roughly how many cameras you have." })
    .int("Enter a whole number of cameras.")
    .min(1, "Enter at least 1 camera.")
    .max(100000, "Enter a smaller number of cameras."),
  dvrBrand: z.enum(DVR_BRANDS, { error: "Choose a DVR brand." }),
  knowsDvrPassword: z.enum(passwordValues, { error: "Choose an answer." }),
  message: z
    .string()
    .trim()
    .max(4000, "Keep your message under 4000 characters.")
    .optional()
    .default(""),
  turnstileToken: z
    .string({ error: "Please complete the security check." })
    .min(1, "Please complete the security check.")
    .max(4096, "Please complete the security check."),
});

export type LeadInput = z.infer<typeof leadSchema>;
