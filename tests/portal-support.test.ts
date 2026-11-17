import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/app/en";
import { buildSupportEmail } from "@/lib/email";
import { supportOrganization, supportSchema } from "@/lib/portal/support";

// The portal's support form: validation, the email it builds, and the server action with the
// session, the database and SendGrid stubbed.

const ORG_A = { id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Lee Tyres" };
const ORG_B = { id: "bbbbbbbb-0000-4000-8000-000000000002", name: "Lee Tyres North" };

let organizations: { id: string; name: string }[];
// What the database's support limit answers (supabase/migrations/20261117190000_support_rate_limit.sql).
let limit: { data: boolean | null; error: { message: string } | null };
let limitCalls: string[];

const supabase = {
  rpc: async (name: string) => {
    limitCalls.push(name);
    return limit;
  },
  from: (table: string) => {
    if (table === "client_organizations") {
      return { select: async () => ({ data: organizations, error: null }) };
    }
    return {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { full_name: "Sam Lee", phone: "555-0100" }, error: null }),
        }),
      }),
    };
  },
};

vi.mock("@/lib/auth", () => ({
  requireClient: async () => ({ supabase, user: { id: "user-1", email: "sam@example.com" } }),
}));
vi.mock("@/i18n/app-text", () => ({
  getAppText: async () => ({ locale: "en", t: en, format: "en-US" }),
}));

const { sendSupportMessage } = await import("@/app/(app)/portal/actions");

let fetchMock: ReturnType<typeof vi.fn>;
let sendgridStatus: number;

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
}

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
  vi.stubEnv("SENDGRID_API_KEY", "sendgrid-key");
  vi.stubEnv("SENDGRID_FROM_EMAIL", "hello@vx44ai.com");
  vi.stubEnv("ADMIN_EMAILS", "one@vx44ai.com, two@vx44ai.com");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "turnstile-secret");
  vi.stubEnv("RATE_LIMIT_SALT", "0123456789abcdef");

  organizations = [ORG_A];
  limit = { data: true, error: null };
  limitCalls = [];
  sendgridStatus = 202;
  fetchMock = vi.fn(async () => new Response(null, { status: sendgridStatus }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("supportSchema", () => {
  it("trims the message and asks for one when it's blank", () => {
    expect(supportSchema.parse({ message: "  Camera 2 is offline  " }).message).toBe("Camera 2 is offline");
    const blank = supportSchema.safeParse({ message: "   " });
    expect(blank.success).toBe(false);
    expect(blank.error?.issues[0].message).toBe("writeMessage");
  });

  it("refuses a message over 5,000 characters", () => {
    const long = supportSchema.safeParse({ message: "x".repeat(5001) });
    expect(long.error?.issues[0].message).toBe("messageTooLong");
  });
});

describe("supportOrganization", () => {
  it("uses the only organization when none is picked", () => {
    expect(supportOrganization([ORG_A], undefined)).toBe(ORG_A);
  });

  it("needs a pick when there are several, and only accepts the client's own", () => {
    expect(supportOrganization([ORG_A, ORG_B], undefined)).toBeNull();
    expect(supportOrganization([ORG_A, ORG_B], ORG_B.id)).toBe(ORG_B);
    expect(supportOrganization([ORG_A], ORG_B.id)).toBeNull();
  });
});

describe("buildSupportEmail", () => {
  it("escapes HTML in the message and keeps the subject on one line", () => {
    const { html, subject, text } = buildSupportEmail({
      organization: "Evil\r\nBcc: x@x.com",
      name: null,
      email: "sam@example.com",
      phone: null,
      message: `<script>alert("x")</script>`,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).not.toMatch(/[\r\n]/);
    expect(text).toContain("Phone: (none)");
  });
});

describe("sendSupportMessage", () => {
  it("emails both admins, with replies going to the client", async () => {
    const state = await sendSupportMessage({}, form({ message: "Camera 2 has been offline since Monday." }));

    expect(state).toEqual({ saved: en.portal.supportSent });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("sendgrid");
    const mail = JSON.parse(request.body);
    expect(mail.personalizations[0].to).toEqual([
      { email: "one@vx44ai.com" },
      { email: "two@vx44ai.com" },
    ]);
    expect(mail.reply_to).toEqual({ email: "sam@example.com", name: "Sam Lee" });
    expect(mail.subject).toBe("Support request: Lee Tyres");
    expect(mail.content[0].value).toContain("Camera 2 has been offline since Monday.");
    expect(mail.content[0].value).toContain("Phone: 555-0100");
  });

  it("sends nothing when the message is empty", async () => {
    const state = await sendSupportMessage({}, form({ message: " " }));
    expect(state).toEqual({ error: en.errors.writeMessage });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses an organization the client doesn't belong to", async () => {
    const state = await sendSupportMessage({}, form({ org_id: ORG_B.id, message: "Hello" }));
    expect(state).toEqual({ error: en.errors.checkForm });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the organization the client picked when they have several", async () => {
    organizations = [ORG_A, ORG_B];
    await sendSupportMessage({}, form({ org_id: ORG_B.id, message: "Hello" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).toBe("Support request: Lee Tyres North");
  });

  it("tells the client when the email can't be sent", async () => {
    sendgridStatus = 400;
    const state = await sendSupportMessage({}, form({ message: "Hello" }));
    expect(state).toEqual({ error: en.errors.sendFailed });
  });

  // SEC-241 review: each message emails the admins, so the database allows 5 an hour per person.
  it("counts each valid message against the hourly limit before sending it", async () => {
    await sendSupportMessage({}, form({ message: "Hello" }));
    expect(limitCalls).toEqual(["check_support_rate_limit"]);
    await sendSupportMessage({}, form({ message: " " }));
    expect(limitCalls).toHaveLength(1);
  });

  it("sends nothing over the limit, and says why", async () => {
    limit = { data: false, error: null };
    const state = await sendSupportMessage({}, form({ message: "Hello again" }));
    expect(state).toEqual({ error: en.errors.tooManyMessages });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends nothing when the limit can't be checked", async () => {
    limit = { data: null, error: { message: "connection refused" } };
    const state = await sendSupportMessage({}, form({ message: "Hello" }));
    expect(state).toEqual({ error: en.errors.sendFailed });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
