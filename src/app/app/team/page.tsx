import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { api } from "@/lib/api";
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

  const team = await api<{
    members: Array<{
      userId: string;
      email: string;
      name: string | null;
      role: string;
    }>;
  }>("/team");

  const members = team.members.map((member) => ({
    id: member.userId,
    role: member.role,
    user: { name: member.name, email: member.email },
  }));

  return (
    <AppPage
      eyebrow="Organisation"
      title="Team"
      description="Members and roles. Invites create memberships and send email when Resend is configured."
      width="wide"
      className="w-full max-w-none"
    >
      <div className="w-full space-y-7">
        <section className="w-full overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--woosh-border)] bg-[var(--woosh-mist)]/40 px-5 py-5 md:px-7">
            <div>
              <h2 className="text-base font-bold tracking-tight text-[var(--woosh-navy)]">
                Team members
              </h2>
              <p className="mt-1.5 text-xs font-medium text-[var(--text-muted)]">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>

            <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-[var(--woosh-border)] bg-white px-3 text-sm font-bold tabular-nums text-[var(--woosh-navy)] shadow-sm">
              {members.length}
            </div>
          </div>

          {members.length ? (
            <ul className="divide-y divide-[var(--woosh-border)]">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="group flex min-w-0 items-center gap-4 px-5 py-5 transition-colors hover:bg-[var(--woosh-mist)]/35 md:px-7"
                >
                  <div className="shrink-0 rounded-full ring-4 ring-transparent transition-all group-hover:ring-[var(--woosh-blue)]/[0.06]">
                    <Avatar name={m.user.name || m.user.email} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--woosh-navy)]">
                      {m.user.name || m.user.email}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                      {m.user.email}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Badge tone="navy">{m.role}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 md:p-8">
              <EmptyState
                title="No members"
                description="You should see at least yourself."
              />
            </div>
          )}
        </section>

        {canManageTeam ? (
          <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="border-b border-[var(--woosh-border)] px-5 py-5 md:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woosh-blue)]/[0.08] text-[var(--woosh-blue)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6" />
                    <path d="M22 11h-6" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-base font-bold tracking-tight text-[var(--woosh-navy)]">
                    Invite teammate
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                    Sends an invite email and adds existing users immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-7">
              <ActionForm
                action={inviteTeammateAction}
                successTitle="Invite sent"
                className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-end"
              >
                <Label>
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
                    {canAssignAdmin ? (
                      <option value="ADMIN">Admin</option>
                    ) : null}
                  </Select>
                </Label>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full md:w-auto"
                  >
                    Send invite
                  </Button>
                </div>
              </ActionForm>
            </div>
          </section>
        ) : null}
      </div>
    </AppPage>
  );
}