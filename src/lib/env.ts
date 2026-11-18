import "server-only";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1),
  SENDGRID_FROM_EMAIL: z.email(),
  ADMIN_EMAILS: z
    .string()
    .transform((value) => value.split(",").map((email) => email.trim()).filter(Boolean))
    .pipe(z.array(z.email()).min(1)),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RATE_LIMIT_SALT: z.string().min(16),
});

export type ServerEnv = z.infer<typeof envSchema>;

const serviceRoleSchema = envSchema.pick({ SUPABASE_URL: true, SUPABASE_SERVICE_ROLE_KEY: true });

export type ServiceRoleEnv = z.infer<typeof serviceRoleSchema>;

/** Just what the service-role client needs, for features that don't send email or check bots. */
export function getServiceRoleEnv(): ServiceRoleEnv {
  const result = serviceRoleSchema.safeParse(process.env);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${names}`);
  }
  return result.data;
}

// Read per request rather than at import, so `next build` works without secrets present.
export function getServerEnv(): ServerEnv {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${names}`);
  }
  return result.data;
}

const rateLimitEnvSchema = envSchema.pick({ SUPABASE_URL: true, SUPABASE_SERVICE_ROLE_KEY: true, RATE_LIMIT_SALT: true });

export type RateLimitEnv = z.infer<typeof rateLimitEnvSchema>;

// Just what the sign-in limits need (src/lib/auth-rate-limit.ts), so signing in doesn't depend on
// the email or Turnstile secrets.
export function getRateLimitEnv(): RateLimitEnv {
  const result = rateLimitEnvSchema.safeParse(process.env);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${names}`);
  }
  return result.data;
}
