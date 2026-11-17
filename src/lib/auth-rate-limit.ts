import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { getRateLimitEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

// Per-visitor limits on password sign-in and the emailed sign-in link (SEC-241 review).
//
// Both run on the server, so Supabase's own per-IP limits see the server's address, not each
// visitor's: one person could use up everyone's allowance, or send a client sign-in emails until
// the email limit is reached. These count each visitor, by a hashed IP as on the lead form, in two
// ways:
// - per visitor and email address: stops guessing one account from one place, and leaves room for
//   a few typos. A limit on the address alone would let anyone lock a client out.
// - per visitor on its own: a looser cap on one visitor trying many addresses. It's left off for
//   the local machine or an unknown address, which only a local test server sends (production
//   always knows the visitor's address), so the browser tests aren't throttled.
// Counts use the lead form's table and check_lead_rate_limit, so there's no new migration.

export type AuthAttempt = "sign-in" | "link";

type Limit = { max: number; windowSeconds: number };

export const AUTH_LIMITS: Record<AuthAttempt, { perAddress: Limit; perVisitor: Limit }> = {
  "sign-in": { perAddress: { max: 10, windowSeconds: 15 * 60 }, perVisitor: { max: 30, windowSeconds: 15 * 60 } },
  link: { perAddress: { max: 3, windowSeconds: 60 * 60 }, perVisitor: { max: 10, windowSeconds: 60 * 60 } },
};

/** The visitor's address, as Vercel passes it on. */
export function clientIp(requestHeaders: Headers): string | null {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || requestHeaders.get("x-real-ip");
}

const LOCAL = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/** The checks for one attempt: each a hashed key, so neither the address nor the email is stored. */
export function limitChecks(kind: AuthAttempt, ip: string | null, email: string, salt: string) {
  const hash = (value: string) => createHmac("sha256", salt).update(value).digest("hex").slice(0, 32);
  const visitor = ip ?? "unknown";
  const limits = AUTH_LIMITS[kind];
  const checks = [{ key: `${kind}:${hash(`${visitor}|${email.trim().toLowerCase()}`)}`, ...limits.perAddress }];
  if (ip && !LOCAL.has(ip)) checks.push({ key: `${kind}-visitor:${hash(visitor)}`, ...limits.perVisitor });
  return checks;
}

/**
 * Counts one attempt and says whether it's allowed. If the limit can't be checked (no secrets, or
 * the database doesn't answer), it allows it: a hiccup there mustn't lock everyone out.
 */
export async function allowAuthAttempt(kind: AuthAttempt, email: string): Promise<boolean> {
  let env;
  try {
    env = getRateLimitEnv();
  } catch (error) {
    console.error("Sign-in limit not checked:", error instanceof Error ? error.message : error);
    return true;
  }
  const supabase = createAdminClient(env);
  const ip = clientIp(await headers());
  for (const check of limitChecks(kind, ip, email, env.RATE_LIMIT_SALT)) {
    const { data, error } = await supabase.rpc("check_lead_rate_limit", {
      p_key: check.key,
      p_limit: check.max,
      p_window_seconds: check.windowSeconds,
    });
    if (error) {
      console.error("Sign-in limit check failed:", error.message);
      return true;
    }
    if (data === false) return false;
  }
  return true;
}
