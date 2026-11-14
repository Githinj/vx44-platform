import { z } from "zod";

// The client's own details on the portal Account page. Only these two profile columns can be
// changed by a client: the database grants update on (full_name, phone) and nothing else.
// Messages are keys into the translated `errors` (src/i18n/app/en.ts).

// Blank fields arrive as empty strings; the database stores those as null.
const blankToNull = (value: string) => value || null;

export const detailsSchema = z.object({
  full_name: z.string().trim().max(200, "checkForm").transform(blankToNull),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[+()\d\s.-]{7,32}$/.test(value), "validPhone")
    .transform(blankToNull),
});
