import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getBrief } from "@/domains/marketplace/briefs";
import {
  acceptOfferAction,
  counterOfferAction,
  pipelineAction,
  publishBriefAction,
} from "@/app/actions";
import { BackLink } from "@/components/ui/back-link";
import { Panel, EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { ActionForm } from "@/components/ui/action-form";
import { VerifiedCheck } from "@/components/ui/verified-check";
import { formatHandle } from "@/lib/handle";
import { ChannelMark } from "@/components/ui/social-icon";

function statusTone(status: string) {
  if (status === "OPEN") return "teal" as const;
  if (status === "DRAFT" || status === "PENDING_MODERATION")
    return "warn" as const;
  if (status === "ACCEPTED" || status === "SHORTLISTED") return "blue" as const;
  if (status === "DECLINED") return "muted" as const;
  return "navy" as const;
}

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const brief = await getBrief(id, session.user.id);
  if (!brief) notFound();

  return (
    <AppPage
      eyebrow={brief.brand.name}
      title={brief.title}
      description={brief.description}
      actions={<Badge tone={statusTone(brief.status)}>{brief.status}</Badge>}
    >
      <BackLink href="/app/briefs">Briefs</BackLink>

      <Panel>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
          <span className="rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-1.5 font-medium text-[var(--woosh-navy)]">
            {brief.rateAmount != null
              ? `${Number(brief.rateAmount).toLocaleString()} ${brief.currency}`
              : brief.rateMode.replaceAll("_", " ")}
          </span>
          <span className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-1.5">
            {brief.channels.length
              ? brief.channels.map((channel) => (
                  <ChannelMark key={channel} channel={channel} size="sm" />
                ))
              : "Any channel"}
          </span>
          <span className="rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-1.5">
            {brief.distribution.replaceAll("_", " ")}
          </span>
        </div>
        {brief.status === "DRAFT" || brief.status === "PENDING_MODERATION" ? (
          <ActionForm action={publishBriefAction} successTitle="Brief submitted" className="mt-6">
            <input type="hidden" name="briefId" value={brief.id} />
            <Button type="submit">
              {brief.status === "DRAFT" ? "Submit / publish" : "Re-submit"}
            </Button>
          </ActionForm>
        ) : null}
      </Panel>

      <section>
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
            Applicants pipeline
          </h2>
        {brief.applications.length ? (
          <ul className="mt-4 grid gap-4">
            {brief.applications.map((app) => (
              <li key={app.id}>
                <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={app.creator.displayName}
                      src={
                        app.creator.avatarStatus === "APPROVED"
                          ? app.creator.avatarUrl
                          : null
                      }
                    />
                    <div>
                    <div className="flex min-w-0 items-center gap-1.5">
                    <Link
                      href={`/app/creators/${app.creator.id}`}
                      className="truncate font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                    >
                      {app.creator.displayName}
                    </Link>
                    {app.creator.verifiedAt ? <VerifiedCheck size="sm" /> : null}
                    </div>
                    {app.creator.socialAccounts[0]?.handle ? (
                      <p className="mt-1 text-sm font-medium text-[var(--woosh-navy)]">
                        {formatHandle(app.creator.socialAccounts[0].handle)}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(app.status)}>{app.status}</Badge>
                      {app.proposedRate != null ? (
                        <span className="text-sm text-[var(--woosh-dull)]/70">
                          Proposed{" "}
                          {Number(app.proposedRate).toLocaleString()}{" "}
                          {app.currency}
                        </span>
                      ) : null}
                    </div>
                    {app.creator.socialAccounts[0]?.snapshots[0] ? (
                      <p className="mt-2 text-xs text-[var(--woosh-dull)]/65">
                        {app.creator.socialAccounts[0].snapshots[0].followers?.toLocaleString() ??
                          "—"}{" "}
                        followers ·{" "}
                        {app.creator.socialAccounts[0].snapshots[0]
                          .engagementRate != null
                          ? `${Number(
                              app.creator.socialAccounts[0].snapshots[0]
                                .engagementRate,
                            ).toFixed(1)}% ER`
                          : "ER pending"}
                        {app.creator.ratePackages[0]
                          ? ` · from ${app.creator.ratePackages[0].currency} ${Number(
                              app.creator.ratePackages[0].price,
                            ).toLocaleString()}`
                          : ""}
                      </p>
                    ) : null}
                    {app.offers[0] ? (
                      <p className="mt-2 text-xs text-[var(--woosh-dull)]/65">
                        Latest offer:{" "}
                        {Number(app.offers[0].amount).toLocaleString()}{" "}
                        {app.offers[0].currency} ({app.offers[0].status})
                      </p>
                    ) : null}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    {(["shortlist", "decline", "accept"] as const).map(
                      (action) => (
                        <ActionForm
                          key={action}
                          action={pipelineAction}
                          successTitle={
                            action === "shortlist"
                              ? "Creator shortlisted"
                              : action === "decline"
                                ? "Application declined"
                                : "Application accepted"
                          }
                        >
                          <input
                            type="hidden"
                            name="applicationId"
                            value={app.id}
                          />
                          <input type="hidden" name="action" value={action} />
                          <Button
                            type="submit"
                            size="sm"
                            variant={
                              action === "accept"
                                ? "primary"
                                : action === "decline"
                                  ? "ghost"
                                  : "secondary"
                            }
                            className="capitalize"
                          >
                            {action}
                          </Button>
                        </ActionForm>
                      ),
                    )}
                  </div>
                </div>
                <ActionForm
                  action={counterOfferAction}
                  successTitle="Counter-offer sent"
                  className="mt-4 grid min-w-0 gap-2 sm:flex sm:flex-wrap"
                >
                  <input type="hidden" name="applicationId" value={app.id} />
                  <Input
                    name="amount"
                    type="number"
                    required
                    placeholder="Counter amount"
                    className="max-w-[180px]"
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    Counter
                  </Button>
                </ActionForm>
                {app.offers[0] && app.offers[0].status !== "AGREED" ? (
                  <ActionForm
                    action={acceptOfferAction}
                    successTitle="Offer marked agreed"
                    className="mt-2"
                  >
                    <input
                      type="hidden"
                      name="offerId"
                      value={app.offers[0].id}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      Mark latest offer agreed
                    </Button>
                  </ActionForm>
                ) : null}
                </Panel>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No applications yet"
              description="Share the brief or invite creators from discovery."
            />
          </div>
        )}
      </section>
    </AppPage>
  );
}
