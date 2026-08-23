import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  deleteUpload,
  storeUpload,
  validateUpload,
  type UploadKind,
} from "@/lib/storage";
import type { SocialChannel } from "@/generated/prisma/client";
import { creatorReadiness } from "@/domains/creator/readiness";
export { creatorReadiness } from "@/domains/creator/readiness";

const embedSchema = z
  .string()
  .url()
  .refine((value) => {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return [
      "instagram.com",
      "tiktok.com",
      "youtube.com",
      "youtu.be",
    ].some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  }, "Use an Instagram, TikTok, or YouTube URL");

const portfolioSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  channel: z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE"]).optional(),
  campaignType: z.string().max(80).optional(),
  brandName: z.string().max(120).optional(),
  tags: z.array(z.string().min(1).max(40)).max(8).default([]),
});

export async function uploadCreatorImage(input: {
  creatorProfileId: string;
  actorUserId: string;
  kind: "avatar" | "cover";
  file: File;
}) {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  validateUpload({
    buffer,
    contentType: input.file.type,
    kind: input.kind,
  });

  const profile = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: input.creatorProfileId },
  });
  const stored = await storeUpload({
    buffer,
    filename: input.file.name,
    contentType: input.file.type,
    folder: `creators/${input.creatorProfileId}/${input.kind}`,
  });
  const oldKey =
    input.kind === "avatar"
      ? profile.avatarStorageKey
      : profile.coverStorageKey;

  const updated = await prisma.creatorProfile.update({
    where: { id: input.creatorProfileId },
    data:
      input.kind === "avatar"
        ? {
            avatarUrl: stored.url,
            avatarStorageKey: stored.key,
            avatarStatus: "PENDING",
            marketplaceStatus:
              profile.marketplaceStatus === "PUBLISHED"
                ? "PENDING_REVIEW"
                : profile.marketplaceStatus,
          }
        : {
            coverUrl: stored.url,
            coverStorageKey: stored.key,
            coverStatus: "PENDING",
            marketplaceStatus:
              profile.marketplaceStatus === "PUBLISHED"
                ? "PENDING_REVIEW"
                : profile.marketplaceStatus,
          },
  });

  await deleteUpload(oldKey);
  await writeAudit({
    actorId: input.actorUserId,
    action: `creator.${input.kind}.upload`,
    targetType: "CreatorProfile",
    targetId: input.creatorProfileId,
  });
  return updated;
}

export async function addPortfolioUpload(input: {
  creatorProfileId: string;
  actorUserId: string;
  file: File;
  title: string;
  description?: string;
  channel?: SocialChannel;
  campaignType?: string;
  brandName?: string;
  tags?: string[];
}) {
  const parsed = portfolioSchema.parse(input);
  const isVideo = input.file.type.startsWith("video/");
  const kind: UploadKind = isVideo ? "portfolio-video" : "portfolio-image";
  const buffer = Buffer.from(await input.file.arrayBuffer());
  validateUpload({ buffer, contentType: input.file.type, kind });

  const count = await prisma.creatorPortfolioItem.count({
    where: { creatorProfileId: input.creatorProfileId },
  });
  const stored = await storeUpload({
    buffer,
    filename: input.file.name,
    contentType: input.file.type,
    folder: `creators/${input.creatorProfileId}/portfolio`,
  });

  const item = await prisma.creatorPortfolioItem.create({
    data: {
      creatorProfileId: input.creatorProfileId,
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      title: parsed.title,
      description: parsed.description,
      channel: parsed.channel,
      campaignType: parsed.campaignType,
      brandName: parsed.brandName,
      tags: parsed.tags,
      url: stored.url,
      storageKey: stored.key,
      mimeType: input.file.type,
      fileSizeBytes: input.file.size,
      sortOrder: count,
      status: "PENDING",
    },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.portfolio.upload",
    targetType: "CreatorPortfolioItem",
    targetId: item.id,
  });
  return item;
}

export async function addPortfolioEmbed(input: {
  creatorProfileId: string;
  actorUserId: string;
  url: string;
  title: string;
  description?: string;
  channel?: SocialChannel;
  campaignType?: string;
  brandName?: string;
  tags?: string[];
}) {
  const parsed = portfolioSchema.parse(input);
  const url = embedSchema.parse(input.url);
  const count = await prisma.creatorPortfolioItem.count({
    where: { creatorProfileId: input.creatorProfileId },
  });
  const item = await prisma.creatorPortfolioItem.create({
    data: {
      creatorProfileId: input.creatorProfileId,
      mediaType: "EMBED",
      title: parsed.title,
      description: parsed.description,
      channel: parsed.channel,
      campaignType: parsed.campaignType,
      brandName: parsed.brandName,
      tags: parsed.tags,
      url,
      sortOrder: count,
      status: "PENDING",
    },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.portfolio.embed",
    targetType: "CreatorPortfolioItem",
    targetId: item.id,
  });
  return item;
}

export async function updatePortfolioItem(input: {
  creatorProfileId: string;
  itemId: string;
  actorUserId: string;
  title: string;
  description?: string;
  channel?: SocialChannel;
  campaignType?: string;
  brandName?: string;
  tags?: string[];
}) {
  const parsed = portfolioSchema.parse(input);
  const existing = await prisma.creatorPortfolioItem.findFirst({
    where: { id: input.itemId, creatorProfileId: input.creatorProfileId },
  });
  if (!existing) throw new Error("Portfolio item not found");
  const item = await prisma.creatorPortfolioItem.update({
    where: { id: existing.id },
    data: {
      title: parsed.title,
      description: parsed.description,
      channel: parsed.channel,
      campaignType: parsed.campaignType,
      brandName: parsed.brandName,
      tags: parsed.tags,
      status: existing.status === "APPROVED" ? "PENDING" : existing.status,
      moderationNotes: null,
    },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.portfolio.update",
    targetType: "CreatorPortfolioItem",
    targetId: item.id,
  });
  return item;
}

export async function addCampaignContentToPortfolio(input: {
  creatorProfileId: string;
  submissionId: string;
  actorUserId: string;
  title: string;
}) {
  const submission = await prisma.submission.findUnique({
    where: { id: input.submissionId },
    include: {
      deliverable: {
        include: {
          campaign: {
            include: {
              participants: {
                where: { creatorProfileId: input.creatorProfileId },
              },
            },
          },
        },
      },
    },
  });
  if (!submission || !submission.deliverable.campaign.participants.length) {
    throw new Error("Campaign content not found");
  }
  if (
    !["APPROVED", "LIVE", "COMPLETED"].includes(submission.deliverable.state)
  ) {
    throw new Error("Only approved campaign content can be added");
  }
  const url = submission.liveUrl || submission.draftUrl;
  if (!url) throw new Error("Submission has no media URL");
  const pathname = new URL(url, "http://localhost").pathname.toLowerCase();
  const mediaType = /\.(mp4|mov)$/.test(pathname)
    ? "VIDEO"
    : /\.(jpe?g|png|webp)$/.test(pathname)
      ? "IMAGE"
      : "EMBED";
  const count = await prisma.creatorPortfolioItem.count({
    where: { creatorProfileId: input.creatorProfileId },
  });
  const item = await prisma.creatorPortfolioItem.create({
    data: {
      creatorProfileId: input.creatorProfileId,
      mediaType,
      title: z.string().min(2).max(120).parse(input.title),
      description: `Created for ${submission.deliverable.campaign.title}`,
      channel: submission.deliverable.channel,
      campaignType: submission.deliverable.title,
      url,
      sortOrder: count,
      status: "PENDING",
    },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.portfolio.add_campaign_content",
    targetType: "CreatorPortfolioItem",
    targetId: item.id,
    metadata: { submissionId: submission.id },
  });
  return item;
}

export async function deletePortfolioItem(input: {
  creatorProfileId: string;
  itemId: string;
  actorUserId: string;
}) {
  const item = await prisma.creatorPortfolioItem.findFirst({
    where: { id: input.itemId, creatorProfileId: input.creatorProfileId },
  });
  if (!item) throw new Error("Portfolio item not found");
  await prisma.creatorPortfolioItem.delete({ where: { id: item.id } });
  await Promise.all([
    deleteUpload(item.storageKey),
    deleteUpload(item.thumbnailStorageKey),
  ]);
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.portfolio.delete",
    targetType: "CreatorPortfolioItem",
    targetId: item.id,
  });
}

export async function reorderPortfolioItems(input: {
  creatorProfileId: string;
  orderedIds: string[];
  actorUserId: string;
}) {
  const owned = await prisma.creatorPortfolioItem.findMany({
    where: {
      creatorProfileId: input.creatorProfileId,
      id: { in: input.orderedIds },
    },
    select: { id: true },
  });
  if (owned.length !== input.orderedIds.length) {
    throw new Error("Portfolio order contains an invalid item");
  }
  await prisma.$transaction(
    input.orderedIds.map((id, sortOrder) =>
      prisma.creatorPortfolioItem.update({
        where: { id },
        data: { sortOrder },
      }),
    ),
  );
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.portfolio.reorder",
    targetType: "CreatorProfile",
    targetId: input.creatorProfileId,
  });
}

export async function submitCreatorForReview(input: {
  creatorProfileId: string;
  actorUserId: string;
}) {
  const profile = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: input.creatorProfileId },
    include: {
      user: { select: { emailVerified: true } },
      socialAccounts: {
        include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
      },
      portfolioItems: true,
      ratePackages: true,
    },
  });
  const readiness = creatorReadiness(profile);
  if (!readiness.complete) {
    throw new Error(
      `Complete your profile first: ${readiness.checks
        .filter((check) => !check.complete)
        .map((check) => check.label)
        .join(", ")}`,
    );
  }
  const updated = await prisma.creatorProfile.update({
    where: { id: profile.id },
    data: {
      marketplaceStatus: "PENDING_REVIEW",
      submittedAt: new Date(),
      profileVisible: false,
      moderationNotes: null,
    },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.profile.submit_review",
    targetType: "CreatorProfile",
    targetId: profile.id,
  });
  return updated;
}
