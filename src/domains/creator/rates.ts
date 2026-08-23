import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

const rateSchema = z.object({
  channel: z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE"]),
  deliverableType: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  price: z.number().positive().max(1_000_000_000),
  currency: z.string().min(3).max(8).default("NGN"),
  turnaroundDays: z.number().int().positive().max(365).optional(),
  revisions: z.number().int().min(0).max(20).default(1),
  usageRights: z.string().max(500).optional(),
});

async function syncRateRange(creatorProfileId: string) {
  const rates = await prisma.creatorRatePackage.findMany({
    where: { creatorProfileId, active: true },
    select: { price: true, currency: true },
  });
  const values = rates.map((rate) => Number(rate.price));
  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      typicalRateMin: values.length ? Math.min(...values) : null,
      typicalRateMax: values.length ? Math.max(...values) : null,
      rateCurrency: rates[0]?.currency ?? "NGN",
    },
  });
}

export async function createRatePackage(input: {
  creatorProfileId: string;
  actorUserId: string;
  channel: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  deliverableType: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  turnaroundDays?: number;
  revisions?: number;
  usageRights?: string;
}) {
  const parsed = rateSchema.parse(input);
  const sortOrder = await prisma.creatorRatePackage.count({
    where: { creatorProfileId: input.creatorProfileId },
  });
  const rate = await prisma.creatorRatePackage.create({
    data: {
      creatorProfileId: input.creatorProfileId,
      ...parsed,
      sortOrder,
    },
  });
  await syncRateRange(input.creatorProfileId);
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.rate.create",
    targetType: "CreatorRatePackage",
    targetId: rate.id,
  });
  return rate;
}

export async function deleteRatePackage(input: {
  creatorProfileId: string;
  ratePackageId: string;
  actorUserId: string;
}) {
  const rate = await prisma.creatorRatePackage.findFirst({
    where: {
      id: input.ratePackageId,
      creatorProfileId: input.creatorProfileId,
    },
  });
  if (!rate) throw new Error("Rate package not found");
  await prisma.creatorRatePackage.delete({ where: { id: rate.id } });
  await syncRateRange(input.creatorProfileId);
  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.rate.delete",
    targetType: "CreatorRatePackage",
    targetId: rate.id,
  });
}
