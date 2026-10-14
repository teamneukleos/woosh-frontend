import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import {
  ApiError,
  loginWithPassword,
  logoutNest,
  refreshNestTokens,
  type NestTokens,
} from "@/lib/nest";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshInFlight = new Map<string, Promise<NestTokens>>();

function refreshNestTokensOnce(refreshToken: string) {
  const existing = refreshInFlight.get(refreshToken);
  if (existing) return existing;
  const pending = refreshNestTokens(refreshToken).finally(() => {
    refreshInFlight.delete(refreshToken);
  });
  refreshInFlight.set(refreshToken, pending);
  return pending;
}

function accessStillValid(expires: unknown) {
  const at = typeof expires === "number" ? expires : Number(expires);
  return Number.isFinite(at) && Date.now() < at - 30_000;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        try {
          const { tokens, me } = await loginWithPassword(
            parsed.data.email,
            parsed.data.password,
          );
          return {
            id: me.id,
            email: me.email,
            name: me.name,
            image: me.image,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessExpires: Date.now() + tokens.expiresIn * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id && user.accessToken && user.refreshToken) {
        token.sub = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessExpires = user.accessExpires;
        delete token.error;
        return token;
      }
      if (token.accessToken && accessStillValid(token.accessExpires)) {
        return token;
      }
      if (!token.refreshToken) {
        token.error = "RefreshFailed";
        return token;
      }
      try {
        const refreshToken = String(token.refreshToken);
        const refreshed = await refreshNestTokensOnce(refreshToken);
        token.accessToken = refreshed.accessToken;
        token.refreshToken = refreshed.refreshToken;
        token.accessExpires = Date.now() + refreshed.expiresIn * 1000;
        delete token.error;
        return token;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          token.error = "RefreshFailed";
          delete token.accessToken;
          delete token.refreshToken;
          return token;
        }
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.error = token.error === "RefreshFailed" ? "RefreshFailed" : undefined;
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token =
        "token" in message ? (message.token as { refreshToken?: string }) : null;
      if (token?.refreshToken) await logoutNest(token.refreshToken);
    },
  },
});
