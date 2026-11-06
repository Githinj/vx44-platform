export const ORG_STATUSES = [
  "lead",
  "compatibility_check",
  "approved",
  "adapter_shipped",
  "installed",
  "active",
  "paused",
  "cancelled",
] as const;

export const ORG_STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  compatibility_check: "Compatibility check",
  approved: "Approved",
  adapter_shipped: "Adapter shipped",
  installed: "Installed",
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;
export const SITE_STATUSES = ["pending", "online", "offline", "removed"] as const;
export const SUBSCRIPTION_STATUSES = ["trial", "active", "past_due", "paused", "cancelled"] as const;
export const BILLING_METHODS = ["payment_link", "invoice", "stripe"] as const;
export const PLAN_NAMES = ["Essentials", "Monitored", "Multi-site"] as const;

export type Lead = {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  camera_count_estimate: number;
  dvr_brand: string;
  knows_dvr_password: string;
  message: string | null;
  notes: string | null;
  status: string;
  converted_org_id: string | null;
  created_at: string;
};

export type Organization = {
  id: string;
  name: string;
  primary_contact_name: string | null;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type Site = {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  dvr_brand: string | null;
  dvr_model: string | null;
  dvr_password_known: boolean | null;
  camera_count: number;
  monitoring_hours: string | null;
  provider_customer_ref: string | null;
  cloud_adapter_id: string | null;
  camera_access_url: string | null;
  installed_at: string | null;
  status: string;
};

export type Plan = {
  id: string;
  name: string;
  price_per_camera_month: number;
  provider_cost_per_camera_month: number;
  active: boolean;
};

export type Subscription = {
  id: string;
  org_id: string;
  plan_id: string;
  cameras_billed: number;
  status: string;
  billing_method: string;
  payment_ref: string | null;
  started_at: string | null;
  renews_at: string | null;
};

export type Reconciliation = {
  id: string;
  month: string;
  site_id: string;
  our_camera_count: number;
  provider_camera_count: number | null;
  matched: boolean;
  checked_at: string | null;
  note: string | null;
};
