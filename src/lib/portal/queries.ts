import "server-only";
import { requireClient } from "@/lib/auth";

// Clients read organizations, sites and plans only through the client_* views, which leave out
// internal columns (admin notes, provider references, provider cost). Read from the base tables,
// those return no rows for a client.

export type PortalOrganization = {
  id: string;
  name: string;
  status: string;
};

export type PortalSite = {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  camera_count: number;
  monitoring_hours: string | null;
  camera_access_url: string | null;
  status: string;
};

export type PortalSubscription = {
  id: string;
  org_id: string;
  cameras_billed: number;
  status: string;
  payment_ref: string | null;
  renews_at: string | null;
  created_at: string;
  /** Null if the plan can't be read, which shouldn't happen for a client's own subscription. */
  plan_name: string | null;
  /** The plan's price per camera per month, in USD. Null if the plan can't be read. */
  price_per_camera: number | null;
};

export type PortalDocument = {
  id: string;
  org_id: string;
  title: string;
  created_at: string;
};

function check<T>({ data, error }: { data: T[] | null; error: { message: string } | null }): T[] {
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadOrganizations(): Promise<PortalOrganization[]> {
  const { supabase } = await requireClient();
  return check(
    await supabase.from("client_organizations").select("id, name, status").order("name").order("id"),
  );
}

export async function loadSites(): Promise<PortalSite[]> {
  const { supabase } = await requireClient();
  return check(
    await supabase
      .from("client_sites")
      .select(
        "id, org_id, name, address, city, state, country, camera_count, monitoring_hours, camera_access_url, status",
      )
      .order("name")
      .order("id"),
  );
}

export async function loadSubscriptions(): Promise<PortalSubscription[]> {
  const { supabase } = await requireClient();
  // client_plans is a view with no foreign key to embed, so plans are matched up here.
  const [subscriptions, plans] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, org_id, plan_id, cameras_billed, status, payment_ref, renews_at, created_at")
      .order("created_at", { ascending: false })
      .order("id"),
    supabase.from("client_plans").select("id, name, price_per_camera_month"),
  ]);
  const planById = new Map(
    check<{ id: string; name: string; price_per_camera_month: number | string | null }>(plans).map((plan) => [
      plan.id,
      plan,
    ]),
  );
  return check<Omit<PortalSubscription, "plan_name" | "price_per_camera"> & { plan_id: string }>(subscriptions).map(
    ({ plan_id, ...subscription }) => {
      const plan = planById.get(plan_id);
      // Postgres numeric values can arrive as strings.
      const price = plan?.price_per_camera_month == null ? null : Number(plan.price_per_camera_month);
      return {
        ...subscription,
        plan_name: plan?.name ?? null,
        price_per_camera: price !== null && Number.isFinite(price) ? price : null,
      };
    },
  );
}

export async function loadDocuments(): Promise<PortalDocument[]> {
  const { supabase } = await requireClient();
  return check(
    await supabase
      .from("documents")
      .select("id, org_id, title, created_at")
      .order("created_at", { ascending: false })
      .order("id"),
  );
}
