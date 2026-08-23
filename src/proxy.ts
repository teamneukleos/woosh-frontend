import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Next.js 16 proxy (replaces middleware). Uses the edge-safe Auth.js
 * config so /app and /admin require a session before the layout runs.
 */
export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
