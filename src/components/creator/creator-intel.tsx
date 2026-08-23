import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChannelMark } from "@/components/ui/social-icon";
import { Panel } from "@/components/ui/panel";
import { VerifiedCheck } from "@/components/ui/verified-check";
import { formatHandle } from "@/lib/handle";
import { ProgressBar } from "@/components/ui/progress";

type Snapshot = {
  followers: number | null;
  engagementRate: unknown;
  averageViews: number | null;
  audienceGeo: unknown;
  audienceAge: unknown;
  audienceGender: unknown;
  source: string;
  capturedAt: Date;
};

type CreatorIntelProfile = {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  avatarStatus: string;
  coverUrl: string | null;
  coverStatus: string;
  verifiedAt: Date | null;
  websiteUrl: string | null;
  locationCountry: string | null;
  locationState: string | null;
  locationCity: string | null;
  categories: string[];
  languages: string[];
  availabilityNotes: string | null;
  socialAccounts: Array<{
    id: string;
    channel: string;
    handle: string;
    lastRefreshedAt: Date | null;
    snapshots: Snapshot[];
  }>;
  portfolioItems: Array<{
    id: string;
    mediaType: string;
    title: string;
    description: string | null;
    brandName: string | null;
    campaignType: string | null;
    url: string;
  }>;
  ratePackages: Array<{
    id: string;
    channel: string;
    deliverableType: string;
    title: string;
    description: string | null;
    price: unknown;
    currency: string;
    turnaroundDays: number | null;
    revisions: number;
    usageRights: string | null;
  }>;
};

function numeric(value: unknown) {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function AudienceList({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([label, amount]) => [label, numeric(amount)] as const)
    .filter((entry): entry is readonly [string, number] => entry[1] != null)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (!entries.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--woosh-navy)]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {entries.map(([label, amount]) => (
          <li key={label}>
            <div className="flex justify-between text-xs">
              <span>{label}</span>
              <span>{amount.toFixed(amount <= 1 ? 1 : 0)}%</span>
            </div>
            <div className="mt-1">
              <ProgressBar
                value={Math.min(100, amount <= 1 ? amount * 100 : amount)}
                barClassName="bg-[var(--woosh-blue)]"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CreatorIntel({ profile }: { profile: CreatorIntelProfile }) {
  const latestSnapshots = profile.socialAccounts.map((account) => ({
    account,
    snapshot: account.snapshots[0],
  }));
  const audienceSnapshot = latestSnapshots.find(
    ({ snapshot }) =>
      snapshot?.audienceGeo ||
      snapshot?.audienceAge ||
      snapshot?.audienceGender,
  )?.snapshot;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white">
        <div className="h-44 bg-gradient-to-br from-[var(--woosh-navy)] to-[var(--woosh-blue)]">
          {profile.coverUrl && profile.coverStatus === "APPROVED" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="px-6 pb-6">
          <Avatar
            name={profile.displayName}
            src={
              profile.avatarStatus === "APPROVED" ? profile.avatarUrl : null
            }
            size="lg"
            className="-mt-10 size-20 border-4 border-white text-lg"
          />
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex min-w-0 items-center gap-1.5">
                <h2 className="truncate text-xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)]">
                  {profile.displayName}
                </h2>
                {profile.verifiedAt ? <VerifiedCheck size="lg" /> : null}
              </div>
              {profile.socialAccounts[0]?.handle ? (
                <p className="mt-1 text-sm font-medium text-[var(--woosh-navy)]">
                  {formatHandle(profile.socialAccounts[0].handle)}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-[var(--woosh-dull)]/65">
                {[
                  profile.locationCity,
                  profile.locationState,
                  profile.locationCountry,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location not listed"}
              </p>
            </div>
            {profile.websiteUrl ? (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-[var(--woosh-blue)]"
              >
                Visit website ↗
              </a>
            ) : null}
          </div>
          <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">
            {profile.bio || "This creator has not added a bio yet."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.categories.map((category) => (
              <Badge key={category}>{category}</Badge>
            ))}
            {profile.languages.map((language) => (
              <Badge key={language} tone="muted">
                {language}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <Panel title="Channel performance">
        <div className="grid gap-4 md:grid-cols-3">
          {latestSnapshots.map(({ account, snapshot }) => (
            <article
              key={account.id}
              className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <ChannelMark
                    channel={account.channel}
                    className="text-xs font-semibold text-[var(--woosh-navy)]"
                  />
                  <p className="mt-2 font-semibold text-[var(--woosh-navy)]">
                    @{account.handle}
                  </p>
                </div>
                <span className="text-[0.65rem] text-[var(--woosh-dull)]/50">
                  {snapshot
                    ? new Date(snapshot.capturedAt).toLocaleDateString()
                    : "Pending"}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-[var(--woosh-dull)]/55">
                    Followers
                  </dt>
                  <dd className="font-semibold text-[var(--woosh-navy)]">
                    {snapshot?.followers?.toLocaleString() ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--woosh-dull)]/55">
                    Engagement
                  </dt>
                  <dd className="font-semibold text-[var(--woosh-navy)]">
                    {numeric(snapshot?.engagementRate) != null
                      ? `${numeric(snapshot?.engagementRate)!.toFixed(2)}%`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--woosh-dull)]/55">
                    Avg views
                  </dt>
                  <dd className="font-semibold text-[var(--woosh-navy)]">
                    {snapshot?.averageViews?.toLocaleString() ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--woosh-dull)]/55">
                    Follower growth
                  </dt>
                  <dd className="font-semibold text-[var(--woosh-navy)]">
                    {snapshot?.followers != null &&
                    account.snapshots.at(-1)?.followers != null
                      ? `${snapshot.followers - account.snapshots.at(-1)!.followers! >= 0 ? "+" : ""}${(
                          snapshot.followers -
                          account.snapshots.at(-1)!.followers!
                        ).toLocaleString()}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--woosh-dull)]/55">
                    Source
                  </dt>
                  <dd className="truncate text-xs font-semibold text-[var(--woosh-navy)]">
                    {snapshot?.source.replaceAll("_", " ") ?? "Pending"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Selected work">
        {profile.portfolioItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolioItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white"
              >
                <div className="aspect-[4/3] bg-[var(--woosh-mist)]">
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
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full items-center justify-center p-5 text-center font-semibold text-[var(--woosh-blue)]"
                    >
                      View social post ↗
                    </a>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--woosh-navy)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--woosh-dull)]/60">
                    {[item.brandName, item.campaignType]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--woosh-dull)]/75">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--woosh-dull)]/65">
            No approved samples yet.
          </p>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Panel title="Packages">
          <div className="grid gap-3">
            {profile.ratePackages.map((rate) => (
              <article
                key={rate.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white p-4"
              >
                <div>
                  <ChannelMark channel={rate.channel} />
                  <h3 className="mt-2 font-semibold text-[var(--woosh-navy)]">
                    {rate.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/65">
                    {rate.deliverableType} · {rate.turnaroundDays ?? "—"} days ·{" "}
                    {rate.revisions} revision{rate.revisions === 1 ? "" : "s"}
                  </p>
                  {rate.description ? (
                    <p className="mt-2 text-sm text-[var(--woosh-dull)]/75">
                      {rate.description}
                    </p>
                  ) : null}
                </div>
                <p className="text-lg font-semibold text-[var(--woosh-navy)]">
                  {rate.currency} {numeric(rate.price)?.toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Audience">
          {audienceSnapshot ? (
            <div className="grid gap-6">
              <AudienceList title="Top locations" value={audienceSnapshot.audienceGeo} />
              <AudienceList title="Age" value={audienceSnapshot.audienceAge} />
              <AudienceList title="Gender" value={audienceSnapshot.audienceGender} />
            </div>
          ) : (
            <p className="text-sm text-[var(--woosh-dull)]/65">
              Audience data is not available from this creator’s connected
              providers.
            </p>
          )}
        </Panel>
      </div>

      {profile.availabilityNotes ? (
        <Panel title="Availability">
          <p className="text-sm leading-6 text-[var(--woosh-dull)]">
            {profile.availabilityNotes}
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
