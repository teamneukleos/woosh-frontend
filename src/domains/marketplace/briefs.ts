import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import type { BriefStatus, Prisma } from "@/generated/prisma/client";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import { scoreBriefFit } from "@/domains/marketplace/matching";
import {
  getWorkActor,
  requireBrandPermission,
  requireCreatorActor,
} from "@/domains/work/access";
import {
  automatedBriefChecks,
  moderationPath,
} from "@/domains/trust";

const briefSchema = z.object({
  brandId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  objective: z.string().optional(),
  category: z.string().optional(),
  distribution: z.enum(["OPEN", "INVITE_ONLY", "HYBRID"]).default("OPEN"),
  rateMode: z
    .enum([
      "FIXED_NON_NEGOTIABLE",
      "FIXED_NEGOTIABLE",
      "RANGE_NEGOTIABLE",
      "DELIVERABLE_BASED",
      "CREATOR_BUNDLE",
    ])
    .default("FIXED_NON_NEGOTIABLE"),
  rateAmount: z.number().nonnegative().optional(),
  rateMin: z.number().nonnegative().optional(),
  rateMax: z.number().nonnegative().optional(),
  currency: z.string().default("NGN"),
  channels: z.array(z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE"])).default([]),
  deliverables: z.any().optional(),
  applicationDeadline: z.coerce.date().optional(),
  maxCreators: z.number().int().positive().optional(),
  eligibility: z.record(z.string(), z.unknown()).optional(),
  rights: z.record(z.string(), z.unknown()).optional(),
  timing: z.record(z.string(), z.unknown()).optional(),
}).superRefine((brief, context) => {
  if (brief.rateMode === "RANGE_NEGOTIABLE") {
    if (brief.rateMin == null || brief.rateMax == null) {
      context.addIssue({
        code: "custom",
        message: "Negotiable ranges require a minimum and maximum rate",
        path: ["rateMin"],
      });
    } else if (brief.rateMin > brief.rateMax) {
      context.addIssue({
        code: "custom",
        message: "Minimum rate cannot exceed maximum rate",
        path: ["rateMin"],
      });
    }
  } else if (brief.rateAmount == null || brief.rateAmount <= 0) {
    context.addIssue({
      code: "custom",
      message: "This rate mode requires a positive amount",
      path: ["rateAmount"],
    });
  }
});

export async function createBrief(
  input: z.infer<typeof briefSchema>,
  actorId: string,
) {
  const parsed = briefSchema.parse(input);
  await requireBrandPermission(actorId, parsed.brandId, "briefs.manage");
  const brief = await prisma.brief.create({
    data: {
      brandId: parsed.brandId,
      title: parsed.title,
      description: parsed.description,
      objective: parsed.objective,
      category: parsed.category,
      distribution: parsed.distribution,
      rateMode: parsed.rateMode,
      rateAmount: parsed.rateAmount,
      rateMin: parsed.rateMin,
      rateMax: parsed.rateMax,
      currency: parsed.currency,
      channels: parsed.channels,
      deliverables: parsed.deliverables as Prisma.InputJsonValue | undefined,
      applicationDeadline: parsed.applicationDeadline,
      maxCreators: parsed.maxCreators,
      eligibility: parsed.eligibility as Prisma.InputJsonValue | undefined,
      rights: parsed.rights as Prisma.InputJsonValue | undefined,
      timing: parsed.timing as Prisma.InputJsonValue | undefined,
      status: "DRAFT",
    },
  });

  await writeAudit({
    actorId,
    action: "brief.create",
    targetType: "Brief",
    targetId: brief.id,
  });

  return brief;
}

export async function publishBrief(briefId: string, actorId: string) {
  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: { brand: { include: { organisation: true } } },
  });
  if (!brief) throw new Error("Brief not found");
  await requireBrandPermission(actorId, brief.brandId, "briefs.manage");
  if (brief.status !== "DRAFT" && brief.status !== "PENDING_MODERATION") {
    throw new Error("Brief cannot be published from current status");
  }

  const priorPublishedBriefs = await prisma.brief.count({
    where: {
      id: { not: brief.id },
      brand: {
        organisationId: brief.brand.organisationId,
      },
      status: { in: ["OPEN", "SELECTING", "CLOSED"] },
    },
  });
  const checks = automatedBriefChecks({
    title: brief.title,
    description: brief.description,
    category: brief.category,
    currency: brief.currency,
    rates: [
      brief.rateAmount ? Number(brief.rateAmount) : null,
      brief.rateMin ? Number(brief.rateMin) : null,
      brief.rateMax ? Number(brief.rateMax) : null,
    ],
  });
  const path = moderationPath({
    orgVerified: !!brief.brand.organisation.verifiedAt,
    isFirstCampaign: priorPublishedBriefs === 0,
    rateAnomaly: checks.rateAnomaly,
    prohibitedCategory: checks.prohibitedCategory,
  });
  const nextStatus: BriefStatus =
    path === "auto_publish" ? "OPEN" : "PENDING_MODERATION";

  const updated = await prisma.brief.update({
    where: { id: briefId },
    data: {
      status: nextStatus,
      publishedAt: nextStatus === "OPEN" ? new Date() : brief.publishedAt,
    },
  });

  await writeAudit({
    actorId,
    action: nextStatus === "OPEN" ? "brief.publish" : "brief.submit_moderation",
    targetType: "Brief",
    targetId: briefId,
    after: {
      status: nextStatus,
      moderationPath: path,
      prohibitedTerms: checks.prohibitedTerms,
      rateAnomaly: checks.rateAnomaly,
    },
  });

  return updated;
}

export async function listBriefsForBrand(brandId: string) {
  return prisma.brief.findMany({
    where: { brandId },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listJobsForCreator(creatorProfileId: string, tab?: string) {
  const applied = await prisma.application.findMany({
    where: { creatorProfileId },
    select: { briefId: true, status: true },
  });
  const appliedIds = new Set(applied.map((a) => a.briefId));

  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    include: {
      socialAccounts: {
        include: {
          snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
      },
    },
  });
  const matchProfile = {
    categories: creator?.categories ?? [],
    languages: creator?.languages ?? [],
    locationCountry: creator?.locationCountry,
    locationCity: creator?.locationCity,
    channels: [...new Set((creator?.socialAccounts ?? []).map((account) => account.channel))],
    followers: Math.max(
      0,
      ...(creator?.socialAccounts ?? []).map(
        (account) => account.snapshots[0]?.followers ?? 0,
      ),
    ),
    typicalRateMin: creator?.typicalRateMin
      ? Number(creator.typicalRateMin)
      : null,
    typicalRateMax: creator?.typicalRateMax
      ? Number(creator.typicalRateMax)
      : null,
  };

  if (tab === "applied") {
    return prisma.brief.findMany({
      where: { id: { in: [...appliedIds] } },
      include: {
        brand: true,
        applications: { where: { creatorProfileId } },
      },
      orderBy: { publishedAt: "desc" },
    });
  }

  if (tab === "invited") {
    return prisma.brief.findMany({
      where: {
        invitations: { some: { creatorProfileId } },
        status: { in: ["OPEN", "SELECTING"] },
      },
      include: {
        brand: true,
        invitations: { where: { creatorProfileId } },
      },
      orderBy: { publishedAt: "desc" },
    });
  }

  const open = await prisma.brief.findMany({
    where: {
      status: { in: ["OPEN", "SELECTING"] },
      distribution: { in: ["OPEN", "HYBRID"] },
    },
    include: {
      brand: true,
      applications: { where: { creatorProfileId } },
    },
    take: 80,
  });

  return open
    .map((brief) => ({
      brief,
      score: scoreBriefFit(
        {
          channels: brief.channels,
          category: brief.category,
          rateAmount: brief.rateAmount ? Number(brief.rateAmount) : null,
          rateMin: brief.rateMin ? Number(brief.rateMin) : null,
          rateMax: brief.rateMax ? Number(brief.rateMax) : null,
          publishedAt: brief.publishedAt,
          eligibility: brief.eligibility,
        },
        matchProfile,
      ),
    }))
    .sort((a, b) => b.score - a.score || (b.brief.publishedAt?.getTime() ?? 0) - (a.brief.publishedAt?.getTime() ?? 0))
    .slice(0, 50)
    .map((item) => item.brief);
}

export async function getBrief(id: string, actorUserId: string) {
  const actor = await getWorkActor(actorUserId);
  const access = await prisma.brief.findUnique({
    where: { id },
    select: {
      brandId: true,
      status: true,
      distribution: true,
      invitations: actor.creatorProfileId
        ? {
            where: { creatorProfileId: actor.creatorProfileId },
            select: { id: true },
          }
        : false,
    },
  });
  if (!access) return null;
  const brandAccess =
    actor.isPlatformAdmin || actor.brandIds.includes(access.brandId);
  const creatorAccess =
    !!actor.creatorProfileId &&
    (["OPEN", "SELECTING"].includes(access.status) &&
      (access.distribution !== "INVITE_ONLY" ||
        Boolean(access.invitations?.length)));
  if (!brandAccess && !creatorAccess) throw new Error("Forbidden");
  return prisma.brief.findUnique({
    where: { id },
    include: {
      brand: true,
      invitations: {
        where:
          !brandAccess && actor.creatorProfileId
            ? { creatorProfileId: actor.creatorProfileId }
            : undefined,
      },
      applications: {
        where:
          !brandAccess && actor.creatorProfileId
            ? { creatorProfileId: actor.creatorProfileId }
            : undefined,
        include: {
          creator: {
            include: {
              socialAccounts: {
                where: { status: "ACTIVE" },
                include: {
                  snapshots: {
                    where: { source: { not: "manual_unverified" } },
                    orderBy: { capturedAt: "desc" },
                    take: 1,
                  },
                },
                take: 3,
              },
              ratePackages: {
                where: { active: true },
                orderBy: { price: "asc" },
                take: 1,
              },
            },
          },
          offers: { orderBy: { createdAt: "desc" } },
          conversation: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function applyToBrief(input: {
  briefId: string;
  creatorProfileId: string;
  proposedRate?: number;
  availabilityNote?: string;
  answers?: Prisma.InputJsonValue;
  actorUserId: string;
}) {
  const actor = await requireCreatorActor(input.actorUserId);
  if (actor.creatorProfileId !== input.creatorProfileId) {
    throw new Error("You can only apply with your own creator profile");
  }
  const [brief, creator] = await Promise.all([
    prisma.brief.findUnique({ where: { id: input.briefId } }),
    prisma.creatorProfile.findUnique({
      where: { id: input.creatorProfileId },
      include: { user: { select: { status: true, emailVerified: true } } },
    }),
  ]);
  if (!brief) throw new Error("Brief not found");
  if (!creator) throw new Error("Creator profile not found");
  if (!creator.user.emailVerified || creator.user.status !== "ACTIVE") {
    throw new Error("Verify your email before applying");
  }
  if (creator.marketplaceStatus !== "PUBLISHED") {
    throw new Error(
      "Publish your creator profile before applying to marketplace briefs",
    );
  }
  if (brief.status !== "OPEN" && brief.status !== "SELECTING") {
    throw new Error("Brief is not accepting applications");
  }
  if (brief.applicationDeadline && brief.applicationDeadline < new Date()) {
    throw new Error("The application deadline has passed");
  }
  const acceptedCount = await prisma.application.count({
    where: { briefId: brief.id, status: "ACCEPTED" },
  });
  if (brief.maxCreators && acceptedCount >= brief.maxCreators) {
    throw new Error("This brief has filled all creator places");
  }
  if (brief.distribution === "INVITE_ONLY") {
    const invited = await prisma.briefInvitation.findUnique({
      where: {
        briefId_creatorProfileId: {
          briefId: brief.id,
          creatorProfileId: input.creatorProfileId,
        },
      },
    });
    if (!invited || ["DECLINED", "EXPIRED"].includes(invited.status)) {
      throw new Error("This brief is invitation-only");
    }
  }

  const application = await prisma.application.create({
    data: {
      briefId: input.briefId,
      creatorProfileId: input.creatorProfileId,
      proposedRate: input.proposedRate,
      availabilityNote: input.availabilityNote,
      answers: input.answers,
      currency: brief.currency,
      status: "APPLIED",
    },
    include: {
      creator: true,
      brief: { include: { brand: { include: { memberships: true } } } },
    },
  });
  const invitation = await prisma.briefInvitation.findUnique({
    where: {
      briefId_creatorProfileId: {
        briefId: brief.id,
        creatorProfileId: input.creatorProfileId,
      },
    },
  });
  if (invitation) {
    await prisma.briefInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    await recordAnalyticsEvent({
      eventType: "INVITE_ACCEPTED",
      actorUserId: input.actorUserId,
      brandId: brief.brandId,
      creatorProfileId: input.creatorProfileId,
      briefId: brief.id,
    });
  }

  if (
    brief.rateMode === "FIXED_NON_NEGOTIABLE" &&
    brief.rateAmount != null &&
    input.proposedRate == null
  ) {
    await prisma.offer.create({
      data: {
        applicationId: application.id,
        amount: brief.rateAmount,
        currency: brief.currency,
        status: "OPEN",
        createdById: input.actorUserId,
        message: "Rate accepted as listed",
      },
    });
  } else if (input.proposedRate != null) {
    await prisma.offer.create({
      data: {
        applicationId: application.id,
        amount: input.proposedRate,
        currency: brief.currency,
        status: "OPEN",
        createdById: input.actorUserId,
        message: "Creator proposed rate",
      },
    });
  }

  for (const m of application.brief.brand.memberships) {
    await createNotification({
      userId: m.userId,
      type: "application.received",
      title: "New application",
      body: `${application.creator.displayName} applied to ${brief.title}`,
      href: `/app/briefs/${brief.id}`,
    });
  }

  await writeAudit({
    actorId: input.actorUserId,
    action: "application.create",
    targetType: "Application",
    targetId: application.id,
  });
  await recordAnalyticsEvent({
    eventType: "APPLICATION_SUBMITTED",
    actorUserId: input.actorUserId,
    brandId: application.brief.brandId,
    creatorProfileId: input.creatorProfileId,
    briefId: brief.id,
  });

  return application;
}

export async function markInvitationViewed(input: {
  briefId: string;
  creatorProfileId: string;
  actorUserId: string;
}) {
  const actor = await requireCreatorActor(input.actorUserId);
  if (actor.creatorProfileId !== input.creatorProfileId) {
    throw new Error("Invitation not found");
  }
  const invite = await prisma.briefInvitation.findUnique({
    where: {
      briefId_creatorProfileId: {
        briefId: input.briefId,
        creatorProfileId: input.creatorProfileId,
      },
    },
    include: { brief: true },
  });
  if (!invite || invite.viewedAt) return invite;
  if (!["SENT", "VIEWED"].includes(invite.status)) return invite;
  const updated = await prisma.briefInvitation.update({
    where: { id: invite.id },
    data: { status: "VIEWED", viewedAt: new Date() },
  });
  await recordAnalyticsEvent({
    eventType: "INVITE_VIEWED",
    actorUserId: input.actorUserId,
    brandId: invite.brief.brandId,
    creatorProfileId: input.creatorProfileId,
    briefId: input.briefId,
  });
  return updated;
}
