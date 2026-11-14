import "server-only";
import { DVR_PASSWORD_OPTIONS } from "@/lib/leads/options";
import type { LeadInput } from "@/lib/leads/schema";
import type { ServerEnv } from "@/lib/env";

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function leadRows(lead: LeadInput): [string, string][] {
  const passwordAnswer =
    DVR_PASSWORD_OPTIONS.find((option) => option.value === lead.knowsDvrPassword)?.label ??
    lead.knowsDvrPassword;

  return [
    ["Name", lead.fullName],
    ["Business", lead.businessName],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["City", lead.city],
    ["State", lead.state],
    ["Approx. cameras", String(lead.cameraCount)],
    ["DVR brand", lead.dvrBrand],
    ["Knows DVR admin password", passwordAnswer],
    ["Message", lead.message || "(none)"],
  ];
}

type AdminEmail = { subject: string; text: string; html: string };

// A branded email to the admins: a one-line intro, then a table of labelled values. Everything
// from a visitor or client is escaped, and newlines are stripped from the subject because it is a
// single header line.
function adminEmail(subject: string, intro: string, rows: [string, string][]): AdminEmail {
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#05080F">
  <p style="font-size:18px;font-weight:700;margin:0 0 4px">VX<span style="color:#CFA23A">44</span> AI Monitoring</p>
  <p style="margin:0 0 16px">${escapeHtml(intro)}</p>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="color:#555;vertical-align:top">${escapeHtml(label)}</td><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>
</div>`;
  return { subject: subject.replace(/[\r\n]+/g, " "), text, html };
}

export function buildLeadEmail(lead: LeadInput) {
  return adminEmail(
    `New lead: ${lead.businessName} (${lead.city}, ${lead.state})`,
    "New lead from the website.",
    leadRows(lead),
  );
}

/** A message a signed-in client sent from the portal's Support page. */
export type SupportMessage = {
  organization: string;
  name: string | null;
  email: string;
  phone: string | null;
  message: string;
};

export function buildSupportEmail(support: SupportMessage) {
  return adminEmail(`Support request: ${support.organization}`, "Support request from the client portal.", [
    ["Business", support.organization],
    ["From", support.name || "(no name on the account)"],
    ["Email", support.email],
    ["Phone", support.phone || "(none)"],
    ["Message", support.message],
  ]);
}

// The sender waits while this runs, so two attempts at most, each with its own timeout.
const ATTEMPTS = 2;
const ATTEMPT_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 500;

/** Whether another attempt could succeed: rate limits and server errors are temporary. */
function isTemporary(status: number): boolean {
  return status === 429 || status >= 500;
}

export async function sendLeadEmail(lead: LeadInput, env: ServerEnv): Promise<void> {
  await sendToAdmins(buildLeadEmail(lead), { email: lead.email, name: lead.fullName }, env);
}

export async function sendSupportEmail(support: SupportMessage, env: ServerEnv): Promise<void> {
  await sendToAdmins(
    buildSupportEmail(support),
    { email: support.email, name: support.name || support.organization },
    env,
  );
}

// Sends to every address in ADMIN_EMAILS, with replies going to the person who wrote in. Throws if
// SendGrid doesn't accept the email.
async function sendToAdmins(
  { subject, text, html }: AdminEmail,
  replyTo: { email: string; name: string },
  env: ServerEnv,
): Promise<void> {
  const body = JSON.stringify({
    personalizations: [{ to: env.ADMIN_EMAILS.map((email) => ({ email })) }],
    from: { email: env.SENDGRID_FROM_EMAIL, name: "VX44 AI Monitoring" },
    reply_to: replyTo,
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
  });

  for (let attempt = 1; ; attempt++) {
    let failure: Error;
    let response: Response | undefined;
    try {
      response = await fetch(SENDGRID_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
    } catch (error) {
      // Network failure or timeout: worth one more try.
      failure = error instanceof Error ? error : new Error(String(error));
    }

    if (response) {
      if (response.ok) return;
      failure = new Error(`SendGrid returned ${response.status}`);
      // A rejected key or sender (other 4xx) fails the same way every time.
      if (!isTemporary(response.status)) throw failure;
    }

    if (attempt >= ATTEMPTS) throw failure!;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}
