CREATE TYPE "DisputeCategory" AS ENUM (
  'CONTENT_APPROVAL',
  'PAYMENT_AMOUNT',
  'PAYOUT_DELAY',
  'CANCELLATION',
  'OTHER'
);
CREATE TYPE "DisputeResolutionType" AS ENUM ('RELEASE_PAYOUT', 'REFUND_BRAND');
CREATE TYPE "FinancialDocumentType" AS ENUM ('CREATOR_STATEMENT', 'BRAND_RECEIPT');

ALTER TABLE "CreatorPayoutAccount"
  ALTER COLUMN "accountNumber" DROP NOT NULL,
  ADD COLUMN "encryptedAccountNumber" TEXT,
  ADD COLUMN "accountNumberLast4" TEXT,
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ADD COLUMN "verificationReference" TEXT;

UPDATE "CreatorPayoutAccount"
SET "accountNumberLast4" = RIGHT("accountNumber", 4),
    "recipientCode" = NULL,
    "accountNumber" = NULL,
    "verifiedAt" = NULL;

ALTER TABLE "PaymentObligation"
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "availableAt" TIMESTAMP(3),
  ADD COLUMN "processingAt" TIMESTAMP(3),
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "failedAt" TIMESTAMP(3),
  ADD COLUMN "reversedAt" TIMESTAMP(3),
  ADD COLUMN "failureReason" TEXT,
  ADD COLUMN "reversalReason" TEXT;

UPDATE "PaymentObligation"
SET "approvedAt" = CASE WHEN "status" IN ('APPROVED','PROCESSING','PAID','FAILED','DISPUTED') THEN "updatedAt" ELSE NULL END,
    "processingAt" = CASE WHEN "status" = 'PROCESSING' THEN "updatedAt" ELSE NULL END,
    "paidAt" = CASE WHEN "status" = 'PAID' THEN "updatedAt" ELSE NULL END,
    "failedAt" = CASE WHEN "status" = 'FAILED' THEN "updatedAt" ELSE NULL END,
    "reversedAt" = CASE WHEN "status" = 'REVERSED' THEN "updatedAt" ELSE NULL END;

DO $$
BEGIN
  IF EXISTS (
    SELECT "campaignParticipantId"
    FROM "PaymentObligation"
    GROUP BY "campaignParticipantId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate obligations must be reconciled before migration';
  END IF;
END $$;

CREATE UNIQUE INDEX "PaymentObligation_campaignParticipantId_key"
  ON "PaymentObligation"("campaignParticipantId");
CREATE INDEX "PaymentObligation_status_availableAt_idx"
  ON "PaymentObligation"("status", "availableAt");

ALTER TABLE "LedgerTransaction"
  ADD COLUMN "failureReason" TEXT,
  ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "Dispute"
  ADD COLUMN "resolvedById" TEXT,
  ADD COLUMN "obligationId" TEXT,
  ADD COLUMN "category" "DisputeCategory" DEFAULT 'OTHER',
  ADD COLUMN "requestedResolution" TEXT,
  ADD COLUMN "resolutionType" "DisputeResolutionType",
  ADD COLUMN "responseDueAt" TIMESTAMP(3),
  ADD COLUMN "resolvedAt" TIMESTAMP(3);

UPDATE "Dispute" AS d
SET "obligationId" = (
  SELECT po."id"
  FROM "PaymentObligation" po
  JOIN "CampaignParticipant" cp ON cp."id" = po."campaignParticipantId"
  WHERE cp."campaignId" = d."campaignId"
  ORDER BY po."createdAt" ASC
  LIMIT 1
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Dispute"
    WHERE "campaignId" IS NULL OR "obligationId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Legacy disputes must be linked to an obligation before migration';
  END IF;
END $$;

ALTER TABLE "Dispute"
  ALTER COLUMN "campaignId" SET NOT NULL,
  ALTER COLUMN "obligationId" SET NOT NULL,
  ALTER COLUMN "category" SET NOT NULL,
  ALTER COLUMN "category" DROP DEFAULT;

ALTER TABLE "Dispute"
  ADD CONSTRAINT "Dispute_raisedById_fkey"
    FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Dispute_resolvedById_fkey"
    FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Dispute_obligationId_fkey"
    FOREIGN KEY ("obligationId") REFERENCES "PaymentObligation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Dispute_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Dispute_obligationId_status_idx" ON "Dispute"("obligationId", "status");
CREATE INDEX "Dispute_status_responseDueAt_idx" ON "Dispute"("status", "responseDueAt");

CREATE TABLE "FinancialDocument" (
  "id" TEXT NOT NULL,
  "documentNumber" TEXT NOT NULL,
  "type" "FinancialDocumentType" NOT NULL,
  "creatorProfileId" TEXT,
  "brandId" TEXT,
  "obligationId" TEXT,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "grossAmount" DECIMAL(12,2) NOT NULL,
  "feeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "netAmount" DECIMAL(12,2) NOT NULL,
  "snapshot" JSONB NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FinancialDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FinancialDocument_creatorProfileId_fkey"
    FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "FinancialDocument_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "FinancialDocument_obligationId_fkey"
    FOREIGN KEY ("obligationId") REFERENCES "PaymentObligation"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FinancialDocument_documentNumber_key" ON "FinancialDocument"("documentNumber");
CREATE UNIQUE INDEX "FinancialDocument_dedupeKey_key" ON "FinancialDocument"("dedupeKey");
CREATE INDEX "FinancialDocument_creatorProfileId_generatedAt_idx" ON "FinancialDocument"("creatorProfileId", "generatedAt");
CREATE INDEX "FinancialDocument_brandId_generatedAt_idx" ON "FinancialDocument"("brandId", "generatedAt");

CREATE TABLE "ProviderWebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "reference" TEXT,
  "payload" JSONB NOT NULL,
  "signature" TEXT,
  "processedAt" TIMESTAMP(3),
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProviderWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProviderWebhookEvent_eventKey_key" ON "ProviderWebhookEvent"("eventKey");
CREATE INDEX "ProviderWebhookEvent_provider_reference_idx" ON "ProviderWebhookEvent"("provider", "reference");
CREATE INDEX "ProviderWebhookEvent_processedAt_idx" ON "ProviderWebhookEvent"("processedAt");

ALTER TABLE "BrandWallet"
  ADD CONSTRAINT "BrandWallet_balance_nonnegative" CHECK ("balance" >= 0);
