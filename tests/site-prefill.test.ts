import { describe, expect, it } from "vitest";
import { type LeadForSite, sitePrefillFromLead } from "@/lib/admin/site-prefill";
import { DVR_BRANDS, DVR_PASSWORD_OPTIONS } from "@/lib/leads/options";

// A converted client's first site starts from the lead form's answers (SEC-280 round 2). The
// client page reads the lead; e2e-admin/admin.spec.ts checks the filled-in form end to end.

const lead: LeadForSite = {
  business_name: "Corner Mart",
  city: "Austin",
  state: "TX",
  camera_count_estimate: 8,
  dvr_brand: "Hikvision",
  knows_dvr_password: "yes",
};

describe("sitePrefillFromLead", () => {
  it("carries the lead's answers over to the site", () => {
    expect(sitePrefillFromLead(lead)).toEqual({
      name: "Corner Mart",
      city: "Austin",
      state: "TX",
      camera_count: 8,
      dvr_brand: "Hikvision",
      dvr_password_known: true,
    });
  });

  it("leaves out answers that aren't a brand", () => {
    expect(sitePrefillFromLead({ ...lead, dvr_brand: "Other" }).dvr_brand).toBeNull();
    expect(sitePrefillFromLead({ ...lead, dvr_brand: "Not sure" }).dvr_brand).toBeNull();
    expect(sitePrefillFromLead({ ...lead, dvr_brand: null }).dvr_brand).toBeNull();
    expect(sitePrefillFromLead({ ...lead, dvr_brand: "Dahua" }).dvr_brand).toBe("Dahua");
  });

  it("knows every brand answer the lead form offers", () => {
    // A new non-brand answer on the form must be added to the list in site-prefill.ts.
    const brands = DVR_BRANDS.map((answer) => sitePrefillFromLead({ ...lead, dvr_brand: answer }).dvr_brand);
    expect(brands).toEqual(["Hikvision", "Dahua", null, null]);
  });

  it("maps every password answer the lead form offers", () => {
    const answers = DVR_PASSWORD_OPTIONS.map(({ value }) => sitePrefillFromLead({ ...lead, knows_dvr_password: value }).dvr_password_known);
    expect(answers).toEqual([true, false, null]);
    expect(sitePrefillFromLead({ ...lead, knows_dvr_password: null }).dvr_password_known).toBeNull();
  });

  it("starts at zero cameras when the lead gave no estimate", () => {
    expect(sitePrefillFromLead({ ...lead, camera_count_estimate: null }).camera_count).toBe(0);
  });
});
