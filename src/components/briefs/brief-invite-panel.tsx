import Link from "next/link";
import { inviteToBriefAction } from "@/app/actions";
import { Panel, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select, TextArea } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";

type Invited = {
  id: string;
  creatorProfileId: string | null;
  prospectId?: string | null;
  status: string;
  creator?: { id: string; displayName: string } | null;
  prospect?: { id: string; handle: string; displayName: string | null } | null;
  outreach?: {
    state: string;
    reason: string | null;
  } | null;
};

/** Honest label for an invitation to an unclaimed creator. */
function outreachLabel(outreach: NonNullable<Invited["outreach"]>) {
  switch (outreach.state) {
    case "CLAIMED":
      return { label: "Claimed", tone: "teal" as const };
    case "CONTACTED":
      return { label: "Contacted by Woosh", tone: "navy" as const };
    case "EMAIL_SENT":
      return { label: "Claim email sent", tone: "navy" as const };
    case "AWAITING_OUTREACH":
      return {
        label:
          outreach.reason === "EMAIL_FAILED"
            ? "Email failed · Woosh will follow up"
            : "Awaiting Woosh outreach",
        tone: "warn" as const,
      };
    default:
      return { label: "Invited", tone: "navy" as const };
  }
}

type InviteOption = {
  id: string;
  displayName: string;
  kind: "claimed" | "prospect";
};

export function BriefInvitePanel({
  briefId,
  distribution,
  invited,
  creators,
  readOnly = false,
}: {
  briefId: string;
  distribution: string;
  invited: Invited[];
  creators: InviteOption[];
  readOnly?: boolean;
}) {
  const invitedKeys = new Set(
    invited.flatMap((row) => {
      const keys: string[] = [];
      if (row.creatorProfileId) keys.push(`claimed:${row.creatorProfileId}`);
      if (row.prospectId) keys.push(`prospect:${row.prospectId}`);
      return keys;
    }),
  );
  const available = creators.filter(
    (creator) => !invitedKeys.has(`${creator.kind}:${creator.id}`),
  );
  const inviteOnly = distribution === "INVITE_ONLY";

  return (
    <Panel
      title="Invite creators"
      description={
        readOnly
          ? "Who this brand invited. Use Open profile from Moderation if you need to reach an unclaimed handle."
          : inviteOnly
          ? "This brief is not on the open marketplace. Claimed creators and unclaimed handles only see it after you invite them. Unclaimed accounts must finish profile setup before they can apply."
          : "Invite a claimed creator or an unclaimed handle. Unclaimed creators with an email get a claim email; the Woosh team contacts the rest for you. They must finish profile setup before they can take the work."
      }
    >
      {invited.length ? (
        <ul className="mb-4 grid gap-2">
          {invited.map((row) => {
            const name =
              row.creator?.displayName ||
              row.prospect?.displayName ||
              (row.prospect?.handle ? `@${row.prospect.handle}` : "Creator");
            const href = row.creatorProfileId
              ? `/app/creators/${row.creatorProfileId}`
              : row.prospectId
                ? `/app/creators/${row.prospectId}?type=prospect`
                : null;
            return (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] px-3 py-2 text-sm"
              >
                {href ? (
                  <Link
                    href={href}
                    className="font-medium text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                  >
                    {name}
                    {row.prospectId && !row.creatorProfileId ? " (unclaimed)" : ""}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--woosh-navy)]">{name}</span>
                )}
                {(() => {
                  // Once claimed, the invitation's own status (viewed, declined…) is the news.
                  const outreach =
                    row.outreach && !row.creatorProfileId
                      ? outreachLabel(row.outreach)
                      : null;
                  return outreach ? (
                    <Badge tone={outreach.tone}>{outreach.label}</Badge>
                  ) : (
                    <Badge tone="navy">{row.status.replaceAll("_", " ")}</Badge>
                  );
                })()}
              </li>
            );
          })}
        </ul>
      ) : null}

      {readOnly ? (
        invited.length ? null : (
          <EmptyState
            title="No invites yet"
            description="This brief has not invited anyone."
          />
        )
      ) : available.length ? (
        <ActionForm
          action={inviteToBriefAction}
          successTitle="Invitation sent"
          className="grid gap-3"
        >
          <input type="hidden" name="briefId" value={briefId} />
          <Label>
            Creator
            <Select
              name="target"
              required
              defaultValue={`${available[0]?.kind}:${available[0]?.id}`}
            >
              {available.map((creator) => (
                <option key={`${creator.kind}:${creator.id}`} value={`${creator.kind}:${creator.id}`}>
                  {creator.kind === "prospect"
                    ? `${creator.displayName} (unclaimed)`
                    : creator.displayName}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Message
            <TextArea name="message" rows={2} placeholder="Optional note" />
          </Label>
          <Button type="submit" className="w-fit">
            Send invitation
          </Button>
        </ActionForm>
      ) : (
        <EmptyState
          title={creators.length ? "Everyone here is already invited" : "No creators to invite"}
          description="Open Creators to find a claimed profile or an unclaimed handle."
          action={
            <Link
              href="/app/creators"
              className="text-sm font-medium text-[var(--woosh-blue)] hover:underline"
            >
              Find creators
            </Link>
          }
        />
      )}
    </Panel>
  );
}
