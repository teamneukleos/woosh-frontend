-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CreatorListItem" ALTER COLUMN "creatorProfileId" DROP NOT NULL;
ALTER TABLE "CreatorListItem" ADD COLUMN "prospectId" TEXT;

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('UNCLAIMED', 'CLAIM_PENDING', 'CLAIMED');

-- CreateEnum
CREATE TYPE "BrandInterestStatus" AS ENUM ('OPEN', 'INVITED', 'CLAIMED', 'CLOSED');

-- CreateTable
CREATE TABLE "CreatorProspect" (
    "id" TEXT NOT NULL,
    "channel" "SocialChannel" NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT,
    "locationCountry" TEXT,
    "locationCity" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followerEstimate" INTEGER,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" "ProspectStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "claimedProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandInterest" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "prospectId" TEXT,
    "creatorProfileId" TEXT,
    "message" TEXT,
    "status" "BrandInterestStatus" NOT NULL DEFAULT 'OPEN',
    "claimToken" TEXT NOT NULL,
    "claimTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProspect_claimedProfileId_key" ON "CreatorProspect"("claimedProfileId");

-- CreateIndex
CREATE INDEX "CreatorProspect_status_idx" ON "CreatorProspect"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProspect_channel_handle_key" ON "CreatorProspect"("channel", "handle");

-- CreateIndex
CREATE UNIQUE INDEX "BrandInterest_claimToken_key" ON "BrandInterest"("claimToken");

-- CreateIndex
CREATE INDEX "BrandInterest_brandId_status_idx" ON "BrandInterest"("brandId", "status");

-- CreateIndex
CREATE INDEX "BrandInterest_prospectId_idx" ON "BrandInterest"("prospectId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorListItem_listId_prospectId_key" ON "CreatorListItem"("listId", "prospectId");

-- AddForeignKey
ALTER TABLE "CreatorProspect" ADD CONSTRAINT "CreatorProspect_claimedProfileId_fkey" FOREIGN KEY ("claimedProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandInterest" ADD CONSTRAINT "BrandInterest_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandInterest" ADD CONSTRAINT "BrandInterest_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "CreatorProspect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandInterest" ADD CONSTRAINT "BrandInterest_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandInterest" ADD CONSTRAINT "BrandInterest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorListItem" ADD CONSTRAINT "CreatorListItem_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "CreatorProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Conversation for claim/support threads
ALTER TABLE "Conversation" ADD COLUMN "brandId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "creatorProfileId" TEXT;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
