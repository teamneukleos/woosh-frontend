"use client";

import { useState } from "react";
import {
  adminRenewClaimLinkAction,
  adminUpdateInviteOutreachAction,
} from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatHandle } from "@/lib/handle";
import type {
  AdminInviteClaimLink,
  AdminInviteOutreach,
  OutreachChannel,
} from "@/domains/trust/admin";

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  INSTAGRAM_DM: "Instagram DM",
  TEXT: "Text message",
  EMAIL: "Email",
  OTHER: "Other",
};

export type InviteOutreachRow = {
  id: string;
  message: string | null;
  handle: string | null;
  contactEmail: string | null;
  contactPhone?: string | null;
  profileUrl: string | null;
  outreach?: AdminInviteOutreach | null;
  claimLink?: AdminInviteClaimLink | null;
  brief: { title: string; status: string };
  brand: { name: string };
  creatorName: string;
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Prepared message for an admin to send by hand. Woosh never sends it. */
export function outreachMessage(row: InviteOutreachRow) {
  const handle = formatHandle(row.handle) || "your profile";
  const expires = formatDate(row.claimLink?.expiresAt ?? null);
  const note = row.message?.trim();
  return [
    `Hi ${row.creatorName}, this is the Woosh team.`,
    `${row.brand.name} found ${handle} and invited you to their brief "${row.brief.title}" on Woosh, where brands hire and pay creators.`,
    note ? `Their note: "${note}"` : null,
    `To see the brief, claim your free Woosh creator profile here:\n${row.claimLink?.url ?? ""}`,
    expires
      ? `The link is just for you and expires on ${expires}. Reply here if you have any questions.`
      : "The link is just for you. Reply here if you have any questions.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          toast({
            title: "Couldn't copy",
            description: "Select the text and copy it manually.",
            tone: "error",
          });
        }
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

function OutreachBadge({ outreach }: { outreach: AdminInviteOutreach }) {
  switch (outreach.state) {
    case "CLAIMED":
      return <Badge tone="teal">claimed</Badge>;
    case "CONTACTED":
      return <Badge tone="navy">contacted</Badge>;
    case "EMAIL_SENT":
      return <Badge tone="navy">email sent</Badge>;
    case "AWAITING_OUTREACH":
      return (
        <Badge tone="warn">
          {outreach.reason === "EMAIL_FAILED" ? "email failed · reach out" : "awaiting outreach"}
        </Badge>
      );
    default:
      return <Badge tone="muted">email (unconfirmed)</Badge>;
  }
}

/**
 * Outreach cell for one invitation to an unclaimed creator on the ops Invites tab.
 * Opening the profile or copying never changes status; only "Mark as contacted" does.
 */
export function InviteOutreachCell({ row }: { row: InviteOutreachRow }) {
  const outreach = row.outreach;
  const link = row.claimLink;
  if (!outreach) return null;
  const open = outreach.state !== "CLAIMED";
  const linkReady = link?.state === "READY" && Boolean(link.url);

  return (
    <div className="grid min-w-[16rem] gap-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <OutreachBadge outreach={outreach} />
        {outreach.state === "CONTACTED" ? (
          <span className="text-[var(--woosh-dull)]/70">
            {outreach.channel ? CHANNEL_LABELS[outreach.channel] : "Contacted"}
            {outreach.contactedBy ? ` by ${outreach.contactedBy}` : ""}
            {outreach.contactedAt ? ` · ${formatDate(outreach.contactedAt)}` : ""}
          </span>
        ) : null}
      </div>
      {outreach.state === "CONTACTED" && outreach.note ? (
        <p className="text-[var(--woosh-dull)]/70">“{outreach.note}”</p>
      ) : null}

      {open ? (
        <>
          {/* Ways to reach them (admins only) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {row.profileUrl ? (
              <a
                href={row.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--woosh-blue)] hover:underline"
              >
                Open Instagram ↗
              </a>
            ) : (
              <span className="text-[var(--woosh-dull)]/70">No profile URL</span>
            )}
            {row.contactPhone ? (
              <span className="text-[var(--woosh-navy)]">Phone: {row.contactPhone}</span>
            ) : null}
            {row.contactEmail ? (
              <a
                href={`mailto:${row.contactEmail}`}
                className="text-[var(--woosh-blue)] hover:underline"
              >
                {row.contactEmail}
              </a>
            ) : null}
          </div>

          {/* Claim link */}
          {linkReady ? (
            <div className="grid gap-1.5">
              <Input
                readOnly
                value={link!.url!}
                aria-label={`Claim link for ${row.creatorName}`}
                onFocus={(event) => event.currentTarget.select()}
                className="sm:h-8 sm:text-xs"
              />
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton text={link!.url!} label="Copy link" />
                <CopyButton text={outreachMessage(row)} label="Copy message" />
                {link!.expiresAt ? (
                  <span className="text-[var(--woosh-dull)]/70">
                    Expires {formatDate(link!.expiresAt)}
                  </span>
                ) : null}
              </div>
            </div>
          ) : link?.canRenew ? (
            <ActionForm
              action={adminRenewClaimLinkAction}
              successTitle="Claim link ready"
              successDescription="Copy it or the prepared message below."
            >
              <input type="hidden" name="invitationId" value={row.id} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[var(--woosh-dull)]/70">
                  {link.state === "EXPIRED"
                    ? "Claim link expired."
                    : "No shareable link yet."}
                </span>
                <Button type="submit" size="sm" variant="secondary">
                  Create claim link
                </Button>
              </div>
            </ActionForm>
          ) : (
            <span className="text-[var(--woosh-dull)]/70">
              {link?.state === "UNAVAILABLE"
                ? "The claim link was emailed and can't be shown again."
                : "No claim record for this invite."}
            </span>
          )}

          {/* Explicit confirmation only */}
          {outreach.state === "CONTACTED" ? (
            <ActionForm
              action={adminUpdateInviteOutreachAction}
              successTitle="Marked as not contacted"
            >
              <input type="hidden" name="invitationId" value={row.id} />
              <input type="hidden" name="contacted" value="0" />
              <Button type="submit" size="sm" variant="ghost">
                Undo contacted
              </Button>
            </ActionForm>
          ) : (
            <ActionForm
              action={adminUpdateInviteOutreachAction}
              successTitle="Marked as contacted"
              confirmMessage="Only confirm once you have actually sent the message to this creator."
              className="grid gap-1.5"
            >
              <input type="hidden" name="invitationId" value={row.id} />
              <input type="hidden" name="contacted" value="1" />
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  name="channel"
                  required
                  defaultValue=""
                  aria-label="How you contacted them"
                  className="w-auto sm:h-8 sm:text-xs"
                >
                  <option value="" disabled>
                    Contacted via…
                  </option>
                  {(Object.keys(CHANNEL_LABELS) as OutreachChannel[]).map((channel) => (
                    <option key={channel} value={channel}>
                      {CHANNEL_LABELS[channel]}
                    </option>
                  ))}
                </Select>
                <Button type="submit" size="sm">
                  Mark as contacted
                </Button>
              </div>
              <Input
                name="note"
                maxLength={500}
                placeholder="Note (optional), e.g. sent from @joinwoosh"
                aria-label="Outreach note"
                className="sm:h-8 sm:text-xs"
              />
            </ActionForm>
          )}
        </>
      ) : null}
    </div>
  );
}
