import Link from "next/link";
import { toggleSaveCreatorAction } from "@/app/actions";
import { InterestButton } from "@/components/creator/interest-button";
import { ActionForm } from "@/components/ui/action-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SocialIcon, socialLabel } from "@/components/ui/social-icon";
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
  interested,
  activeBrandId,
}: {
  item: DiscoveryItem;
  saved: boolean;
  interested: boolean;
  activeBrandId?: string | null;
}) {
  const platforms = item.channels?.length
    ? item.channels
    : item.channel
      ? [item.channel]
      : [];
  const stats = [
    { label: "Followers", value: formatCompact(item.followers) },
    { label: "Engagement", value: formatEngagement(item.engagementRate) },
    { label: "Avg likes", value: formatCompact(item.averageLikes) },
    { label: "Avg views", value: formatCompact(item.averageViews) },
  ];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="relative flex items-center gap-2 overflow-hidden bg-[linear-gradient(115deg,#000000_0%,#003AF4_100%)] px-4 py-2.5 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(120%_140%_at_100%_-20%,rgb(0_58_244/0.45),transparent_52%)]">
        {platforms.map((channel) => (
          <span
            key={channel}
            title={socialLabel(channel) ?? channel}
            className="relative z-10 inline-flex rounded-md bg-white/95 p-1 shadow-[0_1px_2px_rgb(9_27_104/0.18)]"
          >
            <SocialIcon channel={channel} size="md" />
            <span className="sr-only">{socialLabel(channel)}</span>
          </span>
        ))}
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
            : "Estimate until they connect."}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
          {item.type === "claimed" ? (
            <ActionForm
              action={toggleSaveCreatorAction}
              successTitle={saved ? "Creator removed" : "Creator saved"}
              className="w-full sm:w-auto"
            >
              <input type="hidden" name="creatorProfileId" value={item.id} />
              <input type="hidden" name="saved" value={saved ? "1" : "0"} />
              <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
                {saved ? "Saved" : "Save"}
              </Button>
            </ActionForm>
          ) : null}
          <InterestButton
            interested={interested}
            activeBrandId={activeBrandId}
            prospectId={item.type === "prospect" ? item.id : undefined}
            creatorProfileId={item.type === "claimed" ? item.id : undefined}
          />
          <Link
            href={`/app/creators/${item.id}?type=${item.type}`}
            className="inline-flex h-10 w-full items-center justify-center px-2 text-sm font-medium text-[var(--woosh-blue)] hover:underline sm:h-8 sm:w-auto"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
