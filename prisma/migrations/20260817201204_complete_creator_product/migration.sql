-- CreateEnum
CREATE TYPE "CreatorMarketplaceStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CreatorMediaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PortfolioMediaType" AS ENUM ('IMAGE', 'VIDEO', 'EMBED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PROFILE_VIEW', 'CREATOR_SAVED', 'CREATOR_UNSAVED', 'INVITE_SENT', 'INVITE_VIEWED', 'INVITE_ACCEPTED', 'INVITE_DECLINED', 'APPLICATION_SUBMITTED', 'APPLICATION_SHORTLISTED', 'APPLICATION_ACCEPTED', 'APPLICATION_DECLINED', 'CAMPAIGN_STARTED', 'DELIVERABLE_APPROVED', 'CONTENT_LIVE', 'CAMPAIGN_COMPLETED');

-- AlterTable
ALTER TABLE "BriefInvitation" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "viewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CampaignMetric" ADD COLUMN     "creatorProfileId" TEXT,
ADD COLUMN     "deliverableId" TEXT,
ADD COLUMN     "postUrl" TEXT,
ADD COLUMN     "submissionId" TEXT;

-- AlterTable
ALTER TABLE "CreatorListItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "avatarStatus" "CreatorMediaStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "avatarStorageKey" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "coverStatus" "CreatorMediaStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "coverStorageKey" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "marketplaceStatus" "CreatorMarketplaceStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "moderationNotes" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "websiteUrl" TEXT,
ALTER COLUMN "profileVisible" SET DEFAULT false;

-- CreateTable
CREATE TABLE "CreatorPortfolioItem" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "mediaType" "PortfolioMediaType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "channel" "SocialChannel",
    "campaignType" TEXT,
    "brandName" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "thumbnailUrl" TEXT,
    "thumbnailStorageKey" TEXT,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CreatorMediaStatus" NOT NULL DEFAULT 'PENDING',
    "moderationNotes" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorRatePackage" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "channel" "SocialChannel" NOT NULL,
    "deliverableType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "turnaroundDays" INTEGER,
    "revisions" INTEGER NOT NULL DEFAULT 1,
    "usageRights" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorRatePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "actorUserId" TEXT,
    "organisationId" TEXT,
    "brandId" TEXT,
    "creatorProfileId" TEXT,
    "briefId" TEXT,
    "campaignId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorPortfolioItem_creatorProfileId_status_sortOrder_idx" ON "CreatorPortfolioItem"("creatorProfileId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "CreatorRatePackage_creatorProfileId_active_sortOrder_idx" ON "CreatorRatePackage"("creatorProfileId", "active", "sortOrder");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_creatorProfileId_eventType_createdAt_idx" ON "AnalyticsEvent"("creatorProfileId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_brandId_eventType_createdAt_idx" ON "AnalyticsEvent"("brandId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_campaignId_eventType_createdAt_idx" ON "AnalyticsEvent"("campaignId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignMetric_creatorProfileId_capturedAt_idx" ON "CampaignMetric"("creatorProfileId", "capturedAt");

-- CreateIndex
CREATE INDEX "CampaignMetric_deliverableId_capturedAt_idx" ON "CampaignMetric"("deliverableId", "capturedAt");

-- AddForeignKey
ALTER TABLE "CreatorPortfolioItem" ADD CONSTRAINT "CreatorPortfolioItem_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorRatePackage" ADD CONSTRAINT "CreatorRatePackage_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMetric" ADD CONSTRAINT "CampaignMetric_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMetric" ADD CONSTRAINT "CampaignMetric_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMetric" ADD CONSTRAINT "CampaignMetric_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
