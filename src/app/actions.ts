"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { setActiveBrandId } from "@/lib/brand-cookie";
import { getWorkspaceContext } from "@/lib/workspace";
import { createProspect } from "@/domains/creator/prospects";
import { expressInterest, claimProspect } from "@/domains/creator/claim";
import {
  updateCreatorProfile,
  connectSocialChannel,
} from "@/domains/creator/profile";
import {
  createBrief,
  publishBrief,
  applyToBrief,
} from "@/domains/marketplace/briefs";
import {
  shortlist,
  decline,
  acceptApplication,
} from "@/domains/marketplace/selection";
import { counterOffer, acceptOffer } from "@/domains/commercial/offers";
import { sendMessage } from "@/domains/messaging/threads";
import {
  submitDraft,
  requestRevision,
  approveDeliverable,
} from "@/domains/campaign/deliverables";
import { initiatePayout } from "@/domains/payments/ledger";
import {
  approveBrief,
  rejectBrief,
  verifyOrganisation,
  adminSeedProspects,
  setUserAdmin,
  moderateCreatorMedia,
  moderateCreatorProfile,
} from "@/domains/trust/admin";
import { startWalletTopUp } from "@/domains/payments/wallet";
import {
  inviteTeammate,
  inviteToBrief,
  sendVerificationEmail,
  requestVerificationEmail,
  requestPasswordReset,
  resetPassword,
  acceptTeamInvite,
} from "@/domains/organisation/invites";
import {
  completeDevOAuth,
  refreshSocialMetrics,
} from "@/domains/creator/oauth";
import {
  addPortfolioEmbed,
  addPortfolioUpload,
  deletePortfolioItem,
  reorderPortfolioItems,
  submitCreatorForReview,
  uploadCreatorImage,
  updatePortfolioItem,
  addCampaignContentToPortfolio,
} from "@/domains/creator/media";
import {
  createRatePackage,
  deleteRatePackage,
} from "@/domains/creator/rates";
import { saveCreator, unsaveCreator } from "@/domains/creator/lists";
import {
  logCampaignMetric,
  setDeliverableLive,
  completeDeliverable,
} from "@/domains/analytics";
import { deleteUpload, storeUpload, validateUpload } from "@/lib/storage";
import type { MembershipRole } from "@/generated/prisma/client";
import {
  createBrandForOrganisation,
  updateOrganisationProfile,
} from "@/domains/organisation/brands";
import {
  parseSelectedCategories,
  parseSelectedLanguages,
  CREATOR_CATEGORIES,
} from "@/lib/taxonomy";
import type { SocialChannel } from "@/generated/prisma/client";
import {
  changePassword,
  updateNotificationPreferences,
} from "@/domains/identity/account-settings";
import { replayPaystackWebhook } from "@/domains/payments/webhooks";
import { verifyAndSavePayoutAccount } from "@/domains/payments/payout-account";
import {
  createPaymentDispute,
  resolvePaymentDispute,
} from "@/domains/payments/disputes";
import { createCreatorStatement } from "@/domains/payments/documents";
import type {
  DisputeCategory,
  DisputeResolutionType,
} from "@/generated/prisma/client";
import { markNotificationsRead } from "@/lib/notify";
import {
  acceptCampaignTerms,
  declineInvitation,
  startDeliverable,
  withdrawApplication,
} from "@/domains/work/lifecycle";

function compactRecord(value: Record<string, unknown>) {
  const next: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || entry === "" || Number.isNaN(entry)) continue;
    next[key] = entry;
  }
  return Object.keys(next).length ? next : undefined;
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, emailVerified: true },
  });
  if (user?.status !== "ACTIVE" || !user.emailVerified) {
    throw new Error("Account is not active");
  }
  return session.user;
}

export async function switchBrandAction(formData: FormData) {
  await requireUser();
  const brandId = String(formData.get("brandId") ?? "");
  if (!brandId) return;
  await setActiveBrandId(brandId);
  revalidatePath("/app");
}

export async function createProspectAction(formData: FormData) {
  const user = await requireUser();
  await createProspect(
    {
      channel: String(formData.get("channel")) as SocialChannel,
      handle: String(formData.get("handle") ?? ""),
      displayName: String(formData.get("displayName") || "") || undefined,
      categories: parseSelectedCategories(formData),
      followerEstimate: formData.get("followerEstimate")
        ? Number(formData.get("followerEstimate"))
        : undefined,
      locationCountry: String(formData.get("locationCountry") || "") || undefined,
      locationCity: String(formData.get("locationCity") || "") || undefined,
      contactEmail: String(formData.get("contactEmail") || "") || undefined,
    },
    user.id,
  );
  revalidatePath("/app/creators");
  revalidatePath("/admin");
}

export async function expressInterestAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  const brandId =
    String(formData.get("brandId") || "") || ctx?.activeBrandId || "";
  if (!brandId) throw new Error("Select a brand first");

  await expressInterest({
    brandId,
    createdById: user.id!,
    prospectId: String(formData.get("prospectId") || "") || undefined,
    creatorProfileId:
      String(formData.get("creatorProfileId") || "") || undefined,
    message: String(formData.get("message") || "") || undefined,
  });

  revalidatePath("/app/creators");
}

export async function toggleSaveCreatorAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.organisation || ctx.kind === "creator") {
    throw new Error("Brand or agency workspace required");
  }
  const input = {
    organisationId: ctx.organisation.id,
    brandId: ctx.activeBrandId ?? undefined,
    creatorProfileId: String(formData.get("creatorProfileId")),
    actorUserId: user.id!,
  };
  if (formData.get("saved") === "1") {
    await unsaveCreator(input);
  } else {
    await saveCreator(input);
  }
  revalidatePath("/app/creators");
}

export async function claimInviteAction(
  _prev: { ok: boolean; error?: string },
  formData: FormData,
) {
  try {
    const session = await auth();
    const token = String(formData.get("token") ?? "");
    const mode = String(formData.get("mode") ?? "register");

    if (mode === "login" && session?.user?.id) {
      await claimProspect({ token, userId: session.user.id });
    } else {
      await claimProspect({
        token,
        register: {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        },
      });
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Claim failed",
    };
  }
}

export async function createBriefAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  const brandId =
    String(formData.get("brandId") || "") || ctx?.activeBrandId || "";
  if (!brandId) throw new Error("No active brand");

  const channels = formData.getAll("channels").map(String) as SocialChannel[];
  const brief = await createBrief(
    {
      brandId,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      objective: String(formData.get("objective") || "") || undefined,
      category: String(formData.get("category") || "") || undefined,
      distribution: (String(formData.get("distribution") || "OPEN") as
        | "OPEN"
        | "INVITE_ONLY"
        | "HYBRID"),
      rateMode: (String(formData.get("rateMode") || "FIXED_NON_NEGOTIABLE") as
        | "FIXED_NON_NEGOTIABLE"
        | "FIXED_NEGOTIABLE"
        | "RANGE_NEGOTIABLE"
        | "DELIVERABLE_BASED"
        | "CREATOR_BUNDLE"),
      rateAmount: formData.get("rateAmount")
        ? Number(formData.get("rateAmount"))
        : undefined,
      rateMin: formData.get("rateMin")
        ? Number(formData.get("rateMin"))
        : undefined,
      rateMax: formData.get("rateMax")
        ? Number(formData.get("rateMax"))
        : undefined,
      currency: String(formData.get("currency") || "NGN"),
      channels,
      deliverables: [
        {
          title: String(formData.get("deliverableTitle") || "Primary post"),
          channel: channels[0],
        },
      ],
      eligibility: compactRecord({
        minFollowers: formData.get("minFollowers")
          ? Number(formData.get("minFollowers"))
          : undefined,
        locations: String(formData.get("locations") || "") || undefined,
        languages: String(formData.get("languages") || "") || undefined,
      }),
      rights: compactRecord({
        usage: String(formData.get("rightsUsage") || "") || undefined,
      }),
      timing: compactRecord({
        postingWindow: String(formData.get("postingWindow") || "") || undefined,
        contentDue: String(formData.get("contentDue") || "") || undefined,
      }),
      applicationDeadline: formData.get("applicationDeadline")
        ? new Date(String(formData.get("applicationDeadline")))
        : undefined,
    },
    user.id!,
  );

  if (formData.get("publish") === "1") {
    await publishBrief(brief.id, user.id!);
  }

  redirect(`/app/briefs/${brief.id}`);
}

export async function publishBriefAction(formData: FormData) {
  const user = await requireUser();
  await publishBrief(String(formData.get("briefId")), user.id!);
  revalidatePath("/app/briefs");
}

export async function applyToBriefAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator profile required");

  await applyToBrief({
    briefId: String(formData.get("briefId")),
    creatorProfileId: ctx.creatorProfile.id,
    proposedRate: formData.get("proposedRate")
      ? Number(formData.get("proposedRate"))
      : undefined,
    availabilityNote:
      String(formData.get("availabilityNote") || "") || undefined,
    actorUserId: user.id!,
  });

  revalidatePath("/app/jobs");
  redirect(`/app/jobs/${formData.get("briefId")}`);
}

export async function pipelineAction(formData: FormData) {
  const user = await requireUser();
  const applicationId = String(formData.get("applicationId"));
  const action = String(formData.get("action"));

  if (action === "shortlist") await shortlist(applicationId, user.id!);
  if (action === "decline") await decline(applicationId, user.id!);
  if (action === "accept") await acceptApplication(applicationId, user.id!);

  revalidatePath("/app/briefs");
  revalidatePath("/app/campaigns");
}

export async function counterOfferAction(formData: FormData) {
  const user = await requireUser();
  await counterOffer({
    applicationId: String(formData.get("applicationId")),
    amount: Number(formData.get("amount")),
    message: String(formData.get("message") || "") || undefined,
    createdById: user.id!,
  });
  revalidatePath("/app/briefs");
  revalidatePath("/app/work");
}

export async function acceptOfferAction(formData: FormData) {
  const user = await requireUser();
  await acceptOffer({
    offerId: String(formData.get("offerId")),
    actorUserId: user.id!,
  });
  revalidatePath("/app/briefs");
  revalidatePath("/app/jobs");
  revalidatePath("/app/work");
}

export async function declineInvitationAction(formData: FormData) {
  const user = await requireUser();
  await declineInvitation({
    invitationId: String(formData.get("invitationId")),
    actorUserId: user.id!,
    reason: String(formData.get("reason") || "") || undefined,
  });
  revalidatePath("/app/invitations");
  revalidatePath("/app/jobs");
  revalidatePath("/app/work");
}

export async function withdrawApplicationAction(formData: FormData) {
  const user = await requireUser();
  await withdrawApplication({
    applicationId: String(formData.get("applicationId")),
    actorUserId: user.id!,
    reason: String(formData.get("reason") || "") || undefined,
  });
  revalidatePath("/app/applications");
  revalidatePath("/app/jobs");
  revalidatePath("/app/work");
}

export async function acceptCampaignTermsAction(formData: FormData) {
  const user = await requireUser();
  await acceptCampaignTerms({
    campaignParticipantId: String(formData.get("campaignParticipantId")),
    actorUserId: user.id!,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function startDeliverableAction(formData: FormData) {
  const user = await requireUser();
  await startDeliverable({
    deliverableId: String(formData.get("deliverableId")),
    actorUserId: user.id!,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId"));
  await sendMessage({
    conversationId,
    senderUserId: user.id!,
    body: String(formData.get("body") ?? ""),
  });
  revalidatePath("/app/messages");
  redirect(`/app/messages?c=${conversationId}`);
}

export async function sendCampaignMessageAction(formData: FormData) {
  const user = await requireUser();
  await sendMessage({
    conversationId: String(formData.get("conversationId")),
    senderUserId: user.id!,
    body: String(formData.get("body") ?? ""),
  });
  revalidatePath(
    `/app/campaigns/${String(formData.get("campaignId") ?? "")}`,
  );
}

export async function submitDraftAction(formData: FormData) {
  const user = await requireUser();
  await submitDraft({
    deliverableId: String(formData.get("deliverableId")),
    draftUrl: String(formData.get("draftUrl") ?? ""),
    notes: String(formData.get("notes") || "") || undefined,
    actorUserId: user.id!,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function revisionAction(formData: FormData) {
  const user = await requireUser();
  await requestRevision({
    deliverableId: String(formData.get("deliverableId")),
    reviewNotes: String(formData.get("reviewNotes") ?? ""),
    actorUserId: user.id!,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function approveDeliverableAction(formData: FormData) {
  const user = await requireUser();
  await approveDeliverable({
    deliverableId: String(formData.get("deliverableId")),
    actorUserId: user.id!,
    liveUrl: String(formData.get("liveUrl") || "") || undefined,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/earnings");
  revalidatePath("/app/work");
}

export async function markPaidAction(formData: FormData) {
  const user = await requireUser();
  const obligationId = String(formData.get("obligationId"));
  await initiatePayout({
    obligationId,
    actorUserId: user.id!,
  });
  revalidatePath("/app/earnings");
  revalidatePath("/app/payments");
}

export async function walletTopUpAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx || ctx.kind === "creator" || !ctx.activeBrandId) {
    throw new Error("Brand workspace required");
  }
  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) throw new Error("Enter a positive amount");

  const result = await startWalletTopUp({
    brandId: ctx.activeBrandId,
    amountMajor: amount,
    actorUserId: user.id!,
    actorEmail: user.email || "billing@woosh.test",
  });

  revalidatePath("/app/payments");
  if (result.mode === "paystack" && result.authorizationUrl) {
    redirect(result.authorizationUrl);
  }
}

export async function updateCreatorProfileAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Not a creator");

  await updateCreatorProfile(
    ctx.creatorProfile.id,
    {
      displayName: String(formData.get("displayName") ?? ""),
      bio: String(formData.get("bio") || "") || undefined,
      locationCountry:
        String(formData.get("locationCountry") || "") || undefined,
      locationState:
        String(formData.get("locationState") || "") || undefined,
      locationCity: String(formData.get("locationCity") || "") || undefined,
      websiteUrl: String(formData.get("websiteUrl") || "") || undefined,
      categories: parseSelectedCategories(formData) as never,
      languages: parseSelectedLanguages(formData) as never,
      preferredIndustries: formData
        .getAll("preferredIndustries")
        .map(String)
        .filter(Boolean),
      excludedIndustries: formData
        .getAll("excludedIndustries")
        .map(String)
        .filter(Boolean),
      ageBand: String(formData.get("ageBand") || "") || undefined,
      gender: String(formData.get("gender") || "") || undefined,
      ageSearchable: formData.get("ageSearchable") === "on",
      genderSearchable: formData.get("genderSearchable") === "on",
      availabilityNotes:
        String(formData.get("availabilityNotes") || "") || undefined,
    },
    user.id!,
  );

  revalidatePath("/app/settings");
  revalidatePath("/app/profile");
}

export async function uploadCreatorImageAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  const file = formData.get("file");
  const kind = String(formData.get("kind")) as "avatar" | "cover";
  if (!(file instanceof File) || !file.size) throw new Error("Choose an image");
  if (!["avatar", "cover"].includes(kind)) throw new Error("Invalid image kind");
  await uploadCreatorImage({
    creatorProfileId: ctx.creatorProfile.id,
    actorUserId: user.id!,
    kind,
    file,
  });
  revalidatePath("/app/profile");
  revalidatePath("/app/creators");
}

export async function addPortfolioItemAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  const common = {
    creatorProfileId: ctx.creatorProfile.id,
    actorUserId: user.id!,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") || "") || undefined,
    channel:
      (String(formData.get("channel") || "") as SocialChannel) || undefined,
    campaignType:
      String(formData.get("campaignType") || "") || undefined,
    brandName: String(formData.get("brandName") || "") || undefined,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
  const file = formData.get("file");
  const embedUrl = String(formData.get("embedUrl") || "");
  if (file instanceof File && file.size) {
    await addPortfolioUpload({ ...common, file });
  } else if (embedUrl) {
    await addPortfolioEmbed({ ...common, url: embedUrl });
  } else {
    throw new Error("Choose a file or add a social post URL");
  }
  revalidatePath("/app/profile");
}

export async function deletePortfolioItemAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await deletePortfolioItem({
    creatorProfileId: ctx.creatorProfile.id,
    itemId: String(formData.get("itemId")),
    actorUserId: user.id!,
  });
  revalidatePath("/app/profile");
}

export async function updatePortfolioItemAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await updatePortfolioItem({
    creatorProfileId: ctx.creatorProfile.id,
    itemId: String(formData.get("itemId")),
    actorUserId: user.id!,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") || "") || undefined,
    channel:
      (String(formData.get("channel") || "") as SocialChannel) || undefined,
    campaignType:
      String(formData.get("campaignType") || "") || undefined,
    brandName: String(formData.get("brandName") || "") || undefined,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });
  revalidatePath("/app/profile");
}

export async function addCampaignContentToPortfolioAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await addCampaignContentToPortfolio({
    creatorProfileId: ctx.creatorProfile.id,
    submissionId: String(formData.get("submissionId")),
    actorUserId: user.id!,
    title: String(formData.get("title") || "Campaign content"),
  });
  revalidatePath("/app/profile");
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function reorderPortfolioItemsAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await reorderPortfolioItems({
    creatorProfileId: ctx.creatorProfile.id,
    orderedIds: String(formData.get("orderedIds") || "")
      .split(",")
      .filter(Boolean),
    actorUserId: user.id!,
  });
  revalidatePath("/app/profile");
}

export async function createRatePackageAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await createRatePackage({
    creatorProfileId: ctx.creatorProfile.id,
    actorUserId: user.id!,
    channel: String(formData.get("channel")) as SocialChannel,
    deliverableType: String(formData.get("deliverableType") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") || "") || undefined,
    price: Number(formData.get("price")),
    currency: String(formData.get("currency") || "NGN"),
    turnaroundDays: formData.get("turnaroundDays")
      ? Number(formData.get("turnaroundDays"))
      : undefined,
    revisions: formData.get("revisions")
      ? Number(formData.get("revisions"))
      : 1,
    usageRights: String(formData.get("usageRights") || "") || undefined,
  });
  revalidatePath("/app/profile");
}

export async function deleteRatePackageAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await deleteRatePackage({
    creatorProfileId: ctx.creatorProfile.id,
    ratePackageId: String(formData.get("ratePackageId")),
    actorUserId: user.id!,
  });
  revalidatePath("/app/profile");
}

export async function submitCreatorForReviewAction() {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  await submitCreatorForReview({
    creatorProfileId: ctx.creatorProfile.id,
    actorUserId: user.id!,
  });
  revalidatePath("/app/profile");
}

export async function refreshSocialMetricsAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  const accountId = String(formData.get("socialAccountId"));
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, creatorProfileId: ctx.creatorProfile.id },
  });
  if (!account) throw new Error("Social account not found");
  await refreshSocialMetrics(account.id);
  revalidatePath("/app/profile");
  revalidatePath("/app/insights");
}

export async function createClientBrandAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.organisation) throw new Error("Organisation required");

  await createBrandForOrganisation(
    {
      organisationId: ctx.organisation.id,
      name: String(formData.get("name") ?? ""),
      industry: String(formData.get("industry") || "") || undefined,
      country: String(formData.get("country") || "NG"),
    },
    user.id!,
  );

  revalidatePath("/app");
  revalidatePath("/app/brands");
  const next = String(formData.get("next") || "/app");
  redirect(next.startsWith("/") ? next : "/app");
}

/** Creators connect channels — redirects to OAuth when configured. */
export async function connectSocialAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Not a creator");
  if (!ctx.user.emailVerified || ctx.user.status !== "ACTIVE") {
    throw new Error("Verify your email before connecting social accounts");
  }

  const channel = String(formData.get("channel") || "") as SocialChannel;
  if (!channel) throw new Error("Channel required");

  await connectSocialChannel({
    creatorProfileId: ctx.creatorProfile.id,
    channel,
    actorId: user.id!,
  });

  redirect(
    `/api/oauth/${channel.toLowerCase()}?start=1&creatorProfileId=${ctx.creatorProfile.id}`,
  );
}

export async function devOAuthCompleteAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Not a creator");

  await completeDevOAuth({
    creatorProfileId: ctx.creatorProfile.id,
    channel: String(formData.get("channel")) as SocialChannel,
    handle: String(formData.get("handle") ?? ""),
    followers: formData.get("followers")
      ? Number(formData.get("followers"))
      : undefined,
    actorUserId: user.id!,
  });

  revalidatePath("/app/profile");
  redirect("/app/profile?oauth=success");
}

export async function inviteTeammateAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.organisation) throw new Error("Organisation required");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "MANAGER") as MembershipRole;
  if (!email || !email.includes("@")) throw new Error("Valid email required");

  await inviteTeammate({
    organisationId: ctx.organisation.id,
    email,
    role,
    invitedById: user.id!,
  });

  revalidatePath("/app/team");
  revalidatePath("/app/notifications");
}

export async function inviteToBriefAction(formData: FormData) {
  const user = await requireUser();
  await inviteToBrief({
    briefId: String(formData.get("briefId")),
    creatorProfileId: String(formData.get("creatorProfileId")),
    message: String(formData.get("message") || "") || undefined,
    actorUserId: user.id!,
  });
  revalidatePath("/app/briefs");
  revalidatePath("/app/invitations");
  revalidatePath("/app/creators");
}

export async function uploadDraftAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.creatorProfile) throw new Error("Creator only");
  const deliverableId = String(formData.get("deliverableId"));
  const allowed = await prisma.deliverable.count({
    where: {
      id: deliverableId,
      campaign: {
        participants: {
          some: { creatorProfileId: ctx.creatorProfile.id },
        },
      },
    },
  });
  if (!allowed) throw new Error("Deliverable not found");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  validateUpload({
    buffer,
    contentType: file.type || "application/octet-stream",
    kind: "deliverable",
  });
  const stored = await storeUpload({
    buffer,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    folder: `deliverables/${deliverableId}`,
  });

  try {
    await submitDraft({
      deliverableId,
      draftUrl: stored.url,
      notes: String(formData.get("notes") || "") || undefined,
      actorUserId: user.id!,
      storageKey: stored.key,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      idempotencyKey: `upload:${stored.key}`,
    });
  } catch (error) {
    await deleteUpload(stored.key);
    throw error;
  }

  revalidatePath("/app/campaigns");
}

export async function logMetricAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  const campaignId = String(formData.get("campaignId"));
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { brandId: true },
  });
  if (
    !campaign ||
    (!ctx?.user.isPlatformAdmin && campaign.brandId !== ctx?.activeBrandId)
  ) {
    throw new Error("You cannot log metrics for this campaign");
  }
  await logCampaignMetric({
    campaignId,
    source: String(formData.get("source") || "manual"),
    postUrl: String(formData.get("postUrl") || "") || undefined,
    reach: formData.get("reach") ? Number(formData.get("reach")) : undefined,
    views: formData.get("views") ? Number(formData.get("views")) : undefined,
    impressions: formData.get("impressions")
      ? Number(formData.get("impressions"))
      : undefined,
    engagement: formData.get("engagement")
      ? Number(formData.get("engagement"))
      : undefined,
    creatorProfileId:
      String(formData.get("creatorProfileId") || "") || undefined,
    deliverableId: String(formData.get("deliverableId") || "") || undefined,
    submissionId: String(formData.get("submissionId") || "") || undefined,
    actorUserId: user.id!,
  });
  revalidatePath("/app/analytics");
  revalidatePath("/app/insights");
  revalidatePath("/app/campaigns");
}

export async function setDeliverableLiveAction(formData: FormData) {
  const user = await requireUser();
  await setDeliverableLive({
    deliverableId: String(formData.get("deliverableId")),
    liveUrl: String(formData.get("liveUrl") || "") || undefined,
    actorUserId: user.id!,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function completeDeliverableAction(formData: FormData) {
  const user = await requireUser();
  await completeDeliverable({
    deliverableId: String(formData.get("deliverableId")),
    actorUserId: user.id!,
  });
  revalidatePath("/app/campaigns");
  revalidatePath("/app/work");
}

export async function savePayoutAccountAction(formData: FormData) {
  const user = await requireUser();
  await verifyAndSavePayoutAccount({
    actorUserId: user.id!,
    bankCode: String(formData.get("bankCode") ?? ""),
    accountNumber: String(formData.get("accountNumber") ?? ""),
  });

  revalidatePath("/app/profile");
  revalidatePath("/app/earnings");
}

export async function createPaymentDisputeAction(formData: FormData) {
  const user = await requireUser();
  await createPaymentDispute({
    obligationId: String(formData.get("obligationId")),
    actorUserId: user.id!,
    category: String(formData.get("category")) as DisputeCategory,
    subject: String(formData.get("subject") ?? ""),
    description: String(formData.get("description") ?? ""),
    requestedResolution:
      String(formData.get("requestedResolution") || "") || undefined,
  });
  revalidatePath("/app/earnings");
  revalidatePath("/app/payments");
  revalidatePath("/app/disputes");
  revalidatePath("/app/admin");
}

export async function resolvePaymentDisputeAction(formData: FormData) {
  const user = await requireUser();
  await resolvePaymentDispute({
    disputeId: String(formData.get("disputeId")),
    actorUserId: user.id!,
    resolutionType: String(
      formData.get("resolutionType"),
    ) as DisputeResolutionType,
    resolution: String(formData.get("resolution") ?? ""),
  });
  revalidatePath("/app/disputes");
  revalidatePath("/app/admin");
  revalidatePath("/app/earnings");
  revalidatePath("/app/payments");
}

export async function createCreatorStatementAction(formData: FormData) {
  const user = await requireUser();
  await createCreatorStatement({
    actorUserId: user.id!,
    year: Number(formData.get("year")),
    month: Number(formData.get("month")),
  });
  revalidatePath("/app/earnings");
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await markNotificationsRead(user.id!);
  revalidatePath("/app/notifications");
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const user = await requireUser();
  await updateNotificationPreferences({
    userId: user.id!,
    emailNotifications: formData.get("emailNotifications") === "on",
    weeklyDigest: formData.get("weeklyDigest") === "on",
  });
  revalidatePath("/app/settings");
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword !== String(formData.get("confirmPassword") ?? "")) {
    throw new Error("New passwords do not match");
  }
  await changePassword(user.id!, {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword,
  });
}

export async function replayPaystackWebhookAction(formData: FormData) {
  const user = await requireUser();
  await replayPaystackWebhook(String(formData.get("eventId") ?? ""), user.id!);
  revalidatePath("/app/admin");
}

export async function requestPasswordResetAction(
  _previous: { ok: boolean; message?: string },
  formData: FormData,
) {
  await requestPasswordReset(String(formData.get("email") ?? ""));
  return {
    ok: true,
    message: "If that account exists, a reset link is on its way.",
  };
}

export async function resetPasswordAction(
  _previous: { ok: boolean; message?: string },
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password.length > 128) {
    return { ok: false, message: "Use a password between 8 and 128 characters." };
  }
  try {
    await resetPassword({
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      token: String(formData.get("token") ?? ""),
      newPassword: password,
    });
  } catch {
    return { ok: false, message: "This reset link is invalid or has expired." };
  }
  redirect("/login?reset=done");
}

export async function requestVerificationAction(
  _previous: { ok: boolean; message?: string },
  formData: FormData,
) {
  await requestVerificationEmail(String(formData.get("email") ?? ""));
  return {
    ok: true,
    message: "If the account still needs verification, a fresh link is on its way.",
  };
}

export async function resendVerificationAction() {
  const user = await requireUser();
  await sendVerificationEmail(user.id!);
}

export async function acceptInviteOnRegisterAction(token: string, userId: string) {
  await acceptTeamInvite({ token, userId });
}

export async function adminRejectBriefAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");
  await rejectBrief(
    String(formData.get("briefId")),
    user.id!,
    String(formData.get("reason") || "") || undefined,
  );
  revalidatePath("/app/admin");
}

export async function adminVerifyOrgAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");
  await verifyOrganisation(
    String(formData.get("organisationId")),
    user.id!,
    formData.get("verified") === "1",
  );
  revalidatePath("/app/admin");
}

export async function adminModerateCreatorAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");
  await moderateCreatorProfile({
    creatorProfileId: String(formData.get("creatorProfileId")),
    actorId: user.id!,
    approve: formData.get("approve") === "1",
    reason: String(formData.get("reason") || "") || undefined,
  });
  revalidatePath("/app/admin");
  revalidatePath("/app/creators");
}

export async function adminModerateCreatorMediaAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");
  await moderateCreatorMedia({
    itemId: String(formData.get("itemId")),
    actorId: user.id!,
    approve: formData.get("approve") === "1",
    reason: String(formData.get("reason") || "") || undefined,
  });
  revalidatePath("/app/admin");
  revalidatePath("/app/profile");
}

export async function updateOrgAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.organisation) throw new Error("Organisation required");

  await updateOrganisationProfile(
    ctx.organisation.id,
    {
      publicName: String(formData.get("publicName") || "") || undefined,
      website: String(formData.get("website") || "") || undefined,
      industry: String(formData.get("industry") || "") || undefined,
    },
    user.id!,
  );
  revalidatePath("/app/settings");
}

export async function adminApproveBriefAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");
  await approveBrief(String(formData.get("briefId")), user.id!);
  revalidatePath("/admin");
  revalidatePath("/app/admin");
}

export async function adminSeedAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");

  const raw = String(formData.get("rows") ?? "");
  const rows = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [channel, handle, displayName, categories, followers] =
        line.split("|").map((s) => s.trim());
      const cats = (categories ? categories.split(/[;,]/) : [])
        .map((s) => s.trim())
        .filter((c) =>
          (CREATOR_CATEGORIES as readonly string[]).includes(c),
        );
      return {
        channel: (channel || "INSTAGRAM") as SocialChannel,
        handle: handle || "",
        displayName: displayName || undefined,
        categories: cats,
        followerEstimate: followers ? Number(followers) : undefined,
        locationCountry: "NG",
      };
    });

  await adminSeedProspects(rows, user.id!);
  revalidatePath("/admin");
  revalidatePath("/app/admin");
  revalidatePath("/app/creators");
}

export async function adminSetAdminAction(formData: FormData) {
  const user = await requireUser();
  const ctx = await getWorkspaceContext(user.id!);
  if (!ctx?.user.isPlatformAdmin) throw new Error("Admin only");
  await setUserAdmin(
    String(formData.get("userId")),
    formData.get("isAdmin") === "1",
    user.id!,
  );
  revalidatePath("/admin");
  revalidatePath("/app/admin");
}
