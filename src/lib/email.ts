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

export function buildLeadEmail(lead: LeadInput) {
  const rows = leadRows(lead);

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#05080F">
  <p style="font-size:18px;font-weight:700;margin:0 0 4px">VX<span style="color:#CFA23A">44</span> AI Monitoring</p>
  <p style="margin:0 0 16px">New lead from the website.</p>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="color:#555;vertical-align:top">${escapeHtml(label)}</td><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>
</div>`;

  // Newlines are stripped because the subject is a single header line.
  const subject = `New lead: ${lead.businessName} (${lead.city}, ${lead.state})`.replace(
    /[\r\n]+/g,
    " ",
  );

  return { subject, text, html };
}

export async function sendLeadEmail(lead: LeadInput, env: ServerEnv): Promise<void> {
  const { subject, text, html } = buildLeadEmail(lead);

  const response = await fetch(SENDGRID_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: env.ADMIN_EMAILS.map((email) => ({ email })) }],
      from: { email: env.SENDGRID_FROM_EMAIL, name: "VX44 AI Monitoring" },
      reply_to: { email: lead.email, name: lead.fullName },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`SendGrid returned ${response.status}`);
  }
}
