import Link from "next/link";
import { inviteToBriefAction } from "@/app/actions";
import { Panel, EmptyState } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select, TextArea } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";

type Invited = {
  id: string;
  creatorProfileId: string;
  status: string;
  creator?: { id: string; displayName: string };
};

type CreatorOption = {
  id: string;
  displayName: string;
};

export function BriefInvitePanel({
  briefId,
  distribution,
  invited,
  creators,
}: {
  briefId: string;
  distribution: string;
  invited: Invited[];
  creators: CreatorOption[];
}) {
  const invitedIds = new Set(invited.map((row) => row.creatorProfileId));
  const available = creators.filter((creator) => !invitedIds.has(creator.id));
  const inviteOnly = distribution === "INVITE_ONLY";

  return (
    <Panel
      title="Invite creators"
      description={
        inviteOnly
          ? "This brief is not on the open marketplace. Creators only see it after you invite them."
          : "Invite a claimed creator. They get an in-app notification and can apply from Jobs."
      }
    >
      {invited.length ? (
        <ul className="mb-4 grid gap-2">
          {invited.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] px-3 py-2 text-sm"
            >
              <Link
                href={`/app/creators/${row.creatorProfileId}`}
                className="font-medium text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
              >
                {row.creator?.displayName ?? "Creator"}
              </Link>
              <Badge tone="navy">{row.status.replaceAll("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {available.length ? (
        <ActionForm
          action={inviteToBriefAction}
          successTitle="Invitation sent"
          className="grid gap-3"
        >
          <input type="hidden" name="briefId" value={briefId} />
          <Label>
            Creator
            <Select name="creatorProfileId" required defaultValue={available[0]?.id}>
              {available.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.displayName}
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
          title={creators.length ? "Everyone here is already invited" : "No claimed creators yet"}
          description="Open Creators, pick a claimed profile, then invite them to this brief."
          action={
            <Link
              href="/app/creators?type=claimed"
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
