import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getClaimedCreator } from "@/domains/creator/prospects";
import { CreatorIntel } from "@/components/creator/creator-intel";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { AppPage } from "@/components/ui/app-page";

export default async function CreatorProfilePreviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");
  const profile = await getClaimedCreator(ctx.creatorProfile.id, {
    userId: session.user.id,
  });
  if (!profile) redirect("/app/profile");

  return (
    <AppPage
      eyebrow="Public profile"
      title="Profile preview"
      description="This is how approved profile content appears to brands."
      actions={<Badge tone="warn">Approved content only</Badge>}
      width="wide"
    >
      <BackLink href="/app/profile">Back to editing</BackLink>
      <CreatorIntel profile={profile} />
    </AppPage>
  );
}
