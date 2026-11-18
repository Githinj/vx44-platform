import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/app/en";
import { newPasswordSchema, passwordErrorKey } from "@/lib/password";
import { detailsSchema } from "@/lib/portal/account";

// The portal Account page: validation, and the two actions with the session and Supabase stubbed.

const update = vi.fn();
const eq = vi.fn();
const updateUser = vi.fn();
const reauthenticate = vi.fn();

const supabase = {
  from: (table: string) => ({
    update: (values: unknown) => {
      update(table, values);
      return { eq: async (column: string, value: string) => (eq(column, value), { error: null }) };
    },
  }),
  auth: { updateUser, reauthenticate },
};

vi.mock("@/lib/auth", () => ({
  requireClient: async () => ({ supabase, user: { id: "user-1", email: "sam@example.com" } }),
}));
vi.mock("@/i18n/app-text", () => ({
  getAppText: async () => ({ locale: "en", t: en, format: "en-US" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { changePassword, updateDetails } = await import("@/app/(app)/portal/actions");

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
}

beforeEach(() => {
  update.mockReset();
  eq.mockReset();
  updateUser.mockReset().mockResolvedValue({ data: {}, error: null });
  reauthenticate.mockReset().mockResolvedValue({ data: {}, error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("detailsSchema", () => {
  it("trims values and stores blanks as null", () => {
    expect(detailsSchema.parse({ full_name: "  Sam Lee ", phone: "" })).toEqual({
      full_name: "Sam Lee",
      phone: null,
    });
  });

  it("refuses a phone number that isn't one", () => {
    const result = detailsSchema.safeParse({ full_name: "", phone: "call me" });
    expect(result.error?.issues[0].message).toBe("validPhone");
  });
});

describe("newPasswordSchema", () => {
  it.each([
    [{ password: "short", confirm: "short" }, "passwordShort"],
    [{ password: "x".repeat(73), confirm: "x".repeat(73) }, "passwordLong"],
    [{ password: "long enough 1", confirm: "long enough 2" }, "passwordMismatch"],
  ])("refuses %o with %s", (input, message) => {
    expect(newPasswordSchema.safeParse(input).error?.issues[0].message).toBe(message);
  });

  it("keeps spaces in a password", () => {
    expect(newPasswordSchema.parse({ password: " spaced out ", confirm: " spaced out " }).password).toBe(
      " spaced out ",
    );
  });
});

describe("passwordErrorKey", () => {
  it("names the refusals a client can fix and nothing else", () => {
    expect(passwordErrorKey("same_password")).toBe("passwordSame");
    expect(passwordErrorKey("weak_password")).toBe("passwordWeak");
    expect(passwordErrorKey("over_request_rate_limit")).toBeNull();
    expect(passwordErrorKey(undefined)).toBeNull();
  });
});

describe("updateDetails", () => {
  it("updates only the signed-in client's name and phone", async () => {
    const state = await updateDetails({}, form({ full_name: "Sam Lee", phone: "+1 555 0100", role: "admin" }));

    expect(state).toEqual({ saved: en.common.saved });
    expect(update).toHaveBeenCalledWith("profiles", { full_name: "Sam Lee", phone: "+1 555 0100" });
    expect(eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("saves nothing when the phone number is invalid", async () => {
    const state = await updateDetails({}, form({ full_name: "Sam", phone: "nope" }));
    expect(state).toEqual({ error: en.errors.validPhone });
    expect(update).not.toHaveBeenCalled();
  });
});

describe("changePassword", () => {
  it("sets the new password", async () => {
    const state = await changePassword({}, form({ password: "correct horse", confirm: "correct horse" }));
    expect(state).toEqual({ saved: en.account.passwordChanged });
    expect(updateUser).toHaveBeenCalledWith({ password: "correct horse" });
    // With Supabase's secure password change off, or after a recent sign-in, no code is asked for.
    expect(reauthenticate).not.toHaveBeenCalled();
  });

  it("checks the two entries match before asking Supabase", async () => {
    const state = await changePassword({}, form({ password: "correct horse", confirm: "correct house" }));
    expect(state).toEqual({ error: en.errors.passwordMismatch });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("explains a password Supabase refuses as weak", async () => {
    updateUser.mockResolvedValue({ data: {}, error: { code: "weak_password", message: "weak" } });
    const state = await changePassword({}, form({ password: "aaaaaaaaaa", confirm: "aaaaaaaaaa" }));
    expect(state).toEqual({ error: en.errors.passwordWeak });
  });

  it("falls back to a general message for anything unexpected", async () => {
    updateUser.mockResolvedValue({ data: {}, error: { code: "unexpected_failure", message: "boom" } });
    const state = await changePassword({}, form({ password: "correct horse", confirm: "correct horse" }));
    expect(state).toEqual({ error: en.errors.saveFailed });
  });
});

// Supabase's "secure password change" (off unless Morris turns it on): once a session is more than
// a day old, Supabase refuses a new password until the person enters a code it emails them.
describe("changePassword with secure password change on", () => {
  const passwords = { password: "correct horse", confirm: "correct horse" };

  it("emails a code when Supabase asks the person to confirm it's them", async () => {
    updateUser.mockResolvedValue({ data: {}, error: { code: "reauthentication_needed", message: "needed" } });
    const state = await changePassword({}, form(passwords));
    expect(reauthenticate).toHaveBeenCalledTimes(1);
    expect(state).toEqual({ codeSent: true, notice: en.account.reauthSent });
  });

  it("sends the emailed code with the new password", async () => {
    const state = await changePassword({ codeSent: true }, form({ ...passwords, nonce: " 123456 " }));
    expect(updateUser).toHaveBeenCalledWith({ password: "correct horse", nonce: "123456" });
    expect(state).toEqual({ saved: en.account.passwordChanged });
    expect(reauthenticate).not.toHaveBeenCalled();
  });

  it("keeps asking for the code when it's wrong, without emailing another", async () => {
    updateUser.mockResolvedValue({ data: {}, error: { code: "reauthentication_not_valid", message: "wrong" } });
    const state = await changePassword({ codeSent: true }, form({ ...passwords, nonce: "000000" }));
    expect(state).toEqual({ codeSent: true, error: en.errors.reauthCodeWrong });
    expect(reauthenticate).not.toHaveBeenCalled();
  });

  it("refuses a code that isn't digits before asking Supabase", async () => {
    const state = await changePassword({ codeSent: true }, form({ ...passwords, nonce: "12ab" }));
    expect(state).toEqual({ codeSent: true, error: en.errors.reauthCodeWrong });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("emails a new code on request, and changes nothing yet", async () => {
    const state = await changePassword({ codeSent: true }, form({ ...passwords, nonce: "", resend: "1" }));
    expect(reauthenticate).toHaveBeenCalledTimes(1);
    expect(updateUser).not.toHaveBeenCalled();
    expect(state).toEqual({ codeSent: true, notice: en.account.reauthResent });
  });

  it("says so when the code can't be emailed", async () => {
    updateUser.mockResolvedValue({ data: {}, error: { code: "reauthentication_needed", message: "needed" } });
    reauthenticate.mockResolvedValue({ data: {}, error: { code: "over_email_send_rate_limit", message: "slow down" } });
    const state = await changePassword({}, form(passwords));
    expect(state).toEqual({ error: en.errors.reauthSendFailed });
  });
});
