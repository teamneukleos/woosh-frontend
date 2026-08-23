"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/panel";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextArea, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { formatHandle } from "@/lib/handle";
import {
  adminApproveBriefAction,
  adminRejectBriefAction,
  adminSeedAction,
  adminSetAdminAction,
  adminVerifyOrgAction,
  adminModerateCreatorAction,
  adminModerateCreatorMediaAction,
} from "@/app/actions";

type PendingBrief = {
  id: string;
  title: string;
  brand: { name: string; organisation: { publicName: string } };
};

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  isPlatformAdmin: boolean;
  creatorProfile: { displayName: string } | null;
  memberships: { organisation: { type: string } }[];
};

type OrgRow = {
  id: string;
  publicName: string;
  type: string;
  verifiedAt: Date | null;
  brands: { id: string; name: string }[];
};

type CreatorModeration = {
  profiles: Array<{
    id: string;
    displayName: string;
    submittedAt: Date | null;
    _count: { portfolioItems: number; ratePackages: number };
    socialAccounts: Array<{ id: string; handle: string }>;
  }>;
  media: Array<{
    id: string;
    title: string;
    mediaType: string;
    url: string;
    creator: { displayName: string };
  }>;
};

type DisputeRow = {
  id: string;
  subject: string;
  status: string;
  category: string;
  campaignTitle: string;
  creatorName: string;
  responseDueAt: Date | null;
};

export function AdminOps({
  pending,
  prospectCount,
  users,
  adminCount,
  organisations,
  creatorModeration,
  disputes,
}: {
  pending: PendingBrief[];
  prospectCount: number;
  users: UserRow[];
  adminCount: number;
  organisations: OrgRow[];
  creatorModeration: CreatorModeration;
  disputes: DisputeRow[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Prospects" value={String(prospectCount)} tone="brand" />
        <Stat label="In moderation" value={String(pending.length)} tone="brand" />
        <Stat label="Users" value={String(users.length)} tone="brand" />
        <Stat label="Admins" value={String(adminCount)} tone="brand" />
      </div>

      <Tabs defaultValue="moderation" className="gap-0">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-[var(--woosh-border)] bg-transparent p-0">
          {(
            [
              ["moderation", `Moderation${pending.length ? ` · ${pending.length}` : ""}`],
              [
                "creators",
                `Creator review · ${creatorModeration.profiles.length + creatorModeration.media.length}`,
              ],
              ["orgs", "Organisations"],
              ["disputes", `Disputes${disputes.length ? ` · ${disputes.length}` : ""}`],
              ["prospects", "Prospect seed"],
              ["users", "Users"],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm data-[state=active]:border-[var(--woosh-blue)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--woosh-navy)] data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="moderation" className="mt-6">
          {pending.length ? (
            <Table>
              <THead>
                <TR>
                  <TH>Brief</TH>
                  <TH>Brand</TH>
                  <TH>Organisation</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {pending.map((b) => (
                  <TR key={b.id}>
                    <TD className="font-semibold">{b.title}</TD>
                    <TD>{b.brand.name}</TD>
                    <TD className="text-[var(--woosh-dull)]/70">
                      {b.brand.organisation.publicName}
                    </TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-2">
                        <ActionForm
                          action={adminApproveBriefAction}
                          successTitle="Brief approved"
                        >
                          <input type="hidden" name="briefId" value={b.id} />
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-[var(--woosh-teal)] text-[var(--woosh-navy)] shadow-none hover:bg-[var(--woosh-teal)]/85"
                          >
                            Approve
                          </Button>
                        </ActionForm>
                        <ActionForm
                          action={adminRejectBriefAction}
                          successTitle="Brief rejected"
                        >
                          <input type="hidden" name="briefId" value={b.id} />
                          <Button type="submit" size="sm" variant="secondary">
                            Reject
                          </Button>
                        </ActionForm>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              title="Moderation clear"
              description="No briefs waiting on platform review."
            />
          )}
        </TabsContent>

        <TabsContent value="creators" className="mt-6">
          <div className="grid gap-8">
            <section>
              <h3 className="font-semibold text-[var(--woosh-navy)]">
                Profile submissions
              </h3>
              <div className="mt-4 grid gap-3">
                {creatorModeration.profiles.map((profile) => (
                  <article
                    key={profile.id}
                    className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--woosh-navy)]">
                          {profile.displayName}
                        </p>
                        {profile.socialAccounts[0]?.handle ? (
                          <p className="mt-1 text-sm font-medium text-[var(--woosh-navy)]">
                            {formatHandle(profile.socialAccounts[0].handle)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-[var(--woosh-dull)]/60">
                          {profile.socialAccounts.length} connected channel
                          {profile.socialAccounts.length === 1 ? "" : "s"} ·{" "}
                          {profile._count.portfolioItems} samples ·{" "}
                          {profile._count.ratePackages} packages
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ActionForm
                          action={adminModerateCreatorAction}
                          successTitle="Creator approved"
                        >
                          <input
                            type="hidden"
                            name="creatorProfileId"
                            value={profile.id}
                          />
                          <input type="hidden" name="approve" value="1" />
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </ActionForm>
                        <ActionForm
                          action={adminModerateCreatorAction}
                          successTitle="Creator returned for changes"
                          className="flex gap-2"
                        >
                          <input
                            type="hidden"
                            name="creatorProfileId"
                            value={profile.id}
                          />
                          <input type="hidden" name="approve" value="0" />
                          <input
                            name="reason"
                            required
                            placeholder="Reason"
                            className="rounded-md border border-[var(--woosh-border)] px-2 text-sm"
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            Reject
                          </Button>
                        </ActionForm>
                      </div>
                    </div>
                  </article>
                ))}
                {!creatorModeration.profiles.length ? (
                  <EmptyState
                    title="No creator profiles waiting"
                    description="Submitted profiles will appear here."
                  />
                ) : null}
              </div>
            </section>
            <section>
              <h3 className="font-semibold text-[var(--woosh-navy)]">
                Portfolio media
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {creatorModeration.media.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white"
                  >
                    <div className="aspect-video bg-[var(--woosh-mist)]">
                      {item.mediaType === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : item.mediaType === "VIDEO" ? (
                        <video
                          src={item.url}
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-full items-center justify-center text-sm font-semibold text-[var(--woosh-blue)]"
                        >
                          Open post ↗
                        </a>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-[var(--woosh-navy)]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--woosh-dull)]/60">
                        {item.creator.displayName}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <ActionForm
                          action={adminModerateCreatorMediaAction}
                          successTitle="Media approved"
                        >
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="approve" value="1" />
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </ActionForm>
                        <ActionForm
                          action={adminModerateCreatorMediaAction}
                          successTitle="Media rejected"
                          className="flex gap-2"
                        >
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="approve" value="0" />
                          <input
                            name="reason"
                            required
                            placeholder="Reason"
                            className="min-w-0 rounded-md border border-[var(--woosh-border)] px-2 text-sm"
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            Reject
                          </Button>
                        </ActionForm>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="disputes" className="mt-6">
          {disputes.length ? (
            <Table>
              <THead>
                <TR>
                  <TH>Issue</TH>
                  <TH>Campaign</TH>
                  <TH>Creator</TH>
                  <TH>Status</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {disputes.map((dispute) => (
                  <TR key={dispute.id}>
                    <TD>
                      <p className="font-semibold">{dispute.subject}</p>
                      <p className="text-xs text-[var(--woosh-dull)]/60">
                        {dispute.category.replaceAll("_", " ")}
                      </p>
                    </TD>
                    <TD>{dispute.campaignTitle}</TD>
                    <TD>{dispute.creatorName}</TD>
                    <TD><Badge tone={dispute.status === "RESOLVED" ? "teal" : "warn"}>{dispute.status}</Badge></TD>
                    <TD><a href={`/app/disputes/${dispute.id}`} className="font-semibold text-[var(--woosh-blue)]">Review</a></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="No payment disputes" description="Open creator and brand payment issues appear here." />
          )}
        </TabsContent>

        <TabsContent value="orgs" className="mt-6">
          {organisations.length ? (
            <Table>
              <THead>
                <TR>
                  <TH>Organisation</TH>
                  <TH>Type</TH>
                  <TH>Brands</TH>
                  <TH>Verified</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {organisations.map((o) => (
                  <TR key={o.id}>
                    <TD className="font-semibold">{o.publicName}</TD>
                    <TD>{o.type}</TD>
                    <TD>{o.brands.map((b) => b.name).join(", ") || "—"}</TD>
                    <TD>{o.verifiedAt ? "Yes" : "No"}</TD>
                    <TD className="text-right">
                      <ActionForm
                        action={adminVerifyOrgAction}
                        successTitle="Organisation updated"
                      >
                        <input type="hidden" name="organisationId" value={o.id} />
                        <input
                          type="hidden"
                          name="verified"
                          value={o.verifiedAt ? "0" : "1"}
                        />
                        <Button type="submit" size="sm" variant="secondary">
                          {o.verifiedAt ? "Unverify" : "Verify"}
                        </Button>
                      </ActionForm>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="No organisations" description="" />
          )}
        </TabsContent>

        <TabsContent value="prospects" className="mt-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h3 className="font-display text-lg text-[var(--woosh-navy)]">
                Bulk seed
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--woosh-dull)]/70">
                One row per line. Categories must match taxonomy. Follower
                estimate is ops-only and never shown as verified.
              </p>
              <ActionForm
                action={adminSeedAction}
                successTitle="Prospects seeded"
                className="mt-5 grid gap-3"
              >
                <Label>
                  Rows
                  <TextArea
                    name="rows"
                    rows={8}
                    placeholder="INSTAGRAM|amaka.creates|Amaka|Lifestyle;Food & Drink|85000"
                    className="font-mono text-xs"
                  />
                </Label>
                <Button type="submit" className="w-fit">
                  Seed directory
                </Button>
              </ActionForm>
            </div>
            <aside className="border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/60 p-5">
              <p className="woosh-eyebrow text-[var(--woosh-blue)]">
                Format
              </p>
              <pre className="mt-3 overflow-x-auto text-xs leading-5 text-[var(--woosh-navy)]">
                {`CHANNEL|handle|Name|Cat;Cat|estimate

INSTAGRAM|amaka.creates|Amaka|Lifestyle|85000
TIKTOK|tiwa.eats|Tiwa|Food & Drink|`}
              </pre>
              <p className="mt-4 text-sm text-[var(--woosh-dull)]/65">
                {prospectCount} prospects currently in directory.
              </p>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Table>
            <THead>
              <TR>
                <TH>User</TH>
                <TH>Context</TH>
                <TH>Flags</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {users.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <p className="font-semibold">{u.name || u.email}</p>
                    <p className="text-xs text-[var(--woosh-dull)]/60">
                      {u.email}
                    </p>
                  </TD>
                  <TD className="text-[var(--woosh-dull)]/75">
                    {u.creatorProfile
                      ? `Creator · ${u.creatorProfile.displayName}`
                      : u.memberships[0]
                        ? u.memberships[0].organisation.type
                        : "—"}
                  </TD>
                  <TD>
                    {u.isPlatformAdmin ? (
                      <Badge tone="teal">admin</Badge>
                    ) : (
                      <span className="text-xs text-[var(--woosh-dull)]/45">
                        —
                      </span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <ActionForm
                      action={adminSetAdminAction}
                      successTitle={
                        u.isPlatformAdmin ? "Admin revoked" : "Admin granted"
                      }
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="hidden"
                        name="isAdmin"
                        value={u.isPlatformAdmin ? "0" : "1"}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        {u.isPlatformAdmin ? "Revoke" : "Make admin"}
                      </Button>
                    </ActionForm>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
