import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/db";
import { getWorkActor, requireCreatorActor } from "@/domains/work/access";
import { canAccessFinancialDocument } from "@/domains/payments/policy";

function documentNumber(prefix: string, id: string, date = new Date()) {
  return `WO-${prefix}-${date.getUTCFullYear()}-${id.slice(-8).toUpperCase()}`;
}

export async function createBrandReceipt(obligationId: string) {
  const obligation = await prisma.paymentObligation.findUniqueOrThrow({
    where: { id: obligationId },
    include: {
      participant: {
        include: {
          creator: true,
          campaign: { include: { brand: true } },
        },
      },
    },
  });
  if (obligation.status !== "PAID") throw new Error("Payment is not complete");
  return prisma.financialDocument.upsert({
    where: { dedupeKey: `receipt:${obligation.id}` },
    create: {
      documentNumber: documentNumber("REC", obligation.id),
      type: "BRAND_RECEIPT",
      creatorProfileId: obligation.participant.creatorProfileId,
      brandId: obligation.participant.campaign.brandId,
      obligationId: obligation.id,
      currency: obligation.currency,
      grossAmount: obligation.grossAmount,
      feeAmount: obligation.platformFee,
      netAmount: obligation.netAmount,
      dedupeKey: `receipt:${obligation.id}`,
      snapshot: {
        campaign: obligation.participant.campaign.title,
        brand: obligation.participant.campaign.brand.name,
        creator: obligation.participant.creator.displayName,
        paidAt: obligation.paidAt?.toISOString(),
      },
    },
    update: {},
  });
}

export async function createCreatorStatement(input: {
  actorUserId: string;
  year: number;
  month: number;
}) {
  const actor = await requireCreatorActor(input.actorUserId);
  if (
    !Number.isInteger(input.year) ||
    input.year < 2020 ||
    !Number.isInteger(input.month) ||
    input.month < 1 ||
    input.month > 12
  ) {
    throw new Error("Invalid statement period");
  }
  const start = new Date(Date.UTC(input.year, input.month - 1, 1));
  const end = new Date(Date.UTC(input.year, input.month, 1));
  const currentMonth = new Date();
  const currentMonthStart = new Date(
    Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1),
  );
  if (end > currentMonthStart) {
    throw new Error("Statements are available after the month closes");
  }
  const obligations = await prisma.paymentObligation.findMany({
    where: {
      participant: { creatorProfileId: actor.creatorProfileId },
      status: "PAID",
      paidAt: { gte: start, lt: end },
    },
    include: {
      participant: { include: { campaign: { include: { brand: true } } } },
    },
    orderBy: { paidAt: "asc" },
  });
  const gross = obligations.reduce(
    (sum, item) => sum + Number(item.grossAmount),
    0,
  );
  const fee = obligations.reduce(
    (sum, item) => sum + Number(item.platformFee),
    0,
  );
  const net = obligations.reduce(
    (sum, item) => sum + Number(item.netAmount),
    0,
  );
  const period = `${input.year}-${String(input.month).padStart(2, "0")}`;
  return prisma.financialDocument.upsert({
    where: {
      dedupeKey: `statement:${actor.creatorProfileId}:${period}`,
    },
    create: {
      documentNumber: documentNumber(
        "STM",
        `${actor.creatorProfileId}${period}`,
        end,
      ),
      type: "CREATOR_STATEMENT",
      creatorProfileId: actor.creatorProfileId,
      periodStart: start,
      periodEnd: end,
      currency: obligations[0]?.currency ?? "NGN",
      grossAmount: gross,
      feeAmount: fee,
      netAmount: net,
      dedupeKey: `statement:${actor.creatorProfileId}:${period}`,
      snapshot: {
        period,
        items: obligations.map((item) => ({
          obligationId: item.id,
          campaign: item.participant.campaign.title,
          brand: item.participant.campaign.brand.name,
          gross: Number(item.grossAmount),
          fee: Number(item.platformFee),
          net: Number(item.netAmount),
          paidAt: item.paidAt?.toISOString(),
        })),
      },
    },
    update: {},
  });
}

export async function requireFinancialDocument(
  documentId: string,
  actorUserId: string,
) {
  const [actor, document] = await Promise.all([
    getWorkActor(actorUserId),
    prisma.financialDocument.findUnique({ where: { id: documentId } }),
  ]);
  if (!document) throw new Error("Document not found");
  const allowed = canAccessFinancialDocument({
    isPlatformAdmin: actor.isPlatformAdmin,
    actorCreatorProfileId: actor.creatorProfileId,
    actorBrandIds: actor.brandIds,
    documentCreatorProfileId: document.creatorProfileId,
    documentBrandId: document.brandId,
  });
  if (!allowed) throw new Error("Forbidden");
  return document;
}

export async function renderFinancialDocumentPdf(document: {
  documentNumber: string;
  type: string;
  currency: string;
  grossAmount: { toString(): string };
  feeAmount: { toString(): string };
  netAmount: { toString(): string };
  generatedAt: Date;
  snapshot: unknown;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const draw = (text: string, y: number, size = 11, strong = false) =>
    page.drawText(text.replace(/[^\x20-\x7E]/g, ""), {
      x: 54,
      y,
      size,
      font: strong ? bold : regular,
      color: rgb(0.04, 0.08, 0.18),
    });
  draw("WOOSH", 780, 22, true);
  draw(
    document.type === "CREATOR_STATEMENT"
      ? "Creator earnings statement"
      : "Brand payment receipt",
    744,
    18,
    true,
  );
  draw(`Document: ${document.documentNumber}`, 712);
  draw(`Generated: ${document.generatedAt.toISOString().slice(0, 10)}`, 694);
  draw(`Gross: ${document.currency} ${document.grossAmount}`, 650, 13, true);
  draw(`Platform fee: ${document.currency} ${document.feeAmount}`, 626);
  draw(`Creator net: ${document.currency} ${document.netAmount}`, 602, 13, true);
  const snapshot = JSON.stringify(document.snapshot, null, 2)
    .replace(/[^\x20-\x7E\n]/g, "")
    .slice(0, 2600);
  let y = 560;
  for (const line of snapshot.split("\n")) {
    if (y < 60) break;
    draw(line.slice(0, 90), y, 8);
    y -= 11;
  }
  return pdf.save();
}
