import { Badge } from "@/components/ui/badge";

const STATUS_TONE: Record<
  string,
  "blue" | "teal" | "navy" | "muted" | "warn"
> = {
  DRAFT: "muted",
  PENDING: "warn",
  PENDING_REVIEW: "warn",
  PUBLISHED: "blue",
  OPEN: "blue",
  ACTIVE: "teal",
  ACCEPTED: "teal",
  APPROVED: "teal",
  PAID: "teal",
  COMMITTED: "blue",
  DISPUTED: "warn",
  SHORTLISTED: "blue",
  DECLINED: "muted",
  REJECTED: "muted",
  CLOSED: "muted",
  COMPLETED: "navy",
  CLAIM_PENDING: "warn",
  UNCLAIMED: "teal",
  CLAIMED: "blue",
  FUNDED: "teal",
  OBLIGATED: "blue",
  FAILED: "warn",
};

/** Maps domain status enums to Badge tones. */
export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const tone = STATUS_TONE[status] ?? "muted";
  return <Badge tone={tone}>{label ?? status.replaceAll("_", " ")}</Badge>;
}
