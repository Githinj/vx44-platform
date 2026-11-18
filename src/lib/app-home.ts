/**
 * Where the app tree's error page (src/app/(app)/error.tsx) sends someone, from the path that
 * failed. In the back office, /admin. Everywhere else /portal, which sends a client to the
 * overview, an admin on to /admin and anyone signed out to sign-in. /admin would send a client to
 * "no access". The portal's own error page sits inside the portal layout, so an error in that
 * layout lands on this page too.
 */
export function errorPageHome(pathname: string | null) {
  return pathname === "/admin" || pathname?.startsWith("/admin/") ? "/admin" : "/portal";
}
