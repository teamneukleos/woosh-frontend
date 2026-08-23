import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { getWorkActor } from "@/domains/work/access";

async function requireConversationAccess(id: string, userId: string) {
  const actor = await getWorkActor(userId);
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      application: { select: { creatorProfileId: true, brief: { select: { brandId: true } } } },
      campaign: {
        select: {
          brandId: true,
          participants: { select: { creatorProfileId: true } },
        },
      },
    },
  });
  if (!conversation) throw new Error("Conversation not found");
  const creatorAllowed =
    !!actor.creatorProfileId &&
    (conversation.creatorProfileId === actor.creatorProfileId ||
      conversation.application?.creatorProfileId === actor.creatorProfileId ||
      conversation.campaign?.participants.some(
        (row) => row.creatorProfileId === actor.creatorProfileId,
      ));
  const brandId =
    conversation.brandId ??
    conversation.application?.brief.brandId ??
    conversation.campaign?.brandId;
  if (
    !actor.isPlatformAdmin &&
    !creatorAllowed &&
    (!brandId || !actor.brandIds.includes(brandId))
  ) {
    throw new Error("Forbidden");
  }
  return conversation;
}

export async function ensureApplicationConversation(applicationId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { applicationId },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      type: "APPLICATION",
      applicationId,
      messages: {
        create: {
          isSystem: true,
          body: "Conversation started for this application.",
        },
      },
    },
  });
}

export async function listConversations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      memberships: {
        include: { organisation: { include: { brands: true } } },
      },
      brandMemberships: true,
    },
  });
  if (!user) return [];

  const brandIds = new Set<string>();
  for (const m of user.memberships) {
    for (const b of m.organisation.brands) brandIds.add(b.id);
  }
  for (const m of user.brandMemberships) brandIds.add(m.brandId);

  const orFilters: object[] = [];
  if (user.creatorProfile) {
    orFilters.push({
      application: { creatorProfileId: user.creatorProfile.id },
    });
    orFilters.push({
      campaign: {
        participants: {
          some: { creatorProfileId: user.creatorProfile.id },
        },
      },
    });
    orFilters.push({ creatorProfileId: user.creatorProfile.id });
  }
  if (brandIds.size) {
    orFilters.push({
      application: { brief: { brandId: { in: [...brandIds] } } },
    });
    orFilters.push({ campaign: { brandId: { in: [...brandIds] } } });
    orFilters.push({ brandId: { in: [...brandIds] } });
  }

  const conversations = await prisma.conversation.findMany({
    where: { OR: orFilters.length ? orFilters : [{ id: "none" }] },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      application: {
        include: {
          brief: { include: { brand: true } },
          creator: true,
        },
      },
      campaign: {
        include: {
          brand: true,
          participants: { include: { creator: true }, take: 1 },
        },
      },
      brand: true,
      creator: true,
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return conversations.sort((a, b) => {
    const aAt = a.messages[0]?.createdAt.getTime() ?? a.createdAt.getTime();
    const bAt = b.messages[0]?.createdAt.getTime() ?? b.createdAt.getTime();
    return bAt - aAt;
  });
}

export async function getConversation(id: string, actorUserId: string) {
  await requireConversationAccess(id, actorUserId);
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      isSystem: false,
      senderUserId: { not: actorUserId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      application: {
        include: {
          brief: { include: { brand: true } },
          creator: true,
        },
      },
      campaign: {
        include: {
          brand: true,
          participants: { include: { creator: true }, take: 1 },
        },
      },
      brand: true,
      creator: true,
    },
  });
}

export async function sendMessage(input: {
  conversationId: string;
  senderUserId: string;
  body: string;
}) {
  await requireConversationAccess(input.conversationId, input.senderUserId);
  const body = input.body.trim();
  if (!body || body.length > 5_000) {
    throw new Error("Message must be between 1 and 5,000 characters");
  }
  const message = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      senderUserId: input.senderUserId,
      body,
    },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    include: {
      application: {
        include: {
          creator: true,
          brief: { include: { brand: { include: { memberships: true } } } },
        },
      },
      campaign: {
        include: {
          brand: { include: { memberships: true } },
          participants: { include: { creator: true } },
        },
      },
    },
  });

  const recipientIds = new Set<string>();
  if (conversation?.application) {
    recipientIds.add(conversation.application.creator.userId);
    for (const m of conversation.application.brief.brand.memberships) {
      recipientIds.add(m.userId);
    }
  }
  if (conversation?.campaign) {
    for (const m of conversation.campaign.brand.memberships) {
      recipientIds.add(m.userId);
    }
    for (const p of conversation.campaign.participants) {
      recipientIds.add(p.creator.userId);
    }
  }
  recipientIds.delete(input.senderUserId);

  for (const userId of recipientIds) {
    await createNotification({
      userId,
      type: "message.new",
      title: "New message",
      body: body.slice(0, 120),
      href: `/app/messages?c=${input.conversationId}`,
      dedupeKey: `message:${message.id}:${userId}`,
    });
  }

  await writeAudit({
    actorId: input.senderUserId,
    action: "message.send",
    targetType: "Message",
    targetId: message.id,
  });

  return message;
}
