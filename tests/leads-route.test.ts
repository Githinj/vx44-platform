import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/leads/route";
import { buildLeadEmail } from "@/lib/email";
import { leadSchema } from "@/lib/leads/schema";

const rpc = vi.fn();
const insert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc,
    from: () => ({ insert: (row: unknown) => ({ select: () => ({ single: () => insert(row) }) }) }),
  }),
}));

const validLead = {
  fullName: "Dana Reyes",
  businessName: "Reyes Tires",
  email: "Dana@Example.com",
  phone: "(512) 555-0100",
  city: "Austin",
  state: "TX",
  cameraCount: "8",
  dvrBrand: "Hikvision",
  knowsDvrPassword: "unsure",
  message: "",
  turnstileToken: "token",
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

let turnstileSuccess: boolean;
let sendgridStatus: number;
let fetchMock: ReturnType<typeof vi.fn>;

function callsTo(host: string) {
  return fetchMock.mock.calls.filter(([url]) => String(url).includes(host));
}

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
  vi.stubEnv("SENDGRID_API_KEY", "sendgrid-key");
  vi.stubEnv("SENDGRID_FROM_EMAIL", "leads@vx44ai.com");
  vi.stubEnv("ADMIN_EMAILS", "one@vx44ai.com, two@vx44ai.com");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "turnstile-secret");
  vi.stubEnv("RATE_LIMIT_SALT", "0123456789abcdef");

  turnstileSuccess = true;
  sendgridStatus = 202;
  rpc.mockReset().mockResolvedValue({ data: true, error: null });
  insert.mockReset().mockResolvedValue({ data: { id: "lead-1" }, error: null });
  fetchMock = vi.fn(async (url: string) =>
    String(url).includes("turnstile")
      ? Response.json({ success: turnstileSuccess })
      : new Response(null, { status: sendgridStatus }),
  );
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/leads", () => {
  it("saves a valid lead and emails both admins", async () => {
    const response = await post(validLead);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      full_name: "Dana Reyes",
      business_name: "Reyes Tires",
      email: "dana@example.com",
      phone: "(512) 555-0100",
      city: "Austin",
      state: "TX",
      camera_count_estimate: 8,
      dvr_brand: "Hikvision",
      knows_dvr_password: "unsure",
      message: null,
      source: "website",
    });

    const [[, request]] = callsTo("sendgrid");
    const mail = JSON.parse(request.body);
    expect(request.headers.Authorization).toBe("Bearer sendgrid-key");
    expect(mail.personalizations[0].to).toEqual([
      { email: "one@vx44ai.com" },
      { email: "two@vx44ai.com" },
    ]);
    expect(mail.from.email).toBe("leads@vx44ai.com");
    expect(mail.reply_to.email).toBe("dana@example.com");
    expect(mail.content[0].value).toContain("Approx. cameras: 8");
    expect(mail.content[0].value).toContain("Knows DVR admin password: Not sure");
  });

  it("hashes the first forwarded IP and never sends it raw to the database", async () => {
    await post(validLead);

    const [, args] = rpc.mock.calls[0];
    expect(args.p_key).toMatch(/^[0-9a-f]{64}$/);
    expect(args.p_key).not.toContain("203.0.113.9");
    const [[, verify]] = callsTo("turnstile");
    expect(verify.body.get("remoteip")).toBe("203.0.113.9");
  });

  it("returns field errors for invalid input and doesn't touch external services", async () => {
    const response = await post({ ...validLead, email: "nope", cameraCount: "0", dvrBrand: "Sony" });

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(Object.keys(body.fieldErrors).sort()).toEqual(["cameraCount", "dvrBrand", "email"]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a body that isn't JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("rejects a missing Turnstile token", async () => {
    const response = await post({ ...validLead, turnstileToken: undefined });

    expect(response.status).toBe(422);
    expect((await response.json()).fieldErrors.turnstileToken).toBeTruthy();
  });

  it("rejects a failed Turnstile check before writing anything", async () => {
    turnstileSuccess = false;
    const response = await post(validLead);

    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("fails closed when Turnstile can't be reached", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    const response = await post(validLead);

    expect(response.status).toBe(500);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 429 once rate limited, without inserting or emailing", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const response = await post(validLead);

    expect(response.status).toBe(429);
    expect(insert).not.toHaveBeenCalled();
    expect(callsTo("sendgrid")).toHaveLength(0);
  });

  it("returns 500 and sends no email when the insert fails", async () => {
    insert.mockResolvedValue({ data: null, error: { message: "db down" } });
    const response = await post(validLead);

    expect(response.status).toBe(500);
    expect(callsTo("sendgrid")).toHaveLength(0);
  });

  it("still confirms when the lead saved but the email failed, and logs the lead id", async () => {
    sendgridStatus = 500;
    const response = await post(validLead);

    expect(response.status).toBe(201);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("lead-1"),
      expect.anything(),
    );
  });

  it("returns a generic 500 without leaking config when env vars are missing", async () => {
    vi.stubEnv("SENDGRID_API_KEY", "");
    const response = await post(validLead);

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("SENDGRID");
  });
});

describe("buildLeadEmail", () => {
  it("escapes HTML in visitor input and keeps the subject on one line", () => {
    const lead = leadSchema.parse({
      ...validLead,
      businessName: "Evil\r\nBcc: x@x.com",
      message: `<script>alert("x")</script>`,
    });
    const { html, subject } = buildLeadEmail(lead);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).not.toMatch(/[\r\n]/);
  });
});
