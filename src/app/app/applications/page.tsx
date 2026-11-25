import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ChevronRight, Undo2, Wallet, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listJobsForCreator } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { withdrawApplicationAction } from "@/app/actions";

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

function Mark({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl font-semibold ${tintFor(name)} ${
        small ? "size-10 text-base" : "size-12 text-lg"
      }`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

type App = {
  id: string;
  briefId: string;
  status: string;
  proposedRate: number | null;
  currency: string;
  brief: {
    title: string;
    brand: { name: string };
    applicationDeadline: Date | null;
  };
  offers: Array<{ amount: number; currency: string }>;
};

const STEPS = ["Applied", "Shortlisted", "Accepted"] as const;

function stageOf(status: string) {
  if (status === "APPLIED") return 0;
  if (status === "SHORTLISTED") return 1;
  if (status === "ACCEPTED") return 2;
  return -1;
}

function Track({ status }: { status: string }) {
  const current = stageOf(status);
  if (current < 0) return null;
  return (
    <ol
      aria-label="Application progress"
      className="flex items-center gap-2 text-xs font-medium"
    >
      {STEPS.map((label, i) => {
        const complete = i < current || (current === 2 && i === 2);
        const active = i === current && !complete;
        return (
          <li
            key={label}
            className="flex min-w-0 flex-1 items-center gap-2 last:flex-none"
          >
            <span
              aria-hidden="true"
              className={`grid size-5 shrink-0 place-items-center rounded-full ${
                complete
                  ? "bg-[var(--woosh-blue)] text-white"
                  : active
                    ? "border-2 border-[var(--woosh-blue)] bg-white"
                    : "border border-[var(--woosh-border)] bg-white"
              }`}
            >
              {complete ? (
                <Glyph icon={Check} size={12} weight="regular" />
              ) : active ? (
                <span className="size-1.5 rounded-full bg-[var(--woosh-blue)]" />
              ) : null}
            </span>
            <span
              className={`truncate ${
                complete || active
                  ? "text-[var(--woosh-navy)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={`h-px min-w-3 flex-1 ${
                  i < current
                    ? "bg-[var(--woosh-blue)]"
                    : "bg-[var(--woosh-border)]"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function AppCard({ app }: { app: App }) {
  const canWithdraw = ["APPLIED", "SHORTLISTED"].includes(app.status);
  const offer = app.offers[0];
  return (
    <article className="flex flex-col rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Mark name={app.brief.brand.name} />
            <div className="min-w-0">
              <Link
                href={`/app/jobs/${app.briefId}`}
                className="block break-words text-[0.9375rem] font-semibold text-[var(--woosh-navy)] transition-colors hover:text-[var(--woosh-blue)] sm:text-lg"
              >
                {app.brief.title}
              </Link>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {app.brief.brand.name}
              </p>
            </div>
          </div>
          <WorkStatus
            status={app.status}
            dueAt={app.brief.applicationDeadline}
          />
        </div>

        {app.proposedRate != null || offer ? (
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {app.proposedRate != null ? (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Your proposal
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold tabular-nums text-[var(--woosh-navy)]">
                  <Glyph
                    icon={Wallet}
                    size={16}
                    weight="light"
                    className="text-[#9b9da3]"
                  />
                  {Number(app.proposedRate).toLocaleString()}
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {app.currency}
                  </span>
                </p>
              </div>
            ) : null}
            {offer ? (
              <div>
                <p className="text-xs font-medium text-[var(--woosh-blue)]">
                  Offer
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--woosh-navy)]">
                  {Number(offer.amount).toLocaleString()}
                  <span className="ml-1 text-xs font-medium text-[var(--text-muted)]">
                    {offer.currency}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {stageOf(app.status) >= 0 ? (
          <div className="mt-6 border-t border-[var(--woosh-border)] pt-5">
            <Track status={app.status} />
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 rounded-b-2xl border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-3 sm:px-6">
        <Link
          href={`/app/jobs/${app.briefId}`}
          className="group inline-flex items-center gap-0.5 text-sm font-medium text-[var(--woosh-blue)] focus-visible:outline-none focus-visible:underline"
        >
          View brief
          <Glyph
            icon={ChevronRight}
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </Link>

        {canWithdraw ? (
          <ActionForm
            action={withdrawApplicationAction}
            successTitle="Application withdrawn"
            className="block"
          >
            <input type="hidden" name="applicationId" value={app.id} />
            <details className="group relative">
              <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[#6b6d74] transition-colors hover:bg-black/[0.05] group-open:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-blue)] [&::-webkit-details-marker]:hidden">
                <Glyph icon={Undo2} size={16} />
                Withdraw
              </summary>
              <div className="absolute bottom-full right-0 z-10 mb-2 grid w-72 max-w-[80vw] gap-2 rounded-xl border border-[var(--woosh-border)] bg-white p-3 shadow-lg">
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Let the brand know why (optional)
                </p>
                <Input name="reason" placeholder="Reason (optional)" />
                <Button type="submit" variant="secondary" size="sm">
                  Withdraw application
                </Button>
              </div>
            </details>
          </ActionForm>
        ) : null}
      </div>
    </article>
  );
}

function ClosedRow({ app }: { app: App }) {
  return (
    <li>
      <Link
        href={`/app/jobs/${app.briefId}`}
        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none sm:px-6"
      >
        <Mark name={app.brief.brand.name} small />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)]">
            {app.brief.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-[var(--text-secondary)]">
            {app.brief.brand.name}
          </span>
        </span>
        <span className="hidden shrink-0 sm:block">
          <WorkStatus
            status={app.status}
            dueAt={app.brief.applicationDeadline}
          />
        </span>
        <Glyph
          icon={ChevronRight}
          size={16}
          className="text-[#c2c4c9] transition group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const jobs = await listJobsForCreator(ctx.creatorProfile.id, "applied");
  const apps = jobs.flatMap((job) =>
    job.myApplication
      ? [
          {
            id: job.myApplication.id,
            briefId: job.id,
            status: job.myApplication.status,
            proposedRate: job.myApplication.proposedRate ?? null,
            currency: job.myApplication.currency ?? job.currency,
            brief: {
              title: job.title,
              brand: job.brand,
              applicationDeadline: job.applicationDeadline
                ? new Date(job.applicationDeadline)
                : null,
            },
            offers: [] as Array<{ amount: number; currency: string }>,
          },
        ]
      : [],
  );

  const closedStatuses = ["REJECTED", "WITHDRAWN"];
  const active = apps.filter((app) => !closedStatuses.includes(app.status));
  const closed = apps.filter((app) => closedStatuses.includes(app.status));
  const countOf = (status: string) =>
    apps.filter((app) => app.status === status).length;

  const summary = [
    {
      label: "In progress",
      value: countOf("APPLIED") + countOf("SHORTLISTED"),
    },
    {
      label: "Shortlisted",
      value: countOf("SHORTLISTED"),
      highlight: countOf("SHORTLISTED") > 0,
    },
    { label: "Accepted", value: countOf("ACCEPTED") },
    { label: "Closed", value: closed.length },
  ];

  return (
    <AppPage
      eyebrow="Jobs"
      title="Applications"
      description="Everything you’ve applied to, with current pipeline status."
    >
      {apps.length ? (
        <div className="w-full space-y-6">
          <section
            aria-label="Application summary"
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4"
          >
            {summary.map((cell) => (
              <div
                key={cell.label}
                className="flex min-w-0 flex-col gap-2 bg-white p-5"
              >
                <p className="text-sm font-medium text-[var(--text-muted)]">
                  {cell.label}
                </p>
                <p
                  className={`text-3xl font-semibold tracking-tight tabular-nums ${
                    cell.highlight
                      ? "text-[var(--woosh-blue)]"
                      : "text-[var(--woosh-navy)]"
                  }`}
                >
                  {cell.value}
                </p>
              </div>
            ))}
          </section>

          {active.length ? (
            <section className="space-y-3">
              <h2 className="flex items-baseline gap-2 text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
                Your applications
                <span className="text-sm font-medium tabular-nums text-[var(--text-muted)]">
                  {active.length}
                </span>
              </h2>
              <ul className="grid gap-4">
                {active.map((app) => (
                  <li key={app.id}>
                    <AppCard app={app} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {closed.length ? (
            <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
              <div className="flex items-baseline justify-between gap-4 border-b border-[var(--woosh-border)] px-5 py-3.5 sm:px-6">
                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
                  Closed
                </h2>
                <p className="text-sm tabular-nums text-[var(--text-muted)]">
                  {closed.length}
                </p>
              </div>
              <ul className="divide-y divide-[var(--woosh-border)]">
                {closed.map((app) => (
                  <ClosedRow key={app.id} app={app} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Browse open jobs and apply to get on a brand’s shortlist."
        />
      )}
    </AppPage>
  );
}