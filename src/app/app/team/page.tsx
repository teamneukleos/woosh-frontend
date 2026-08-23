import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { inviteTeammateAction } from "@/app/actions";
import { AppPage } from "@/components/ui/app-page";
import { Panel, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { hasPermission } from "@/lib/permissions";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.organisation) redirect("/app");
  const canManageTeam =
    ctx.user.isPlatformAdmin ||
    (!!ctx.membership &&
      hasPermission(ctx.membership.role, "team.manage", ctx.membership));
  const canAssignAdmin =
    ctx.membership?.role === "OWNER" || ctx.membership?.role === "ADMIN";

  const members = await prisma.membership.findMany({
    where: { organisationId: ctx.organisation.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppPage
      eyebrow="Organisation"
      title="Team"
      description="Members and roles. Invites create memberships and send email when Resend is configured."
    >
      {members.length ? (
        <ul className="grid gap-3">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]"
            >
              <Avatar name={m.user.name || m.user.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--woosh-navy)]">
                  {m.user.name || m.user.email}
                </p>
                <p className="truncate text-sm text-[var(--woosh-dull)]/65">
                  {m.user.email}
                </p>
              </div>
              <Badge tone="navy">{m.role}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No members"
          description="You should see at least yourself."
        />
      )}

      {canManageTeam ? <Panel
        title="Invite teammate"
        description="Sends an invite email and adds existing users immediately."
      >
        <ActionForm
          action={inviteTeammateAction}
          successTitle="Invite sent"
          className="grid gap-3 sm:grid-cols-3"
        >
          <Label className="sm:col-span-1">
            Email
            <Input
              type="email"
              name="email"
              required
              placeholder="colleague@brand.ng"
            />
          </Label>
          <Label>
            Role
            <Select name="role" defaultValue="MANAGER">
              <option value="MANAGER">Manager</option>
              <option value="ACCOUNT_MANAGER">Account manager</option>
              <option value="FINANCE">Finance</option>
              <option value="VIEWER">Viewer</option>
              {canAssignAdmin ? <option value="ADMIN">Admin</option> : null}
            </Select>
          </Label>
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full">
              Send invite
            </Button>
          </div>
        </ActionForm>
      </Panel> : null}
    </AppPage>
  );
}
