import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { AppPage } from "@/components/ui/app-page";
import { AgencyOnboarding } from "@/components/onboarding/agency-onboarding";
import { AgencyInviteStep } from "@/components/onboarding/agency-invite-step";
import { CreatorOnboarding } from "@/components/onboarding/creator-onboarding";
import { getCreatorProfile } from "@/domains/creator/profile";
import { creatorReadiness } from "@/domains/creator/media";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx) redirect("/login");

  if (ctx.kind === "creator" && ctx.creatorProfile) {
    const profile = await getCreatorProfile(ctx.user.emailVerified);
    const readiness = creatorReadiness(profile);
    return (
      <AppPage
        eyebrow="Creator onboarding"
        title="Build your storefront"
        description="Complete your identity, work samples, pricing and verified performance before brands discover you."
        width="narrow"
      >
        <CreatorOnboarding
          displayName={profile.displayName}
          percentage={readiness.percentage}
          status={profile.marketplaceStatus}
        />
      </AppPage>
    );
  }

  if (ctx.kind !== "agency" && ctx.kind !== "brand") redirect("/app");

  const { step } = await searchParams;
  const isAgency = ctx.kind === "agency";

  if (step === "invite" && ctx.brands.length > 0) {
    return (
      <AppPage
        eyebrow="Onboarding"
        title="Almost there"
        description="Invite a teammate or jump into the portfolio."
        width="narrow"
        className="max-w-lg"
      >
        <AgencyInviteStep />
      </AppPage>
    );
  }

  if (ctx.brands.length > 0) redirect("/app");

  return (
    <AppPage
      eyebrow="Onboarding"
      title={isAgency ? "Set up your agency" : "Set up your brand"}
      description={
        isAgency
          ? "Three quick steps to open discovery and briefs."
          : "Create your first brand line to open discovery and briefs."
      }
      width="narrow"
      className="max-w-lg"
    >
      <AgencyOnboarding
        kind={ctx.kind}
        orgName={ctx.organisation?.publicName ?? (isAgency ? "Agency" : "Brand")}
      />
    </AppPage>
  );
}
