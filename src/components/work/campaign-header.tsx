import { Panel } from "@/components/ui/panel";

export function CampaignHeader({
  creatorName,
  agreedRate,
  currency,
  termsAcceptedAt,
}: {
  creatorName: string;
  agreedRate: number;
  currency: string;
  termsAcceptedAt?: Date | null;
}) {
  return (
    <Panel
      title="Commercial summary"
      description={`Agreed campaign terms for ${creatorName}`}
      variant="brand"
    >
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-white/55">
            Agreed rate
          </dt>
          <dd className="mt-1 font-semibold text-white">
            {agreedRate.toLocaleString()} {currency}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-white/55">
            Terms
          </dt>
          <dd className="mt-1 font-semibold text-white">
            {termsAcceptedAt
              ? `Accepted ${termsAcceptedAt.toLocaleDateString("en-NG")}`
              : "Awaiting acceptance"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-white/55">
            Support
          </dt>
          <dd className="mt-1 text-sm text-white/70">
            Use campaign messages for scope or deadline changes.
          </dd>
        </div>
      </dl>
    </Panel>
  );
}
