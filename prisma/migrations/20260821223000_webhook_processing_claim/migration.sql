ALTER TABLE "ProviderWebhookEvent"
  ADD COLUMN "processingStartedAt" TIMESTAMP(3);

CREATE INDEX "ProviderWebhookEvent_processingStartedAt_idx"
  ON "ProviderWebhookEvent"("processingStartedAt");
