"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminRole } from "@/lib/auth";

export type EnrollState = {
  error?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
};

export type VerifyState = { error?: string };

// A code entered at enrolment and one entered at sign-in go through the same check.
const verifySchema = z.object({
  factorId: z.uuid(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your app."),
});

export async function startEnrollment(): Promise<EnrollState> {
  const { supabase } = await requireAdminRole();

  // An abandoned attempt leaves an unverified factor behind, which would block a new one.
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) return { error: "Setup couldn't start. Please try again." };
  if (factors.totp.length > 0) redirect("/admin/mfa");
  for (const factor of factors.all) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "VX44 admin",
  });
  if (error) {
    console.error("MFA enrolment failed:", error.message);
    return { error: "Setup couldn't start. Please try again." };
  }
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyCode(_state: VerifyState, formData: FormData): Promise<VerifyState> {
  const { supabase } = await requireAdminRole();
  const parsed = verifySchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: "That code didn't work. Check your app and try again." };
  redirect("/admin");
}
