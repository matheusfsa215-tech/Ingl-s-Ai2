import { NextResponse, type NextRequest } from "next/server";

export const LEARNER_COOKIE = "fluentia_learner";

/**
 * Vercel exposes the public production domain (e.g. "iawerewf12.vercel.app") as
 * VERCEL_PROJECT_PRODUCTION_URL. Deployment-specific URLs such as
 * "iawerewf12-4vczje32k-team.vercel.app" are protected by Vercel Authentication,
 * so anyone opening them on another phone gets an e-mail login screen.
 * When the owner lands on one of those URLs in production we send them to the
 * public domain, so the link they copy and share is always the open one.
 */
function canonicalRedirect(request: NextRequest): NextResponse | null {
  const productionHost = (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "").replace(/^https?:\/\//, "");
  if (process.env.VERCEL_ENV !== "production" || !productionHost) return null;

  const host = (request.headers.get("host") ?? "").toLowerCase();
  if (!host || host === productionHost.toLowerCase()) return null;
  if (!host.endsWith(".vercel.app")) return null; // never touch custom domains

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${productionHost}`);
  return NextResponse.redirect(target, 308);
}

export function middleware(request: NextRequest) {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;

  const existing = request.cookies.get(LEARNER_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const id = globalThis.crypto?.randomUUID?.() ?? `learner-${Date.now()}`;
  const headers = new Headers(request.headers);
  const cookieHeader = headers.get("cookie");
  headers.set("cookie", `${cookieHeader ? `${cookieHeader}; ` : ""}${LEARNER_COOKIE}=${id}`);

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(LEARNER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
