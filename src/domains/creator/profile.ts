import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { CREATOR_CATEGORIES, LANGUAGES } from "@/lib/taxonomy";
import type { SocialChannel } from "@/generated/prisma/client";

const categoryEnum = z.enum(
  CREATOR_CATEGORIES as unknown as [string, ...string[]],
);
const languageEnum = z.enum(LANGUAGES as unknown as [string, ...string[]]);

const profileSchema = z.object({
  displayName: z.string().min(2).max(120),
  bio: z.string().max(2000).optional(),
  websiteUrl: z.string().url().max(2048).optional(),
  locationCountry: z.string().max(8).optional(),
  locationState: z.string().max(80).optional(),
  locationCity: z.string().max(80).optional(),
  categories: z.array(categoryEnum).optional(),
  languages: z.array(languageEnum).optional(),
  preferredIndustries: z.array(z.string().max(100)).max(20).optional(),
  excludedIndustries: z.array(z.string().max(100)).max(20).optional(),
  ageBand: z.string().max(40).optional(),
  gender: z.string().max(40).optional(),
  ageSearchable: z.boolean().optional(),
  genderSearchable: z.boolean().optional(),
  typicalRateMin: z.number().nonnegative().optional(),
  typicalRateMax: z.number().nonnegative().optional(),
  rateCurrency: z.string().max(8).optional(),
  availabilityNotes: z.string().max(1000).optional(),
});

export async function updateCreatorProfile(
  creatorProfileId: string,
  input: z.infer<typeof profileSchema>,
  actorId?: string,
) {
  const parsed = profileSchema.parse(input);
  const profile = await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      displayName: parsed.displayName,
      bio: parsed.bio,
      websiteUrl: parsed.websiteUrl,
      locationCountry: parsed.locationCountry,
      locationState: parsed.locationState,
      locationCity: parsed.locationCity,
      categories: parsed.categories,
      languages: parsed.languages,
      preferredIndustries: parsed.preferredIndustries,
      excludedIndustries: parsed.excludedIndustries,
      ageBand: parsed.ageBand,
      gender: parsed.gender,
      ageSearchable: parsed.ageSearchable,
      genderSearchable: parsed.genderSearchable,
      typicalRateMin: parsed.typicalRateMin,
      typicalRateMax: parsed.typicalRateMax,
      rateCurrency: parsed.rateCurrency,
      availabilityNotes: parsed.availabilityNotes,
    },
  });

  await writeAudit({
    actorId,
    action: "creator.profile.update",
    targetType: "CreatorProfile",
    targetId: profile.id,
  });

  return profile;
}

/**
 * Start or refresh a social connection.
 * Metrics must come from provider sync — never from creator-typed follower counts.
 * Without OAuth keys, account is stored as PENDING (connected handle reserved for OAuth).
 */
export async function connectSocialChannel(input: {
  creatorProfileId: string;
  channel: SocialChannel;
  /** Optional prefilled handle; OAuth will overwrite with verified identity. */
  handleHint?: string;
  actorId?: string;
}) {
  const oauthConfigured = Boolean(
    process.env.META_APP_ID ||
      process.env.TIKTOK_CLIENT_KEY ||
      process.env.GOOGLE_CLIENT_ID,
  );

  const handle =
    input.handleHint?.trim().replace(/^@/, "").toLowerCase() ||
    `${input.channel.toLowerCase()}-pending-${input.creatorProfileId.slice(-6)}`;

  const status = oauthConfigured ? "PENDING" : "PENDING";

  const account = await prisma.socialAccount.upsert({
    where: {
      channel_externalId: {
        channel: input.channel,
        externalId: handle,
      },
    },
    create: {
      creatorProfileId: input.creatorProfileId,
      channel: input.channel,
      externalId: handle,
      handle,
      status,
      lastRefreshedAt: null,
    },
    update: {
      creatorProfileId: input.creatorProfileId,
      handle,
      status,
    },
  });

  await writeAudit({
    actorId: input.actorId,
    action: "creator.social.connect_start",
    targetType: "SocialAccount",
    targetId: account.id,
    after: {
      channel: input.channel,
      status,
      oauthConfigured,
      note: "Metrics will sync from provider; no manual follower entry",
    },
  });

  return { account, oauthConfigured };
}

/** @deprecated Do not use for creator-facing flows — kept only for claim merge of prospect estimate into a pending account without inventing ACTIVE verified metrics. */
export async function attachClaimedChannel(input: {
  creatorProfileId: string;
  channel: SocialChannel;
  handle: string;
  actorId?: string;
}) {
  const handle = input.handle.trim().replace(/^@/, "").toLowerCase();
  const account = await prisma.socialAccount.upsert({
    where: {
      channel_externalId: {
        channel: input.channel,
        externalId: handle,
      },
    },
    create: {
      creatorProfileId: input.creatorProfileId,
      channel: input.channel,
      externalId: handle,
      handle,
      status: "PENDING",
      lastRefreshedAt: null,
    },
    update: {
      creatorProfileId: input.creatorProfileId,
      handle,
      status: "PENDING",
    },
  });

  await writeAudit({
    actorId: input.actorId,
    action: "creator.social.claim_attach",
    targetType: "SocialAccount",
    targetId: account.id,
    after: {
      channel: input.channel,
      handle,
      status: "PENDING",
      note: "Claim attached handle; creator must complete OAuth to verify metrics",
    },
  });

  return account;
}
