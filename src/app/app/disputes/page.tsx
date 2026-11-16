import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { listDisputesForUser } from "@/domains/payments/disputes";
import { AppPage } from "@/components/ui/app-page";
import { EmptyState } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

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

const COLUMNS =
  "md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_16px] md:items-center md:gap-4";

function humanize(value: string) {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default async function DisputesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const disputes = await listDisputesForUser(session.user.id);

  return (
    <AppPage
      eyebrow="Payment support"
      title="Disputes"
      description="Track payment issues, evidence and platform resolutions."
      width="wide"
      className="w-full max-w-none"
    >
      {disputes.length ? (
        <section
          aria-label="Your disputes"
          className="w-full overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
              Your disputes
            </h2>
            <p className="text-sm tabular-nums text-[var(--text-secondary)]">
              {disputes.length} {disputes.length === 1 ? "dispute" : "disputes"}
            </p>
          </div>

          <div
            aria-hidden="true"
            className={`hidden border-b border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:px-6 ${COLUMNS}`}
          >
            <span>Dispute</span>
            <span>Campaign</span>
            <span>Category</span>
            <span>Status</span>
            <span />
          </div>

          <ul className="divide-y divide-[var(--woosh-border)]">
            {disputes.map((dispute) => (
              <li key={dispute.id}>
                <Link
                  href={`/app/disputes/${dispute.id}`}
                  className={`group flex flex-col gap-3 px-5 py-4 outline-none transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woosh-blue)] sm:px-6 ${COLUMNS}`}
                >
                  <h3 className="min-w-0 break-words text-sm font-semibold leading-6 text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)] group-hover:underline group-hover:underline-offset-4 sm:text-base">
                    {dispute.subject}
                  </h3>

                  <div className="flex min-w-0 items-center justify-between gap-3 md:block">
                    <span className="text-xs text-[var(--text-muted)] md:hidden">
                      Campaign
                    </span>
                    <span className="min-w-0 break-words text-right text-sm text-[var(--woosh-navy)] md:text-left">
                      {dispute.obligation.participant.campaign.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:block">
                    <span className="text-xs text-[var(--text-muted)] md:hidden">
                      Category
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {humanize(dispute.category)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:block">
                    <span className="text-xs text-[var(--text-muted)] md:hidden">
                      Status
                    </span>
                    <StatusBadge status={dispute.status} />
                  </div>

                  <Glyph
                    icon={ChevronRight}
                    size={16}
                    className="hidden text-[#c2c4c9] transition group-hover:translate-x-0.5 group-hover:text-[var(--woosh-blue)] md:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          title="No payment disputes"
          description="Payment issues raised from Earnings or Payments will appear here."
          action={
            <Link
              href="/app/earnings"
              className="group inline-flex items-center gap-0.5 font-semibold text-[var(--woosh-blue)]"
            >
              Go to earnings
              <Glyph
                icon={ChevronRight}
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          }
        />
      )}
    </AppPage>
  );
}