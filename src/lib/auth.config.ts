import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma / Node adapters).
 * Used by `src/proxy.ts`; full auth lives in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/app") || pathname.startsWith("/admin");
      if (!isProtected) return true;
      if (auth?.error === "RefreshFailed") return false;
      return !!auth?.user;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as "RefreshFailed" | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
