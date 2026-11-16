import { requireClient } from "@/lib/auth";

// Every portal page except the two-step verification code page (/portal/mfa, outside this group).
// The full client check runs here, before anything streams, so a client who turned on two-step
// verification but hasn't entered a code gets a real redirect to /portal/mfa straight away,
// rather than once the page has started streaming. The pages still call requireClient()
// themselves (cached per request), since a layout doesn't re-run on every navigation.
export default async function SignedInPortalLayout({ children }: { children: React.ReactNode }) {
  await requireClient();
  return children;
}
