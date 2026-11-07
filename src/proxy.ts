import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { publicPages } from "@/content/seo";
import { defaultLocale, isLocale, localeCookie, localePath, type Locale } from "@/i18n/config";

const pagePaths = new Set(publicPages.map((page) => page.path));

// Serves a known page in a language, or that language's 404 page with a real 404 status. Without
// this, an unknown address would stream as a 200 before the app noticed it was missing.
function serve(request: NextRequest, locale: Locale, path: string) {
  const url = request.nextUrl.clone();
  if (pagePaths.has(path) || path.includes("opengraph-image")) {
    url.pathname = `/${locale}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }
  url.pathname = `/${locale}/not-found-page`;
  return NextResponse.rewrite(url, { status: 404 });
}

const appPaths = ["/admin", "/login", "/auth", "/no-access"];

function isAppPath(pathname: string) {
  return appPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// The best supported language from the Accept-Language header, if any beats English.
function preferredLocale(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { base } of ranked) {
    if (base === defaultLocale) return undefined;
    if (isLocale(base)) return base;
  }
  return undefined;
}

// Refreshes the session cookie and turns signed-out visitors away from /admin early. The real
// checks are requireAdmin() on the server and row level security in the database.
async function appProxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn = false;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  }

  if (!signedIn && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAppPath(pathname)) return appProxy(request);

  const first = pathname.split("/")[1];

  // English has no prefix: /en/demo is sent to /demo. Generated image routes are left alone.
  if (first === defaultLocale && !pathname.includes("opengraph-image")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Another language's prefix.
  if (isLocale(first)) {
    const path = `/${pathname.split("/").slice(2).join("/")}`;
    return serve(request, first, path);
  }

  // The homepage follows the language the visitor picked (the cookie) or, on a first visit, the
  // browser's language. Picking English in the selector stores "en", which stops the redirect.
  if (pathname === "/") {
    const saved = request.cookies.get(localeCookie)?.value;
    const preferred = saved
      ? isLocale(saved) && saved !== defaultLocale
        ? saved
        : undefined
      : preferredLocale(request.headers.get("accept-language"));
    if (preferred) {
      const url = request.nextUrl.clone();
      url.pathname = localePath(preferred, "/");
      const response = NextResponse.redirect(url, 307);
      response.cookies.set(localeCookie, preferred, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      return response;
    }
  }

  // Unprefixed public paths are the English pages.
  return serve(request, defaultLocale, pathname);
}

export const config = {
  // Everything except Next.js internals, the API and files with an extension (footage, icons,
  // robots.txt, sitemap.xml).
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};

