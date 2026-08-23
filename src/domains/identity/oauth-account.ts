import type { Account } from "next-auth";
import { prisma } from "@/lib/db";

function oauthAccountFields(account: Account) {
  return {
    type: account.type,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token ?? null,
    access_token: account.access_token ?? null,
    expires_at: account.expires_at ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    id_token: account.id_token ?? null,
    session_state:
      typeof account.session_state === "string" ? account.session_state : null,
  };
}

/**
 * Upsert a Google/Apple login onto the existing User + Account models.
 * Same-email accounts are linked so credentials and OAuth share one user.
 */
export async function persistOAuthLogin(input: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  account: Account;
}): Promise<string | null> {
  const { account } = input;
  if (!account.provider || !account.providerAccountId) return null;

  const linked = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      },
    },
  });

  if (linked) {
    await prisma.user.update({
      where: { id: linked.userId },
      data: {
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    return linked.userId;
  }

  const email = input.email?.trim().toLowerCase();
  if (!email) return null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.account.create({
      data: { userId: existing.id, ...oauthAccountFields(account) },
    });
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        status: "ACTIVE",
        emailVerified: existing.emailVerified ?? new Date(),
        name: existing.name ?? input.name ?? undefined,
        image: existing.image ?? input.image ?? undefined,
      },
    });
    return existing.id;
  }

  const created = await prisma.user.create({
    data: {
      email,
      name: input.name,
      image: input.image,
      emailVerified: new Date(),
      status: "ACTIVE",
      accounts: { create: oauthAccountFields(account) },
    },
  });

  return created.id;
}
