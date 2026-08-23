import Link from "next/link";
import {
  expressInterestAction,
  toggleSaveCreatorAction,
} from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChannelMark, socialLabel } from "@/components/ui/social-icon";
import { VerifiedCheck } from "@/components/ui/verified-check";
import type { DiscoveryItem } from "@/domains/creator/prospects";
import { formatHandle } from "@/lib/handle";
import {
  formatCompact,
  formatEngagement,
} from "@/lib/discovery-stats";

export function CreatorDiscoveryCard({
  item,
  saved,
  activeBrandId,
}: {
  item: DiscoveryItem;
  saved: boolean;
  activeBrandId?: string | null;
}) {
  const platform = socialLabel(item.channel) ?? "Social";
  const stats = [
    { label: "Followers", value: formatCompact(item.followers) },
    { label: "Engagement", value: formatEngagement(item.engagementRate) },
    { label: "Avg likes", value: formatCompact(item.averageLikes) },
    { label: "Avg views", value: formatCompact(item.averageViews) },
  ];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3 bg-[var(--woosh-navy)] px-4 py-2.5 text-white">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          {item.channel ? (
            <ChannelMark channel={item.channel} size="sm" />
          ) : null}
          {platform}
        </span>
        <StatusBadge
          status={item.type === "prospect" ? "UNCLAIMED" : "CLAIMED"}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <Avatar name={item.displayName} src={item.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/app/creators/${item.id}?type=${item.type}`}
              className="inline-flex max-w-full items-center gap-1.5 font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
            >
              <span className="truncate">{item.displayName}</span>
              {item.verified ? <VerifiedCheck /> : null}
            </Link>
            <p className="truncate text-sm text-[var(--text-secondary)]">
              {formatHandle(item.handle) ?? "No handle"}
            </p>
            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
              {[item.locationCity, ...item.categories.slice(0, 2)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/70 p-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[0.65rem] uppercase tracking-[0.04em] text-[var(--woosh-dull)]/55">
                {stat.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-[var(--woosh-navy)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[0.6875rem] text-[var(--text-muted)]">
          {item.metricsVerified
            ? "Live from the connected app."
            : "Estimate — unclaimed until they connect."}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {item.type === "claimed" ? (
            <ActionForm
              action={toggleSaveCreatorAction}
              successTitle={saved ? "Creator removed" : "Creator saved"}
            >
              <input type="hidden" name="creatorProfileId" value={item.id} />
              <input type="hidden" name="saved" value={saved ? "1" : "0"} />
              <Button type="submit" size="sm" variant="secondary">
                {saved ? "Saved" : "Save"}
              </Button>
            </ActionForm>
          ) : null}
          <ActionForm action={expressInterestAction} successTitle="Interest sent">
            <input type="hidden" name="brandId" value={activeBrandId ?? ""} />
            {item.type === "prospect" ? (
              <input type="hidden" name="prospectId" value={item.id} />
            ) : (
              <input type="hidden" name="creatorProfileId" value={item.id} />
            )}
            <Button type="submit" size="sm" disabled={!activeBrandId}>
              Interested
            </Button>
          </ActionForm>
          <Link
            href={`/app/creators/${item.id}?type=${item.type}`}
            className="inline-flex h-8 items-center px-2 text-sm font-medium text-[var(--woosh-blue)] hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
