"use client";

import {
  connectSocialAction,
  refreshSocialMetricsAction,
} from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOCIAL_CHANNELS } from "@/lib/taxonomy";
import { SocialIcon } from "@/components/ui/social-icon";

type ConnectedAccount = {
  id: string;
  channel: string;
  handle: string;
  status: string;
  lastRefreshedAt: Date | string | null;
  followers: number | null;
  source: string | null;
  engagementRate: number | null;
  averageViews: number | null;
};

export function SocialConnections({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--woosh-dull)]/75">
        Connect Instagram, TikTok, or YouTube. Instagram needs a Business or
        Creator account linked to a Facebook Page — personal profiles cannot
        share metrics. Connect YouTube with Google. Creators never type follower
        counts.
      </p>

      <ul className="grid gap-3">
        {SOCIAL_CHANNELS.map((ch) => {
          const connected = accounts.find((a) => a.channel === ch.value);
          return (
            <li
              key={ch.value}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-[var(--woosh-navy)]">
                  <SocialIcon channel={ch.value} size="md" />
                  {ch.label}
                </p>
                {connected ? (
                  <div className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                    <p>
                      @{connected.handle}
                      {connected.status === "PENDING"
                        ? " · awaiting provider auth"
                        : connected.status === "ACTIVE" &&
                            connected.followers == null
                          ? " · metrics sync pending"
                          : ""}
                    </p>
                    {connected.source &&
                    connected.source !== "manual_unverified" ? (
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {connected.followers != null ? (
                          <span>
                            {connected.followers.toLocaleString()} followers
                          </span>
                        ) : null}
                        {connected.engagementRate != null ? (
                          <span>{connected.engagementRate.toFixed(2)}% ER</span>
                        ) : null}
                        {connected.averageViews != null ? (
                          <span>
                            {connected.averageViews.toLocaleString()} avg views
                          </span>
                        ) : null}
                        {connected.lastRefreshedAt ? (
                          <span>
                            Synced{" "}
                            {new Date(
                              connected.lastRefreshedAt,
                            ).toLocaleDateString()}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/60">
                    {ch.value === "YOUTUBE"
                      ? "Needs a YouTube channel, not only a Google login"
                      : ch.value === "INSTAGRAM"
                        ? "Needs a Business or Creator account + Facebook Page"
                        : "Not connected"}
                  </p>
                )}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {connected ? (
                  <Badge
                    tone={
                      connected.status === "ACTIVE"
                        ? "teal"
                        : connected.status === "PENDING"
                          ? "warn"
                          : "muted"
                    }
                  >
                    {connected.status === "ACTIVE"
                      ? "Connected"
                      : connected.status}
                  </Badge>
                ) : null}
                <ActionForm
                  action={connectSocialAction}
                  successTitle={connected ? "Reconnect started" : "Connect started"}
                >
                  <input type="hidden" name="channel" value={ch.value} />
                  <Button type="submit" size="sm" variant="secondary">
                    {connected ? "Reconnect" : "Connect"}
                  </Button>
                </ActionForm>
                {connected?.status === "ACTIVE" ? (
                  <ActionForm
                    action={refreshSocialMetricsAction}
                    successTitle="Metrics refresh queued"
                  >
                    <input
                      type="hidden"
                      name="socialAccountId"
                      value={connected.id}
                    />
                    <Button type="submit" size="sm" variant="ghost">
                      Refresh
                    </Button>
                  </ActionForm>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
