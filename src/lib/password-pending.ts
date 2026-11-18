// An invitee has to choose a password before using the portal (SEC-280 round 2). The "Accept the
// invite" button on /auth/accept sets this cookie when it signs them in, the proxy sends every other
// portal page back
// to /portal/set-password while it's there, and setFirstPassword clears it. Before this, the full
// portal menu was live on the set-password page, so one tap skipped the step and the person had no
// password to sign in with next time.
export const PASSWORD_PENDING_COOKIE = "vx44_password_pending";
export const SET_PASSWORD_PATH = "/portal/set-password";

export function passwordPendingCookie(secure: boolean) {
  return {
    name: PASSWORD_PENDING_COOKIE,
    value: "1",
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/portal",
    // Long enough to cover someone who opens the invite and comes back days later.
    maxAge: 60 * 60 * 24 * 30,
  };
}

/** Whether a request for this portal path must go to the set-password page first. */
export function mustSetPasswordFirst(pathname: string, hasPendingCookie: boolean) {
  if (!hasPendingCookie) return false;
  const inPortal = pathname === "/portal" || pathname.startsWith("/portal/");
  return inPortal && pathname !== SET_PASSWORD_PATH;
}
