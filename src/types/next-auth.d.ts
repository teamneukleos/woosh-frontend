import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
    accessToken?: string;
    error?: "RefreshFailed";
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessExpires?: number;
    error?: "RefreshFailed";
  }
}
