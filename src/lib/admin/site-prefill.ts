// Turning a lead into a client used to copy the contact details but leave its camera details only
// in the client's notes, so the admin typed them again into "Add a site" (SEC-280 round 2). The
// client page pre-fills its first site from the lead it came from; the admin checks and saves.

export type LeadForSite = {
  business_name: string;
  city: string | null;
  state: string | null;
  camera_count_estimate: number | null;
  dvr_brand: string | null;
  knows_dvr_password: string | null;
};

export type SitePrefill = {
  name: string;
  city: string | null;
  state: string | null;
  camera_count: number;
  dvr_brand: string | null;
  dvr_password_known: boolean | null;
};

// Lead form answers that aren't a brand.
const NOT_A_BRAND = new Set(["Other", "Not sure"]);

export function sitePrefillFromLead(lead: LeadForSite): SitePrefill {
  return {
    name: lead.business_name,
    city: lead.city,
    state: lead.state,
    camera_count: lead.camera_count_estimate ?? 0,
    dvr_brand: lead.dvr_brand && !NOT_A_BRAND.has(lead.dvr_brand) ? lead.dvr_brand : null,
    dvr_password_known: lead.knows_dvr_password === "yes" ? true : lead.knows_dvr_password === "no" ? false : null,
  };
}
