import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { BriefComposer } from "@/components/briefs/brief-composer";
import { hasPermission } from "@/lib/permissions";

export default async function NewBriefPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");
  if (!ctx.activeBrandId) redirect("/app/onboarding");
  if (
    !ctx.user.isPlatformAdmin &&
    (!ctx.membership ||
      !hasPermission(ctx.membership.role, "briefs.manage", ctx.membership))
  ) {
    redirect("/app/briefs");
  }

  return <BriefComposer brandId={ctx.activeBrandId} />;
}
