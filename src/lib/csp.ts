// Strict Content Security Policy for the sign-in and back-office pages (SEC-269).
//
// Those pages are rendered per visitor, so each response gets a fresh nonce and only scripts
// carrying it (and scripts they load: 'strict-dynamic') may run; no 'unsafe-inline'. Next.js
// reads the nonce from the forwarded Content-Security-Policy request header and adds it to its
// own scripts. The static public pages keep the looser policy in next.config.ts.
//
// Styles still allow inline: the pages use style attributes (CSS variables), which a nonce
// can't cover. Scripts are what an injected payload needs.

export function newNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function appContentSecurityPolicy(nonce: string, isDev = process.env.NODE_ENV === "development"): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // data: for the MFA setup QR code, which Supabase returns as a data URL.
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/** Paths that get this policy instead of the public one. Must match src/proxy.ts's app paths. */
export const strictCspPaths = ["/admin", "/login", "/auth", "/no-access"];
