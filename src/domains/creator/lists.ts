import { prisma } from "@/lib/db";
import { recordAnalyticsEvent } from "@/domains/analytics/events";

export async function saveCreator(input: {
  organisationId: string;
  brandId?: string;
  creatorProfileId: string;
  actorUserId: string;
}) {
  let list = await prisma.creatorList.findFirst({
    where: { organisationId: input.organisationId, name: "Saved creators" },
  });
  if (!list) {
    list = await prisma.creatorList.create({
      data: {
        organisationId: input.organisationId,
        name: "Saved creators",
        brandLinks: input.brandId
          ? { create: { brandId: input.brandId } }
          : undefined,
      },
    });
  }
  const item = await prisma.creatorListItem.upsert({
    where: {
      listId_creatorProfileId: {
        listId: list.id,
        creatorProfileId: input.creatorProfileId,
      },
    },
    create: {
      listId: list.id,
      creatorProfileId: input.creatorProfileId,
    },
    update: {},
  });
  await recordAnalyticsEvent({
    eventType: "CREATOR_SAVED",
    actorUserId: input.actorUserId,
    organisationId: input.organisationId,
    brandId: input.brandId,
    creatorProfileId: input.creatorProfileId,
  });
  return item;
}

export async function unsaveCreator(input: {
  organisationId: string;
  brandId?: string;
  creatorProfileId: string;
  actorUserId: string;
}) {
  const item = await prisma.creatorListItem.findFirst({
    where: {
      creatorProfileId: input.creatorProfileId,
      list: { organisationId: input.organisationId },
    },
  });
  if (item) {
    await prisma.creatorListItem.delete({ where: { id: item.id } });
  }
  await recordAnalyticsEvent({
    eventType: "CREATOR_UNSAVED",
    actorUserId: input.actorUserId,
    organisationId: input.organisationId,
    brandId: input.brandId,
    creatorProfileId: input.creatorProfileId,
  });
}
