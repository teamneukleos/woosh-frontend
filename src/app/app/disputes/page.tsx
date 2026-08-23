import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listDisputesForUser } from "@/domains/payments/disputes";
import { AppPage } from "@/components/ui/app-page";
import { EmptyState, Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function DisputesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const disputes = await listDisputesForUser(session.user.id);
  return (
    <AppPage
      eyebrow="Payment support"
      title="Disputes"
      description="Track payment issues, evidence and platform resolutions."
    >
      {disputes.length ? (
        <ul className="grid gap-3">
          {disputes.map((dispute) => (
            <li key={dispute.id}>
              <Panel className="bg-white">
                <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Link href={`/app/disputes/${dispute.id}`} className="break-words font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]">
                      {dispute.subject}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                      {dispute.obligation.participant.campaign.title} · {dispute.category.replaceAll("_", " ")}
                    </p>
                  </div>
                  <StatusBadge status={dispute.status} />
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No payment disputes" description="Payment issues raised from Earnings or Payments will appear here." />
      )}
    </AppPage>
  );
}
