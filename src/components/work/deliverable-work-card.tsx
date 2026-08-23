import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { ChannelMark } from "@/components/ui/social-icon";
import { WorkStatus } from "@/components/work/work-status";
import {
  acceptCampaignTermsAction,
  addCampaignContentToPortfolioAction,
  approveDeliverableAction,
  completeDeliverableAction,
  revisionAction,
  setDeliverableLiveAction,
  startDeliverableAction,
  submitDraftAction,
} from "@/app/actions";
import { DirectDeliverableUpload } from "@/components/work/direct-deliverable-upload";

type SubmissionItem = {
  id: string;
  version: number;
  draftUrl: string | null;
  liveUrl: string | null;
  notes: string | null;
  reviewNotes: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  submittedAt: Date;
  reviewedAt: Date | null;
};

export function DeliverableWorkCard({
  deliverable,
  isCreator,
  termsAccepted,
  campaignParticipantId,
}: {
  deliverable: {
    id: string;
    title: string;
    channel: string | null;
    requirements: unknown;
    dueAt: Date | null;
    state: string;
    submissions: SubmissionItem[];
  };
  isCreator: boolean;
  termsAccepted: boolean;
  campaignParticipantId: string;
}) {
  const latest = deliverable.submissions[0];
  const requirements =
    typeof deliverable.requirements === "string"
      ? deliverable.requirements
      : deliverable.requirements
        ? JSON.stringify(deliverable.requirements)
        : "Follow the agreed campaign brief and brand guidance.";

  return (
    <Panel className="bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--woosh-navy)]">
            {deliverable.title}
          </p>
          <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
            {deliverable.channel ? (
              <ChannelMark channel={deliverable.channel} size="sm" />
            ) : (
              "Campaign content"
            )}
          </p>
        </div>
        <WorkStatus status={deliverable.state} dueAt={deliverable.dueAt} />
      </div>

      <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/65 px-4 py-3">
        <p className="woosh-eyebrow">
          Requirements
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--woosh-navy)]">
          {requirements}
        </p>
      </div>

      {isCreator ? (
        <div className="mt-5 grid gap-3">
          {!termsAccepted && deliverable.state === "NOT_STARTED" ? (
            <ActionForm
              action={acceptCampaignTermsAction}
              successTitle="Campaign terms accepted"
            >
              <input
                type="hidden"
                name="campaignParticipantId"
                value={campaignParticipantId}
              />
              <Button type="submit">Accept campaign terms</Button>
            </ActionForm>
          ) : null}
          {termsAccepted && deliverable.state === "NOT_STARTED" ? (
            <ActionForm
              action={startDeliverableAction}
              successTitle="Work started"
            >
              <input
                type="hidden"
                name="deliverableId"
                value={deliverable.id}
              />
              <Button type="submit">Start work</Button>
            </ActionForm>
          ) : null}
          {["IN_PROGRESS", "REVISION_REQUESTED"].includes(
            deliverable.state,
          ) ? (
            <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] p-4">
              <DirectDeliverableUpload
                deliverableId={deliverable.id}
                isRevision={deliverable.state === "REVISION_REQUESTED"}
              />
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-muted)]">
                <span className="h-px flex-1 bg-[var(--woosh-border)]" />
                or submit a review link
                <span className="h-px flex-1 bg-[var(--woosh-border)]" />
              </div>
              <ActionForm
                action={submitDraftAction}
                successTitle="Review link submitted"
                className="grid gap-2 sm:grid-cols-[1fr_auto]"
              >
                <input
                  type="hidden"
                  name="deliverableId"
                  value={deliverable.id}
                />
                <Input
                  name="draftUrl"
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                />
                <Button type="submit" variant="secondary">
                  Submit link
                </Button>
              </ActionForm>
            </div>
          ) : null}
          {["APPROVED", "SCHEDULED"].includes(deliverable.state) ? (
            <ActionForm
              action={setDeliverableLiveAction}
              successTitle="Content marked live"
              className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--woosh-teal)]/40 bg-[var(--woosh-teal)]/10 p-4 sm:grid-cols-[1fr_auto]"
            >
              <input
                type="hidden"
                name="deliverableId"
                value={deliverable.id}
              />
              <Input
                name="liveUrl"
                type="url"
                required
                placeholder="Published post URL"
              />
              <Button type="submit">Mark content live</Button>
            </ActionForm>
          ) : null}
          {latest &&
          ["APPROVED", "LIVE", "COMPLETED"].includes(deliverable.state) ? (
            <ActionForm
              action={addCampaignContentToPortfolioAction}
              successTitle="Added to portfolio"
              className="grid gap-2 sm:grid-cols-[1fr_auto]"
            >
              <input type="hidden" name="submissionId" value={latest.id} />
              <Input name="title" required defaultValue={deliverable.title} />
              <Button type="submit" variant="secondary">
                Add to portfolio
              </Button>
            </ActionForm>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          {["DRAFT_SUBMITTED", "RESUBMITTED"].includes(deliverable.state) ? (
            <>
              <ActionForm
                action={revisionAction}
                successTitle="Revision requested"
                className="grid w-full min-w-0 gap-2 sm:grid-cols-[1fr_auto]"
              >
                <input
                  type="hidden"
                  name="deliverableId"
                  value={deliverable.id}
                />
                <Input
                  name="reviewNotes"
                  required
                  minLength={3}
                  placeholder="Specific revision feedback"
                  className="min-w-0 w-full"
                />
                <Button type="submit" variant="secondary">
                  Request revision
                </Button>
              </ActionForm>
              <ActionForm
                action={approveDeliverableAction}
                successTitle="Deliverable approved"
              >
                <input
                  type="hidden"
                  name="deliverableId"
                  value={deliverable.id}
                />
                <Button type="submit">Approve</Button>
              </ActionForm>
            </>
          ) : null}
          {deliverable.state === "LIVE" ? (
            <ActionForm
              action={completeDeliverableAction}
              successTitle="Deliverable completed"
            >
              <input
                type="hidden"
                name="deliverableId"
                value={deliverable.id}
              />
              <Button type="submit">Mark complete</Button>
            </ActionForm>
          ) : null}
        </div>
      )}

      {deliverable.submissions.length ? (
        <details className="mt-5 border-t border-[var(--woosh-border)] pt-4">
          <summary className="cursor-pointer font-semibold text-[var(--woosh-navy)]">
            Version history ({deliverable.submissions.length})
          </summary>
          <ol className="mt-3 grid gap-3">
            {deliverable.submissions.map((submission) => (
              <li
                key={submission.id}
                className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[var(--woosh-navy)]">
                    Version {submission.version}
                  </strong>
                  <time className="text-[var(--woosh-dull)]/60">
                    {submission.submittedAt.toLocaleString("en-NG")}
                  </time>
                </div>
                <p className="mt-2 text-[var(--woosh-dull)]/75">
                  {submission.fileName ?? "Review link"}
                  {submission.fileSizeBytes
                    ? ` · ${(submission.fileSizeBytes / 1_000_000).toFixed(1)} MB`
                    : ""}
                  {submission.mimeType ? ` · ${submission.mimeType}` : ""}
                </p>
                {submission.draftUrl ? (
                  <a
                    href={submission.draftUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-semibold text-[var(--woosh-blue)]"
                  >
                    Open submission
                  </a>
                ) : null}
                {submission.notes ? (
                  <p className="mt-2 text-[var(--woosh-dull)]">
                    Creator note: {submission.notes}
                  </p>
                ) : null}
                {submission.reviewNotes ? (
                  <p className="mt-2 rounded-[var(--radius-control)] bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]">
                    Brand feedback: {submission.reviewNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </Panel>
  );
}
