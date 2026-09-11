import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { AppPage } from "@/components/ui/app-page";
import { hasPermission } from "@/lib/permissions";
import { SettingsSections } from "@/components/settings/settings-sections";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx) redirect("/login");
  const canManageOrganisation =
    ctx.user.isPlatformAdmin ||
    (!!ctx.membership &&
      hasPermission(ctx.membership.role, "team.manage", ctx.membership));

  return (
    <AppPage
      eyebrow="Account"
      title="Settings"
      description="Profile, organisation, brands, notifications, and security."
      className="max-w-2xl"
    >
      <SettingsSections
        kind={ctx.kind}
        hasCreator={!!ctx.creatorProfile}
        canManageOrganisation={canManageOrganisation}
        notificationPreferences={{
          emailNotifications: ctx.user.emailNotifications,
          weeklyDigest: ctx.user.weeklyDigest,
        }}
        organisation={
          ctx.organisation
            ? {
                publicName: ctx.organisation.publicName,
                website: ctx.organisation.website ?? null,
                industry: ctx.organisation.industry ?? null,
              }
            : null
        }
      />
    </AppPage>
  );
}
