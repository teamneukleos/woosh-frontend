import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Check,
  ChevronRight,
  Mail,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listJobsForCreator } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { FilterChips } from "@/components/ui/filter-chips";

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

type Job = Awaited<ReturnType<typeof listJobsForCreator>>[number];
type Tag = { label: string; icon: LucideIcon } | null;

const TINTS = [
  "bg-[#eef2ff] text-[#4f5bd5]",
  "bg-[#ecfdf3] text-[#2f855a]",
  "bg-[#fff4e5] text-[#b7791f]",
  "bg-[#fdf0f5] text-[#b83280]",
  "bg-[#eaf4fb] text-[#2b6cb0]",
];

function tintFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return TINTS[sum % TINTS.length];
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function Mark({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl font-semibold ${tintFor(name)} ${
        large ? "size-14 text-xl" : "size-11 text-base"
      }`}
    >
      {initial(name)}
    </span>
  );
}

function TagPill({ tag }: { tag: NonNullable<Tag> }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--woosh-blue)]/10 px-2.5 py-1 text-xs font-medium text-[var(--woosh-blue)]">
      <Glyph icon={tag.icon} size={13} weight="light" />
      {tag.label}
    </span>
  );
}

function Rate({ job, large = false }: { job: Job; large?: boolean }) {
  if (job.rateAmount == null) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <Glyph
        icon={Wallet}
        size={large ? 18 : 16}
        weight="light"
        className="text-[#9b9da3]"
      />
      <span
        className={`font-semibold tabular-nums text-[var(--woosh-navy)] ${
          large ? "text-xl" : "text-base"
        }`}
      >
        {Number(job.rateAmount).toLocaleString()}
        <span className="ml-1 text-xs font-medium text-[var(--text-muted)]">
          {job.currency}
        </span>
      </span>
    </span>
  );
}

function FeaturedJob({ job, tag }: { job: Job; tag: Tag }) {
  return (
    <Link
      href={`/app/jobs/${job.id}`}
      className="group block rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--woosh-blue)]/30 hover:bg-[#faf9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-blue)] sm:p-7"
    >
      <p className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--woosh-blue)]">
        <Glyph icon={Sparkles} size={15} weight="light" />
        Top match for you
      </p>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Mark name={job.brand.name} large />
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)] sm:text-2xl">
              {job.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {job.brand.name}
            </p>
            {tag ? (
              <div className="mt-3">
                <TagPill tag={tag} />
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-6 md:justify-end">
          <Rate job={job} large />
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--woosh-blue)]">
            View brief
            <Glyph
              icon={ChevronRight}
              size={16}
              className="transition group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function JobCard({ job, tag }: { job: Job; tag: Tag }) {
  return (
    <Link
      href={`/app/jobs/${job.id}`}
      className="group flex h-full flex-col rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--woosh-blue)]/30 hover:bg-[#faf9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-blue)]"
    >
      <div className="flex items-start justify-between gap-3">
        <Mark name={job.brand.name} />
        {tag ? <TagPill tag={tag} /> : null}
      </div>
      <h3 className="mt-4 line-clamp-2 break-words text-base font-semibold tracking-[-0.01em] text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)]">
        {job.title}
      </h3>
      <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
        {job.brand.name}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--woosh-border)] pt-4">
        <span className="mt-4">
          <Rate job={job} />
        </span>
        <span className="mt-4 inline-flex items-center gap-0.5 text-sm font-medium text-[var(--text-muted)] transition-colors group-hover:text-[var(--woosh-blue)]">
          View
          <Glyph
            icon={ChevronRight}
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const { tab } = await searchParams;
  const jobs = await listJobsForCreator(ctx.creatorProfile.id, tab);

  const tag: Tag =
    tab === "invited"
      ? { label: "Invited", icon: Mail }
      : tab === "applied"
        ? { label: "Applied", icon: Check }
        : null;

  const featured = !tab ? jobs[0] : undefined;
  const rest = featured ? jobs.slice(1) : jobs;

  return (
    <AppPage
      eyebrow="Opportunities"
      title="Jobs"
      description="Open briefs ranked to your channels, category, location and rates."
      toolbar={
        <FilterChips
          active={tab ?? ""}
          items={[
            { value: "", label: "All open", href: "/app/jobs" },
            { value: "invited", label: "Invited", href: "/app/jobs?tab=invited" },
            { value: "applied", label: "Applied", href: "/app/jobs?tab=applied" },
          ]}
        />
      }
    >
      {jobs.length ? (
        <div className="w-full space-y-6">
          {featured ? <FeaturedJob job={featured} tag={tag} /> : null}

          {rest.length ? (
            <section className="space-y-3">
              <h2 className="flex items-baseline gap-2 text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
                {featured ? "More briefs" : "Briefs"}
                <span className="text-sm font-medium tabular-nums text-[var(--text-muted)]">
                  {rest.length}
                </span>
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rest.map((job) => (
                  <li key={job.id}>
                    <JobCard job={job} tag={tag} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No jobs right now"
          description="Open jobs appear here ranked against your connected channels, category and rates."
        />
      )}
    </AppPage>
  );
}