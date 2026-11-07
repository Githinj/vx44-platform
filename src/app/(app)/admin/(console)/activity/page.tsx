import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Loading, PageTitle, formatDateTime } from "@/components/admin/ui";
import { type ActivityEntry, describeActivity, describeChanges } from "@/lib/admin/activity";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Activity" };

const FEED_SIZE = 200;

async function ActivityFeed() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, action, created_at, org_id, details, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(FEED_SIZE);
  if (error) throw new Error(error.message);
  const entries = (data ?? []) as unknown as ActivityEntry[];

  if (entries.length === 0) return <p className="mt-6 text-sm text-muted">No activity yet.</p>;

  return (
    <>
      <ul className="mt-6 text-sm">
        {entries.map((entry) => (
          <li key={entry.id} className="border-t border-line py-3">
            <p className="text-text">
              {entry.org_id ? (
                <Link href={`/admin/clients/${entry.org_id}`} className="underline underline-offset-4 hover:text-gold">
                  {describeActivity(entry.action)}
                </Link>
              ) : (
                describeActivity(entry.action)
              )}
              <span className="text-muted"> · {entry.profiles?.full_name ?? entry.profiles?.email ?? "Unknown"} · {formatDateTime(entry.created_at)}</span>
            </p>
            {describeChanges(entry).map((line) => (
              <p key={line} className="mt-0.5 break-words text-muted">{line}</p>
            ))}
          </li>
        ))}
      </ul>
      {entries.length === FEED_SIZE && (
        <p className="mt-4 text-sm text-muted">Showing the latest {FEED_SIZE} entries.</p>
      )}
    </>
  );
}

export default function ActivityPage() {
  return (
    <>
      <PageTitle>Activity</PageTitle>
      <Suspense fallback={<Loading />}>
        <ActivityFeed />
      </Suspense>
    </>
  );
}
