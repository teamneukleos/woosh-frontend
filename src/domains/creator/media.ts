import { api } from "@/lib/api";
import type { SocialChannel } from "@/lib/enums";
export { creatorReadiness } from "@/domains/creator/readiness";

export async function uploadCreatorImage(input: {
  creatorProfileId: string;
  actorUserId: string;
  kind: "avatar" | "cover";
  file: File;
}) {
  const body = new FormData();
  body.set("kind", input.kind);
  body.set("file", input.file);
  return api("/creators/me/image", { method: "POST", body });
}

function portfolioFields(input: {
  title: string;
  description?: string;
  channel?: SocialChannel;
  campaignType?: string;
  brandName?: string;
  tags?: string[];
}) {
  return {
    title: input.title,
    description: input.description,
    channel: input.channel,
    campaignType: input.campaignType,
    brandName: input.brandName,
    tags: input.tags ?? [],
  };
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
  const body = new FormData();
  const fields = portfolioFields(input);
  body.set("title", fields.title);
  if (fields.description) body.set("description", fields.description);
  if (fields.channel) body.set("channel", fields.channel);
  if (fields.campaignType) body.set("campaignType", fields.campaignType);
  if (fields.brandName) body.set("brandName", fields.brandName);
  if (fields.tags.length) body.set("tags", fields.tags.join(","));
  body.set("file", input.file);
  return api("/creators/me/portfolio/upload", { method: "POST", body });
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
  return api("/creators/me/portfolio/embed", {
    method: "POST",
    body: { ...portfolioFields(input), url: input.url },
  });
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
  return api(`/creators/me/portfolio/${input.itemId}`, {
    method: "PATCH",
    body: portfolioFields(input),
  });
}

export async function addCampaignContentToPortfolio(input: {
  creatorProfileId: string;
  submissionId: string;
  actorUserId: string;
  title: string;
}) {
  return api("/creators/me/portfolio/from-submission", {
    method: "POST",
    body: { submissionId: input.submissionId, title: input.title },
  });
}

export async function deletePortfolioItem(input: {
  creatorProfileId: string;
  itemId: string;
  actorUserId: string;
}) {
  return api(`/creators/me/portfolio/${input.itemId}`, { method: "DELETE" });
}

export async function reorderPortfolioItems(input: {
  creatorProfileId: string;
  orderedIds: string[];
  actorUserId: string;
}) {
  return api("/creators/me/portfolio/reorder", {
    method: "POST",
    body: { orderedIds: input.orderedIds },
  });
}

export async function submitCreatorForReview(input: {
  creatorProfileId: string;
  actorUserId: string;
}) {
  return api("/creators/me/submit-review", { method: "POST" });
}
