import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, X, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listJobsForCreator } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { declineInvitationAction } from "@/app/actions";
import { ButtonLink } from "@/components/ui/button-link";

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

type Invite = {
  id: string;
  briefId: string;
  status: string;
  message?: string | null;
  brief: {
    title: string;
    brand: { name: string };
    applicationDeadline: Date | null;
  };
};

function InviteCard({ inv }: { inv: Invite }) {
  return (
    <article className="flex flex-col rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Mark name={inv.brief.brand.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--woosh-navy)]">
                {inv.brief.brand.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                invited you to apply
              </p>
            </div>
          </div>
          <WorkStatus
            status={inv.status}
            dueAt={inv.brief.applicationDeadline}
          />
        </div>

        <Link
          href={`/app/jobs/${inv.briefId}`}
          className="mt-5 block break-words text-xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)] transition-colors hover:text-[var(--woosh-blue)]"
        >
          {inv.brief.title}
        </Link>

        {inv.message ? (
          <div className="mt-4 rounded-2xl rounded-tl-md bg-[#f4f5f7] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="line-clamp-4 break-words">{inv.message}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 rounded-b-2xl border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-4 sm:px-6">
        <ButtonLink href={`/app/jobs/${inv.briefId}`} size="sm">
          Review
        </ButtonLink>

        <ActionForm
          action={declineInvitationAction}
          successTitle="Invitation declined"
          className="block"
        >
          <input type="hidden" name="invitationId" value={inv.id} />
          <details className="group relative">
            <summary
              aria-label="Decline invitation"
              title="Decline"
              className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-[#6b6d74] transition-colors hover:bg-black/[0.05] group-open:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-blue)] [&::-webkit-details-marker]:hidden"
            >
              <Glyph icon={X} size={18} />
            </summary>
            <div className="absolute bottom-full right-0 z-10 mb-2 grid w-72 max-w-[80vw] gap-2 rounded-xl border border-[var(--woosh-border)] bg-white p-3 shadow-lg">
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Let the brand know why (optional)
              </p>
              <Input name="reason" placeholder="Reason (optional)" />
              <Button type="submit" variant="secondary" size="sm">
                Decline invitation
              </Button>
            </div>
          </details>
        </ActionForm>
      </div>
    </article>
  );
}

function PastRow({ inv }: { inv: Invite }) {
  return (
    <li>
      <Link
        href={`/app/jobs/${inv.briefId}`}
        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none sm:px-6"
      >
        <Mark name={inv.brief.brand.name} small />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)]">
            {inv.brief.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-[var(--text-secondary)]">
            {inv.brief.brand.name}
          </span>
        </span>
        <span className="hidden shrink-0 sm:block">
          <WorkStatus
            status={inv.status}
            dueAt={inv.brief.applicationDeadline}
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

export default async function InvitationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const jobs = await listJobsForCreator(ctx.creatorProfile.id, "invited");
  const invites = jobs.flatMap((job) =>
    job.myInvitation
      ? [
          {
            id: job.myInvitation.id,
            briefId: job.id,
            status: job.myInvitation.status,
            message: job.myInvitation.message,
            brief: {
              title: job.title,
              brand: job.brand,
              applicationDeadline: job.applicationDeadline
                ? new Date(job.applicationDeadline)
                : null,
            },
          },
        ]
      : [],
  );

  const pending = invites.filter((inv) =>
    ["SENT", "VIEWED"].includes(inv.status),
  );
  const past = invites.filter(
    (inv) => !["SENT", "VIEWED"].includes(inv.status),
  );
  const countOf = (status: string) =>
    invites.filter((inv) => inv.status === status).length;

  const summary = [
    {
      label: "Waiting for reply",
      value: pending.length,
      highlight: pending.length > 0,
    },
    { label: "Accepted", value: countOf("ACCEPTED") },
    { label: "Declined", value: countOf("DECLINED") },
    { label: "Expired", value: countOf("EXPIRED") },
  ];

  return (
    <AppPage
      eyebrow="Jobs"
      title="Invitations"
      description="Direct invites from brands and agencies."
    >
      {invites.length ? (
        <div className="w-full space-y-6">
          <section
            aria-label="Invitation summary"
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

          {pending.length ? (
            <section className="space-y-3">
              <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
                Waiting for your reply
              </h2>
              <ul
                className={`grid gap-4 ${
                  pending.length > 1 ? "lg:grid-cols-2" : ""
                }`}
              >
                {pending.map((inv) => (
                  <li key={inv.id} className="flex">
                    <div className="w-full">
                      <InviteCard inv={inv} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {past.length ? (
            <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
              <div className="flex items-baseline justify-between gap-4 border-b border-[var(--woosh-border)] px-5 py-3.5 sm:px-6">
                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
                  {pending.length ? "Earlier invitations" : "Invitations"}
                </h2>
                <p className="text-sm tabular-nums text-[var(--text-muted)]">
                  {past.length}
                </p>
              </div>
              <ul className="divide-y divide-[var(--woosh-border)]">
                {past.map((inv) => (
                  <PastRow key={inv.id} inv={inv} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No invitations"
          description="When brands invite you to a brief, they show up here."
        />
      )}
    </AppPage>
  );
}