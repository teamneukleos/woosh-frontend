
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
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

const STROKE = { light: 1.25, regular: 1.5 } as const;

function Glyph({
  icon: Icon,
  size = 18,
  weight = "regular",
  className = "",
}: {
  icon: LucideIcon;
  size?: number;
  weight?: keyof typeof STROKE;
  className?: string;
}) {
  return (
    <Icon
      size={size}
      strokeWidth={STROKE[weight]}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

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

  const profileHref = `/app/creators/${item.id}?type=${item.type}`;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <Avatar name={item.displayName} src={item.avatarUrl} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1">
              <Link
                href={profileHref}
                className="min-w-0 truncate text-[13px] font-semibold leading-5 text-[var(--woosh-navy)] hover:underline hover:underline-offset-4"
              >
                {item.displayName}
              </Link>
              {item.verified ? <VerifiedCheck /> : null}
            </div>

            <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
              {formatHandle(item.handle) ?? "No handle"}
            </p>

            {platforms.length ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {platforms.map((channel) => (
                  <span
                    key={channel}
                    title={socialLabel(channel) ?? channel}
                    className="inline-flex h-5 w-5 items-center justify-center"
                  >
                    <SocialIcon channel={channel} size="sm" />
                    <span className="sr-only">{socialLabel(channel)}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-3 min-h-4 truncate text-xs text-[var(--text-secondary)]">
          {[item.locationCity, ...item.categories.slice(0, 2)]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 border-y border-[var(--woosh-border)] py-3">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="text-[11px] font-medium text-[var(--text-muted)]">
                {stat.label}
              </dt>
              <dd className="mt-0.5 truncate text-base font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-2.5 flex min-w-0 items-center gap-1.5">
          <span
            className={`size-1.5 shrink-0 rounded-full ${
              item.metricsVerified
                ? "bg-[#087d62]"
                : "bg-[var(--text-muted)]"
            }`}
          />
          <p className="truncate text-[11px] text-[var(--text-muted)]">
            {item.metricsVerified
              ? "Live from the connected app."
              : "Estimate until they connect."}
          </p>
        </div>

        <div className="mt-auto flex min-w-0 items-center gap-1.5 border-t border-[var(--woosh-border)] pt-3">
          <ActionForm
            action={toggleSaveCreatorAction}
            successTitle={saved ? "Removed from shortlist" : "Creator shortlisted"}
            className="min-w-0"
          >
            <input
              type="hidden"
              name={
                item.type === "prospect"
                  ? "prospectId"
                  : "creatorProfileId"
              }
              value={item.id}
            />
            <input type="hidden" name="saved" value={saved ? "1" : "0"} />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="h-8 px-2.5 text-xs"
            >
              {saved ? "Saved" : "Save"}
            </Button>
          </ActionForm>

          <div className="min-w-0 flex-1 [&_button]:h-8 [&_button]:px-2.5 [&_button]:text-xs">
            <InterestButton
              interested={interested}
              activeBrandId={activeBrandId}
              prospectId={item.type === "prospect" ? item.id : undefined}
              creatorProfileId={item.type === "claimed" ? item.id : undefined}
            />
          </div>

          <Link
            href={profileHref}
            className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--woosh-navy)] transition-colors hover:bg-[#faf9f7]"
          >
            View
            <Glyph
              icon={ChevronRight}
              size={14}
              className="text-[#c2c4c9] transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
