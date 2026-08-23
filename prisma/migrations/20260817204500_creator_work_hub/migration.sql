-- Creator work hub: participant-owned deliverables and auditable submissions.
ALTER TABLE "BriefInvitation"
  ADD COLUMN "responseReason" TEXT;

ALTER TABLE "Application"
  ADD COLUMN "withdrawnAt" TIMESTAMP(3),
  ADD COLUMN "withdrawalReason" TEXT;

ALTER TABLE "CampaignParticipant"
  ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);

ALTER TABLE "Deliverable"
  ADD COLUMN "campaignParticipantId" TEXT,
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3);

-- Existing MVP campaigns have one creator. For defensive compatibility, choose
-- the earliest participant if historical data contains more than one.
UPDATE "Deliverable" AS d
SET "campaignParticipantId" = (
  SELECT cp."id"
  FROM "CampaignParticipant" AS cp
  WHERE cp."campaignId" = d."campaignId"
  ORDER BY cp."createdAt" ASC, cp."id" ASC
  LIMIT 1
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Deliverable" WHERE "campaignParticipantId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot assign an existing deliverable to a campaign participant';
  END IF;
END $$;

ALTER TABLE "Deliverable"
  ALTER COLUMN "campaignParticipantId" SET NOT NULL;

ALTER TABLE "Submission"
  ADD COLUMN "submittedById" TEXT,
  ADD COLUMN "storageKey" TEXT,
  ADD COLUMN "fileName" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "fileSizeBytes" INTEGER,
  ADD COLUMN "idempotencyKey" TEXT;

ALTER TABLE "Notification"
  ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "Submission_idempotencyKey_key"
  ON "Submission"("idempotencyKey");
CREATE INDEX "Submission_submittedById_submittedAt_idx"
  ON "Submission"("submittedById", "submittedAt");
CREATE UNIQUE INDEX "Notification_dedupeKey_key"
  ON "Notification"("dedupeKey");
CREATE INDEX "Deliverable_campaignParticipantId_state_dueAt_idx"
  ON "Deliverable"("campaignParticipantId", "state", "dueAt");

ALTER TABLE "Deliverable"
  ADD CONSTRAINT "Deliverable_campaignParticipantId_fkey"
  FOREIGN KEY ("campaignParticipantId")
  REFERENCES "CampaignParticipant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_submittedById_fkey"
  FOREIGN KEY ("submittedById")
  REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
