import { notFound } from "next/navigation";
import { connection } from "next/server";

// Any portal address that doesn't exist. Without this, Next.js serves its own prebuilt 404, which
// can't carry the per-request CSP nonce (SEC-269), so its scripts would be blocked. Waiting for
// the request first keeps it out of the prebuilt shell, so the status is a real 404.
export default async function MissingPortalPage() {
  await connection();
  notFound();
}
