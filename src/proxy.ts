import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Next.js 16 proxy (replaces middleware). Must export a single `proxy`
 * function — a default export plus `export { auth as proxy }` is ignored
 * and the matcher never applies, so /api/* 404s.
 */
const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
  const session = await auth();
  if (session?.user && session.error !== "RefreshFailed") {
    return NextResponse.next();
  }

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  login.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
