import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { attachClaimedChannel } from "@/domains/creator/profile";
import { getWorkActor } from "@/domains/work/access";

function newClaimToken() {
  return randomBytes(24).toString("hex");
}

export async function expressInterest(input: {
  brandId: string;
  createdById: string;
  prospectId?: string;
  creatorProfileId?: string;
  message?: string;
}) {
  if (!input.prospectId && !input.creatorProfileId) {
    throw new Error("Either prospectId or creatorProfileId is required");
  }
  if (input.prospectId && input.creatorProfileId) {
    throw new Error("Choose either a prospect or a creator");
  }
  const actor = await getWorkActor(input.createdById);
  if (!actor.isPlatformAdmin && !actor.brandIds.includes(input.brandId)) {
    throw new Error("You cannot contact creators for this brand");
  }

  const existing = await prisma.brandInterest.findFirst({
    where: {
      brandId: input.brandId,
      prospectId: input.prospectId ?? null,
      creatorProfileId: input.creatorProfileId ?? null,
      status: { not: "CLOSED" },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const expires = new Date();
  expires.setDate(expires.getDate() + 14);

  const interest = await prisma.brandInterest.create({
    data: {
      brandId: input.brandId,
      prospectId: input.prospectId,
      creatorProfileId: input.creatorProfileId,
      message: input.message,
      status: input.prospectId ? "INVITED" : "OPEN",
      claimToken: newClaimToken(),
      claimTokenExpiresAt: expires,
      createdById: input.createdById,
    },
    include: {
      brand: true,
      prospect: true,
      creatorProfile: { include: { user: true } },
    },
  });

  if (input.prospectId) {
    await prisma.creatorProspect.update({
      where: { id: input.prospectId },
      data: { status: "CLAIM_PENDING" },
    });
  }

  const notifyUserId = interest.creatorProfile?.userId;
  if (notifyUserId) {
    const conversation =
      (await prisma.conversation.findFirst({
        where: {
          type: "SUPPORT",
          brandId: interest.brandId,
          creatorProfileId: interest.creatorProfileId,
        },
        orderBy: { createdAt: "desc" },
      })) ??
      (await prisma.conversation.create({
        data: {
          type: "SUPPORT",
          brandId: interest.brandId,
          creatorProfileId: interest.creatorProfileId,
        },
      }));
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderUserId: input.createdById,
        body:
          interest.message ||
          `Hi ${interest.creatorProfile?.displayName || "there"} — ${interest.brand.name} would like to work with you.`,
      },
    });
    await createNotification({
      userId: notifyUserId,
      type: "brand.interest",
      title: `${interest.brand.name} is interested`,
      body: interest.message || "A brand wants to work with you on Woosh.",
      href: `/app/messages?c=${conversation.id}`,
      dedupeKey: `brand-interest:${interest.id}`,
    });
  } else if (interest.prospect?.contactEmail) {
    const { sendEmail } = await import("@/lib/notify");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${appUrl}/claim/${interest.claimToken}`;
    await sendEmail({
      to: interest.prospect.contactEmail,
      subject: `${interest.brand.name} invited you to Woosh`,
      html: `<p>${interest.brand.name} wants to work with you.</p><p><a href="${link}">Claim your profile</a></p>`,
      text: link,
    });
  }

  await writeAudit({
    actorId: input.createdById,
    action: "brand.interest.create",
    targetType: "BrandInterest",
    targetId: interest.id,
  });

  return interest;
}

export async function getClaimByToken(token: string) {
  return prisma.brandInterest.findUnique({
    where: { claimToken: token },
    include: {
      brand: { include: { organisation: true } },
      prospect: true,
      creatorProfile: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
}

const claimRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function claimProspect(input: {
  token: string;
  /** Existing logged-in user id, if any */
  userId?: string;
  register?: z.infer<typeof claimRegisterSchema>;
}) {
  const interest = await getClaimByToken(input.token);
  if (!interest) throw new Error("Invite not found");
  if (interest.claimTokenExpiresAt < new Date()) {
    throw new Error("Invite has expired");
  }
  if (interest.status === "CLAIMED" || interest.status === "CLOSED") {
    throw new Error("Invite is no longer available");
  }
  if (!interest.prospectId || !interest.prospect) {
    throw new Error("This invite is not for an unclaimed prospect");
  }

  const prospect = interest.prospect;

  let userId = input.userId;
  if (!userId) {
    if (!input.register) throw new Error("Registration details required");
    const parsed = claimRegisterSchema.parse(input.register);
    const email = parsed.email.toLowerCase();
    const invitedEmail = prospect.contactEmail?.trim().toLowerCase();
    if (invitedEmail && invitedEmail !== email) {
      throw new Error("Use the email address that received this claim invite");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("Account exists — sign in, then open this claim link again");
    }
    const passwordHash = await hash(parsed.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.name,
        passwordHash,
        status: invitedEmail ? "ACTIVE" : "PENDING_VERIFICATION",
        emailVerified: invitedEmail ? new Date() : null,
        creatorProfile: {
          create: {
            displayName: prospect.displayName || parsed.name,
            locationCountry: prospect.locationCountry,
            locationCity: prospect.locationCity,
            categories: prospect.categories,
          },
        },
      },
      include: { creatorProfile: true },
    });
    userId = user.id;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { creatorProfile: true },
  });
  if (!user) throw new Error("User not found");

  let profile = user.creatorProfile;
  if (!profile) {
    profile = await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        displayName: prospect.displayName || user.name || "Creator",
        locationCountry: prospect.locationCountry,
        locationCity: prospect.locationCity,
        categories: prospect.categories,
      },
    });
  }

  // Attach claimed handle as PENDING — OAuth must verify before metrics show as live.
  await attachClaimedChannel({
    creatorProfileId: profile.id,
    channel: prospect.channel,
    handle: prospect.handle,
    actorId: user.id,
  });

  await prisma.$transaction(async (tx) => {
    await tx.creatorProspect.update({
      where: { id: prospect.id },
      data: {
        status: "CLAIMED",
        claimedProfileId: profile!.id,
      },
    });
    await tx.brandInterest.update({
      where: { id: interest.id },
      data: {
        status: "CLAIMED",
        creatorProfileId: profile!.id,
      },
    });
  });

  const conversation = await prisma.conversation.create({
    data: {
      type: "SUPPORT",
      brandId: interest.brandId,
      creatorProfileId: profile.id,
      messages: {
        create: {
          isSystem: true,
          body: `${profile.displayName} claimed @${prospect.handle} after interest from ${interest.brand.name}.`,
        },
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: interest.createdById,
      body:
        interest.message ||
        `Hi ${profile.displayName} — thanks for joining Woosh. Let's talk.`,
    },
  });

  await createNotification({
    userId: interest.createdById,
    type: "prospect.claimed",
    title: `@${prospect.handle} claimed their profile`,
    body: `${profile.displayName} is now on Woosh and ready to message.`,
    href: `/app/messages`,
  });

  if (!user.emailVerified) {
    const { sendVerificationEmail } = await import(
      "@/domains/organisation/invites"
    );
    await sendVerificationEmail(user.id);
  }

  await createNotification({
    userId: user.id,
    type: "claim.complete",
    title: "Welcome to Woosh",
    body: `You claimed @${prospect.handle}. ${interest.brand.name} is waiting to chat.`,
    href: `/app/messages`,
  });

  await writeAudit({
    actorId: user.id,
    action: "prospect.claim",
    targetType: "CreatorProspect",
    targetId: prospect.id,
    after: { creatorProfileId: profile.id, brandInterestId: interest.id },
  });

  return { profile, interest, conversationId: conversation.id };
}
