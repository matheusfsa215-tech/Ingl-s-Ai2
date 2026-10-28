import { NextResponse, type NextRequest } from "next/server";

export const LEARNER_COOKIE = "fluentia_learner";

export function middleware(request: NextRequest) {
  const existing = request.cookies.get(LEARNER_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const id = globalThis.crypto?.randomUUID?.() ?? `learner-${Date.now()}`;
  const headers = new Headers(request.headers);
  const cookieHeader = headers.get("cookie");
  headers.set(
    "cookie",
    `${cookieHeader ? `${cookieHeader}; ` : ""}${LEARNER_COOKIE}=${id}`,
  );

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(LEARNER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
