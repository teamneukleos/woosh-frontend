"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  accountType: z.enum(["creator", "brand", "agency"]),
  terms: z.literal("on"),
});

export type RegisterState = {
  ok: boolean;
  error?: string;
};

export async function registerUser(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType"),
    terms: formData.get("terms") === "on" ? "on" : "",
  });

  if (!parsed.success) {
    return { ok: false, error: "Check name, email, password, and accept the terms." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash,
        status: "PENDING_VERIFICATION",
      },
    });

    if (parsed.data.accountType === "creator") {
      await tx.creatorProfile.create({
        data: {
          userId: user.id,
          displayName: parsed.data.name,
        },
      });
    } else {
      const org = await tx.organisation.create({
        data: {
          type: parsed.data.accountType === "agency" ? "AGENCY" : "BRAND",
          legalName: parsed.data.name,
          publicName: parsed.data.name,
          country: "NG",
        },
      });

      await tx.membership.create({
        data: {
          organisationId: org.id,
          userId: user.id,
          role: "OWNER",
          canApprovePayments: true,
          canEditRates: true,
          canManageTeam: true,
          canExportData: true,
        },
      });

      if (parsed.data.accountType === "brand") {
        const brandRecord = await tx.brand.create({
          data: {
            organisationId: org.id,
            name: parsed.data.name,
            country: "NG",
          },
        });
        await tx.brandMembership.create({
          data: {
            brandId: brandRecord.id,
            userId: user.id,
            role: "OWNER",
          },
        });
      }
    }

    return user;
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const { sendVerificationEmail, acceptTeamInvite } = await import(
      "@/domains/organisation/invites"
    );
    await sendVerificationEmail(user.id);
    await writeAudit({
      actorId: user.id,
      action: "identity.terms.accept",
      targetType: "User",
      targetId: user.id,
      after: { termsVersion: "2026-08-22" },
    });
    const inviteToken = String(formData.get("invite") || "");
    if (inviteToken) {
      try {
        await acceptTeamInvite({ token: inviteToken, userId: user.id });
      } catch {
        /* invite optional */
      }
    }
  }

  return { ok: true };
}
