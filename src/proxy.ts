import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Next.js 16 proxy (replaces middleware). Uses the edge-safe Auth.js
 * config so /app and /admin require a session before the layout runs.
 */
const { auth } = NextAuth(authConfig);

export default auth;
export { auth as proxy };

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
