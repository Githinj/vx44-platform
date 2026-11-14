import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// External origins the site loads from. Add one only when a CSP violation in the browser
// console names it, and say which feature needs it.
const turnstile = "https://challenges.cloudflare.com"; // bot check on the lead form
const calendlyScript = "https://assets.calendly.com"; // booking widget script
const calendlyFrame = "https://calendly.com"; // booking widget iframe

// Content Security Policy (SEC-266). It limits where scripts, frames, media and form posts can
// come from, and blocks framing, plugins and <base> changes. It still allows inline scripts:
// Next streams page data in inline <script> tags, and the public pages are static, so
// per-request nonces aren't available (tested 2026-11-14: a strict script-src with the
// experimental `sri` option still blocked those inline scripts). See docs/frontend-standards.md.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${turnstile} ${calendlyScript}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  `frame-src ${turnstile} ${calendlyFrame}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Client documents are limited to 4 MB, so allow that plus the form's other fields.
    serverActions: { bodySizeLimit: "4.2mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
