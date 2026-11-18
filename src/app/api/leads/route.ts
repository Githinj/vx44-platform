import { createHmac } from "node:crypto";
import { clientIp } from "@/lib/client-ip";
import { sendLeadEmail } from "@/lib/email";
import { getServerEnv } from "@/lib/env";
import type { LeadFieldErrors, LeadResponse } from "@/lib/leads/options";
import { leadSchema } from "@/lib/leads/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const GENERIC_ERROR = "We couldn't send your request. Please try again in a moment.";

function reply(body: LeadResponse, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return reply({ ok: false, error: "Invalid request." }, 400);
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: LeadFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      fieldErrors[field] ??= issue.message;
    }
    return reply({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, 422);
  }
  const lead = parsed.data;

  try {
    const env = getServerEnv();
    const ip = clientIp(request.headers);

    const human = await verifyTurnstile(lead.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!human) {
      return reply(
        {
          ok: false,
          error: "The security check failed. Please try it again.",
          fieldErrors: { turnstileToken: "Please complete the security check." },
        },
        403,
      );
    }

    const supabase = createAdminClient(env);

    const ipHash = createHmac("sha256", env.RATE_LIMIT_SALT)
      .update(ip ?? "unknown")
      .digest("hex");
    const { data: allowed, error: rateLimitError } = await supabase.rpc("check_lead_rate_limit", {
      p_key: ipHash,
      p_limit: RATE_LIMIT_MAX,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });
    if (rateLimitError) throw new Error(`Rate limit check failed: ${rateLimitError.message}`);
    if (!allowed) {
      return reply(
        { ok: false, error: "Too many requests from this connection. Please try again later." },
        429,
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("leads")
      .insert({
        full_name: lead.fullName,
        business_name: lead.businessName,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        state: lead.state,
        camera_count_estimate: lead.cameraCount,
        dvr_brand: lead.dvrBrand,
        knows_dvr_password: lead.knowsDvrPassword,
        message: lead.message || null,
        source: "website",
      })
      .select("id")
      .single();
    if (insertError) throw new Error(`Lead insert failed: ${insertError.message}`);

    // The lead is safely stored at this point, so an email failure must not tell the
    // visitor to resubmit. notified_at stays empty, so the back office flags the lead (SEC-258).
    let emailed = false;
    try {
      await sendLeadEmail(lead, env);
      emailed = true;
    } catch (error) {
      console.error(`Lead ${inserted.id} saved but admin email failed:`, error);
    }
    if (emailed) {
      // Best effort: if this write fails, the lead is wrongly flagged as unsent, which is the
      // safe direction. It never turns a saved lead into an error for the visitor.
      try {
        const { error: notifiedError } = await supabase
          .from("leads")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", inserted.id);
        if (notifiedError) throw new Error(notifiedError.message);
      } catch (error) {
        console.error(`Lead ${inserted.id} emailed but notified_at was not saved:`, error);
      }
    }

    return reply({ ok: true }, 201);
  } catch (error) {
    console.error("Lead submission failed:", error);
    return reply({ ok: false, error: GENERIC_ERROR }, 500);
  }
}
