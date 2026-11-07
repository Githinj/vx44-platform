import type { Metadata } from "next";
import { Suspense } from "react";
import { savePlan } from "@/app/(app)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import {
  Field,
  Loading,
  PageTitle,
  Panel,
  SectionTitle,
  inputClass,
  secondaryButtonClass,
} from "@/components/admin/ui";
import { PLAN_NAMES, type Plan } from "@/lib/admin/types";
import { getAppText } from "@/i18n/app-text";
import { requireAdmin } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAppText()).t.meta.plans };
}

async function PlanList() {
  const { supabase } = await requireAdmin();
  const { t } = await getAppText();
  const p = t.plans;
  const { data, error } = await supabase.from("plans").select("*");
  if (error) throw new Error(error.message);
  const plans = (data ?? []) as Plan[];

  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-3">
      {PLAN_NAMES.map((name) => {
        const plan = plans.find((candidate) => candidate.name === name);
        return (
          <Panel key={name}>
            <SectionTitle>{name}</SectionTitle>
            {!plan && <p className="mt-1 text-sm text-muted">{p.noPrices}</p>}
            <ActionForm action={savePlan} className="mt-4 grid gap-3">
              <input type="hidden" name="name" value={name} />
              <Field label={p.price}>
                <input name="price_per_camera_month" type="number" min={0} step="0.01" required defaultValue={plan?.price_per_camera_month ?? ""} className={inputClass} />
              </Field>
              <Field label={p.cost}>
                <input name="provider_cost_per_camera_month" type="number" min={0} step="0.01" required defaultValue={plan?.provider_cost_per_camera_month ?? ""} className={inputClass} />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium text-text">
                <input name="active" type="checkbox" defaultChecked={plan?.active ?? true} className="size-4 accent-gold" />
                {p.available}
              </label>
              <button type="submit" className={`${secondaryButtonClass} justify-self-start`}>
                {p.save}
              </button>
            </ActionForm>
          </Panel>
        );
      })}
    </div>
  );
}

export default async function PlansPage() {
  const { t } = await getAppText();
  return (
    <>
      <PageTitle>{t.meta.plans}</PageTitle>
      <Suspense fallback={<Loading label={t.common.loading} />}>
        <PlanList />
      </Suspense>
    </>
  );
}
