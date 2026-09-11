import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCreatorProfile } from "@/domains/creator/profile";
import { CreatorIntel } from "@/components/creator/creator-intel";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { AppPage } from "@/components/ui/app-page";

export default async function CreatorProfilePreviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");
  const profile = await getCreatorProfile(ctx.user.emailVerified);

  return (
    <AppPage
      eyebrow="Public profile"
      title="Profile preview"
      description="This is how approved profile content appears to brands."
      actions={<Badge tone="warn">Approved content only</Badge>}
      width="wide"
    >
      <BackLink href="/app/profile">Back to editing</BackLink>
      <CreatorIntel
        profile={{
          displayName: profile.displayName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          avatarStatus: "PENDING",
          coverUrl: profile.coverUrl,
          coverStatus: "PENDING",
          verifiedAt: profile.verifiedAt,
          websiteUrl: profile.websiteUrl,
          locationCountry: profile.locationCountry,
          locationState: profile.locationState,
          locationCity: profile.locationCity,
          categories: profile.categories,
          languages: profile.languages,
          availabilityNotes: profile.availabilityNotes,
          socialAccounts: profile.socialAccounts.map((account) => ({
            id: account.id,
            channel: account.channel,
            handle: account.handle,
            lastRefreshedAt: account.lastRefreshedAt,
            snapshots: account.snapshots.map((snapshot) => ({
              followers: snapshot.followers,
              engagementRate: snapshot.engagementRate,
              averageViews: snapshot.averageViews,
              audienceGeo: null,
              audienceAge: null,
              audienceGender: null,
              source: snapshot.source,
              capturedAt: snapshot.capturedAt
                ? new Date(snapshot.capturedAt)
                : new Date(),
            })),
          })),
          portfolioItems: profile.portfolioItems.map((item) => ({
            id: item.id,
            mediaType: item.mediaType ?? "LINK",
            title: item.title ?? "Work sample",
            description: item.description ?? null,
            brandName: item.brandName ?? null,
            campaignType: item.campaignType ?? null,
            url: item.url ?? "",
          })),
          ratePackages: profile.ratePackages.map((rate) => ({
            ...rate,
            description: rate.description,
            turnaroundDays: rate.turnaroundDays,
            revisions: rate.revisions,
            usageRights: rate.usageRights,
          })),
        }}
      />
    </AppPage>
  );
}
