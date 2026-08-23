import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { sendEmail, createNotification } from "@/lib/notify";
import type { MembershipRole } from "@/generated/prisma/client";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import { hasPermission } from "@/lib/permissions";
import { requireBrandPermission } from "@/domains/work/access";

export async function inviteTeammate(input: {
  organisationId: string;
  email: string;
  role: MembershipRole;
  invitedById: string;
}) {
  const inviter = await prisma.membership.findUnique({
    where: {
      organisationId_userId: {
        organisationId: input.organisationId,
        userId: input.invitedById,
      },
    },
  });
  if (
    !inviter ||
    !hasPermission(inviter.role, "team.manage", inviter)
  ) {
    throw new Error("You do not have permission to manage this team");
  }
  if (
    input.role === "OWNER" ||
    (input.role === "ADMIN" &&
      inviter.role !== "OWNER" &&
      inviter.role !== "ADMIN")
  ) {
    throw new Error("You cannot assign that role");
  }
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  const currentMembership = existing
    ? await prisma.membership.findUnique({
        where: {
          organisationId_userId: {
            organisationId: input.organisationId,
            userId: existing.id,
          },
        },
      })
    : null;
  if (existing?.id === input.invitedById || currentMembership?.role === "OWNER") {
    throw new Error("Use member management to change an existing owner");
  }
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await prisma.teamInvite.create({
    data: {
      organisationId: input.organisationId,
      email,
      role: input.role,
      token,
      invitedById: input.invitedById,
      expiresAt,
    },
  });

  const org = await prisma.organisation.findUnique({
    where: { id: input.organisationId },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const acceptUrl = `${appUrl}/invite?token=${token}`;

  await sendEmail({
    to: email,
    subject: `Join ${org?.publicName ?? "Woosh"} on Woosh`,
    html: `<p>You've been invited to join <strong>${org?.publicName ?? "a workspace"}</strong> as ${input.role}.</p><p><a href="${acceptUrl}">Accept invite</a></p>`,
    text: `Accept invite: ${acceptUrl}`,
  });

  await createNotification({
    userId: input.invitedById,
    type: "team.invite.sent",
    title: "Invite sent",
    body: `Invite emailed to ${email} (${input.role}).`,
    href: "/app/team",
  });

  await writeAudit({
    actorId: input.invitedById,
    action: "organisation.invite.sent",
    targetType: "TeamInvite",
    targetId: invite.id,
    after: { email, role: input.role },
  });

  // If user already exists, attach membership immediately
  if (existing) {
    await prisma.membership.upsert({
      where: {
        organisationId_userId: {
          organisationId: input.organisationId,
          userId: existing.id,
        },
      },
      create: {
        organisationId: input.organisationId,
        userId: existing.id,
        role: input.role,
      },
      update: { role: input.role },
    });
    await prisma.teamInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
    await createNotification({
      userId: existing.id,
      type: "team.invite.accepted",
      title: "You've been added to a workspace",
      body: org?.publicName ?? "Organisation",
      href: "/app",
    });
  }

  return invite;
}

export async function acceptTeamInvite(input: {
  token: string;
  userId: string;
}) {
  const invite = await prisma.teamInvite.findUnique({
    where: { token: input.token },
  });
  if (!invite) throw new Error("Invite not found");
  if (invite.expiresAt < new Date()) throw new Error("Invite expired");
  if (invite.acceptedAt) return invite;

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error("Invite email does not match this account");
  }

  await prisma.membership.upsert({
    where: {
      organisationId_userId: {
        organisationId: invite.organisationId,
        userId: input.userId,
      },
    },
    create: {
      organisationId: invite.organisationId,
      userId: input.userId,
      role: invite.role,
    },
    update: { role: invite.role },
  });

  return prisma.teamInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });
}

export async function inviteToBrief(input: {
  briefId: string;
  creatorProfileId: string;
  message?: string;
  actorUserId: string;
}) {
  const brief = await prisma.brief.findUnique({
    where: { id: input.briefId },
    include: { brand: true },
  });
  if (!brief) throw new Error("Brief not found");
  await requireBrandPermission(
    input.actorUserId,
    brief.brandId,
    "briefs.manage",
  );

  const invite = await prisma.briefInvitation.upsert({
    where: {
      briefId_creatorProfileId: {
        briefId: input.briefId,
        creatorProfileId: input.creatorProfileId,
      },
    },
    create: {
      briefId: input.briefId,
      creatorProfileId: input.creatorProfileId,
      message: input.message,
      status: "SENT",
    },
    update: {
      message: input.message,
      status: "SENT",
    },
  });

  const creator = await prisma.creatorProfile.findUnique({
    where: { id: input.creatorProfileId },
    include: { user: true },
  });

  if (creator) {
    await createNotification({
      userId: creator.userId,
      type: "brief.invited",
      title: "You're invited to a brief",
      body: `${brief.brand.name}: ${brief.title}`,
      href: `/app/jobs/${brief.id}`,
    });
  }

  await writeAudit({
    actorId: input.actorUserId,
    action: "brief.invite",
    targetType: "BriefInvitation",
    targetId: invite.id,
  });
  await recordAnalyticsEvent({
    eventType: "INVITE_SENT",
    actorUserId: input.actorUserId,
    brandId: brief.brandId,
    creatorProfileId: input.creatorProfileId,
    briefId: brief.id,
  });

  return invite;
}

export async function sendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({
    where: { identifier: `verify:${user.email}` },
  });
  await prisma.verificationToken.create({
    data: {
      identifier: `verify:${user.email}`,
      token,
      expires,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your Woosh email",
    html: `<p>Confirm your email to activate your account.</p><p><a href="${link}">Verify email</a></p>`,
    text: link,
  });
}

export async function requestVerificationEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, emailVerified: true, status: true },
  });

  // Keep the public response indistinguishable for unknown and active accounts.
  if (!user || user.emailVerified || user.status !== "PENDING_VERIFICATION") {
    return;
  }
  const recent = await prisma.verificationToken.findFirst({
    where: {
      identifier: `verify:${normalizedEmail}`,
      expires: { gt: new Date(Date.now() + 23 * 60 * 60 * 1000) },
    },
    select: { token: true },
  });
  if (recent) return;

  await sendVerificationEmail(user.id);
}

export async function verifyEmailToken(email: string, token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record || record.identifier !== `verify:${email}`) {
    throw new Error("Invalid verification token");
  }
  if (record.expires < new Date()) throw new Error("Token expired");

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });
  await prisma.verificationToken.delete({ where: { token } });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return; // don't leak
  const recent = await prisma.verificationToken.findFirst({
    where: {
      identifier: `reset:${user.email}`,
      expires: { gt: new Date(Date.now() + 55 * 60 * 1000) },
    },
    select: { token: true },
  });
  if (recent) return;

  const token = randomBytes(24).toString("hex");
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${user.email}` },
  });
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${user.email}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/login?reset=${token}&email=${encodeURIComponent(user.email)}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Woosh password",
    html: `<p><a href="${link}">Reset password</a> (expires in 1 hour)</p>`,
    text: link,
  });
}

export async function resetPassword(input: {
  email: string;
  token: string;
  newPassword: string;
}) {
  const record = await prisma.verificationToken.findUnique({
    where: { token: input.token },
  });
  if (!record || record.identifier !== `reset:${input.email}`) {
    throw new Error("Invalid reset token");
  }
  if (record.expires < new Date()) throw new Error("Token expired");

  const passwordHash = await hash(input.newPassword, 12);
  await prisma.user.update({
    where: { email: input.email },
    data: { passwordHash },
  });
  await prisma.verificationToken.delete({ where: { token: input.token } });
}
