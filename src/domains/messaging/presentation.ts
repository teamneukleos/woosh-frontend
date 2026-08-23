export const conversationKindLabel: Record<string, string> = {
  APPLICATION: "Application",
  INVITATION: "Invite",
  CAMPAIGN: "Campaign",
  SUPPORT: "Support",
};

export type ConversationLike = {
  id: string;
  type: string;
  application?: {
    brief: { id: string; title: string; brand: { name: string } };
    creator: { displayName: string };
  } | null;
  campaign?: {
    id: string;
    title: string;
    brand: { name: string };
    participants?: Array<{ creator: { displayName: string } }>;
  } | null;
  brand?: { name: string } | null;
  creator?: { displayName: string } | null;
};

export function conversationTitle(conversation: ConversationLike) {
  return (
    conversation.application?.brief.title ||
    conversation.campaign?.title ||
    (conversation.brand?.name && conversation.creator?.displayName
      ? `${conversation.brand.name} · ${conversation.creator.displayName}`
      : null) ||
    conversation.brand?.name ||
    conversation.creator?.displayName ||
    "Conversation"
  );
}

export function conversationBrandName(conversation: ConversationLike) {
  return (
    conversation.application?.brief.brand.name ||
    conversation.campaign?.brand.name ||
    conversation.brand?.name ||
    "Brand"
  );
}

export function conversationCreatorName(conversation: ConversationLike) {
  return (
    conversation.application?.creator.displayName ||
    conversation.campaign?.participants?.[0]?.creator.displayName ||
    conversation.creator?.displayName ||
    "Creator"
  );
}

export function conversationCounterpart(
  conversation: ConversationLike,
  viewerIsCreator: boolean,
) {
  return viewerIsCreator
    ? conversationBrandName(conversation)
    : conversationCreatorName(conversation);
}

export function conversationWorkHref(
  conversation: ConversationLike,
  viewerIsCreator: boolean,
) {
  if (conversation.campaign?.id) {
    return `/app/campaigns/${conversation.campaign.id}`;
  }
  if (conversation.application?.brief.id) {
    return viewerIsCreator
      ? `/app/jobs/${conversation.application.brief.id}`
      : `/app/briefs/${conversation.application.brief.id}`;
  }
  return null;
}

export function formatMessageTime(date: Date) {
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) {
    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diff < 6 * 86_400_000) {
    return date.toLocaleDateString("en-NG", { weekday: "short" });
  }
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function formatMessageStamp(date: Date) {
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDayLabel(date: Date) {
  const today = new Date();
  if (sameDay(date, today)) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
