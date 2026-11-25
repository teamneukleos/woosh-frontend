"use client";

import { useState } from "react";
import { Check, FileText, Send, type LucideIcon } from "lucide-react";
import { createBriefAction } from "@/app/actions";
import { AppPage } from "@/components/ui/app-page";
import { Button } from "@/components/ui/button";
import { Input, Select, TextArea, Label } from "@/components/ui/field";
import { ButtonLink } from "@/components/ui/button-link";
import { Checkbox } from "@/components/ui/checkbox-switch";
import { ActionForm } from "@/components/ui/action-form";
import { CREATOR_CATEGORIES } from "@/lib/taxonomy";

const steps = ["Basics", "Commercial", "Fit", "Review"];

const STEP_HINTS = [
  "Name the campaign and describe what you need from creators.",
  "Set how you want to pay and what the first deliverable is.",
  "Choose who can apply, and when content is due.",
  "Check everything, then save a draft or publish.",
];

const CHANNEL_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

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

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:col-span-2">
      {children}
    </h3>
  );
}

export function BriefComposer({ brandId }: { brandId: string }) {
  const [step, setStep] = useState(0);
  const [rateMode, setRateMode] = useState("FIXED_NON_NEGOTIABLE");

  return (
    <AppPage
      eyebrow="Demand"
      title="New brief"
      description="Step through the essentials, then save as draft or publish."
      actions={
        <ButtonLink href="/app/briefs" variant="secondary" size="sm">
          Cancel
        </ButtonLink>
      }
      width="wide"
      className="w-full max-w-none"
    >
      <div className="grid w-full items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav
          aria-label="Progress"
          className="hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-4 shadow-[var(--shadow-soft)] lg:sticky lg:top-6 lg:block"
        >
          <ol className="space-y-1">
            {steps.map((label, index) => {
              const done = index < step;
              const current = index === step;

              return (
                <li
                  key={label}
                  aria-current={current ? "step" : undefined}
                  className={`flex items-start gap-3 rounded-xl px-3 py-3 ${
                    current ? "bg-[#12141a]/[0.05]" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums ${
                      current
                        ? "border-[var(--woosh-navy)] bg-[var(--woosh-navy)] text-white"
                        : done
                          ? "border-[var(--woosh-blue)] text-[var(--woosh-blue)]"
                          : "border-[var(--woosh-border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {done ? (
                      <Glyph icon={Check} size={13} weight="regular" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        current || done
                          ? "text-[var(--woosh-navy)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">
                      {STEP_HINTS[index]}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0 space-y-4">
          <div className="lg:hidden">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                {steps[step]}
              </p>
              <p className="text-xs tabular-nums text-[var(--text-muted)]">
                Step {step + 1} of {steps.length}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#12141a]/[0.06]">
              <div
                className="h-full rounded-full bg-[var(--woosh-blue)] transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <ActionForm
            action={createBriefAction}
            successTitle="Brief saved"
            className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
          >
            <input type="hidden" name="brandId" value={brandId} />

            <div className="hidden border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6 lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Step {step + 1} of {steps.length}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--woosh-navy)]">
                {steps[step]}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {STEP_HINTS[step]}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div
                className={
                  step === 0 ? "grid gap-5 sm:grid-cols-2" : "hidden"
                }
              >
                <Label className="sm:col-span-2">
                  Title
                  <Input name="title" required placeholder="Campaign title" />
                </Label>
                <Label className="sm:col-span-2">
                  Description
                  <TextArea
                    name="description"
                    required
                    rows={7}
                    placeholder="Objective, creative direction, must-haves…"
                  />
                </Label>
                <Label>
                  Distribution
                  <Select name="distribution" defaultValue="OPEN">
                    <option value="OPEN">Open</option>
                    <option value="INVITE_ONLY">Invite only</option>
                    <option value="HYBRID">Hybrid</option>
                  </Select>
                </Label>
                <p className="text-sm leading-6 text-[var(--text-secondary)] sm:pt-7">
                  Open lets matching creators apply. Invite only limits it to
                  creators you invite. Hybrid allows both.
                </p>
              </div>

              <div
                className={
                  step === 1 ? "grid gap-5 sm:grid-cols-2" : "hidden"
                }
              >
                <Label className="sm:col-span-2">
                  Rate mode
                  <Select
                    name="rateMode"
                    value={rateMode}
                    onChange={(event) => setRateMode(event.target.value)}
                  >
                    <option value="FIXED_NON_NEGOTIABLE">
                      Fixed (non-negotiable)
                    </option>
                    <option value="FIXED_NEGOTIABLE">Fixed (negotiable)</option>
                    <option value="RANGE_NEGOTIABLE">Range negotiable</option>
                    <option value="DELIVERABLE_BASED">
                      Priced by deliverable
                    </option>
                    <option value="CREATOR_BUNDLE">Creator bundle</option>
                  </Select>
                </Label>
                {rateMode === "RANGE_NEGOTIABLE" ? (
                  <>
                    <Label>
                      Minimum rate (NGN)
                      <Input
                        name="rateMin"
                        type="number"
                        min={0}
                        placeholder="100000"
                      />
                    </Label>
                    <Label>
                      Maximum rate (NGN)
                      <Input
                        name="rateMax"
                        type="number"
                        min={0}
                        placeholder="180000"
                      />
                    </Label>
                  </>
                ) : (
                  <Label>
                    {rateMode === "CREATOR_BUNDLE"
                      ? "Bundle budget (NGN)"
                      : rateMode === "DELIVERABLE_BASED"
                        ? "Primary deliverable rate (NGN)"
                        : "Rate (NGN)"}
                    <Input
                      name="rateAmount"
                      type="number"
                      min={0}
                      placeholder="150000"
                    />
                  </Label>
                )}
                <Label
                  className={
                    rateMode === "RANGE_NEGOTIABLE" ? "sm:col-span-2" : ""
                  }
                >
                  Primary deliverable
                  <Input
                    name="deliverableTitle"
                    defaultValue="Feed post"
                    placeholder="Feed post"
                  />
                </Label>
              </div>

              <div
                className={
                  step === 2 ? "grid gap-5 sm:grid-cols-2" : "hidden"
                }
              >
                <GroupTitle>Audience</GroupTitle>
                <fieldset className="sm:col-span-2">
                  <legend className="mb-3 text-sm font-medium text-[var(--woosh-navy)]">
                    Channels
                  </legend>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {["INSTAGRAM", "TIKTOK", "YOUTUBE"].map((c) => (
                      <label
                        key={c}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--woosh-border)] px-3.5 py-2.5 transition-colors hover:bg-[#faf9f7]"
                      >
                        <Checkbox name="channels" value={c} />
                        {CHANNEL_LABELS[c] ?? c}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Label>
                  Category
                  <Select name="category" defaultValue="">
                    <option value="">Any</option>
                    {CREATOR_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Label>
                <Label>
                  Min followers
                  <Input
                    name="minFollowers"
                    type="number"
                    min={0}
                    placeholder="10000"
                  />
                </Label>
                <Label>
                  Locations
                  <Input name="locations" placeholder="Lagos, NG" />
                </Label>
                <Label>
                  Languages
                  <Input name="languages" placeholder="English, Yoruba" />
                </Label>

                <div className="sm:col-span-2 border-t border-[var(--woosh-border)]" />

                <GroupTitle>Timing and rights</GroupTitle>
                <Label>
                  Apply by
                  <Input name="applicationDeadline" type="date" />
                </Label>
                <Label>
                  Posting window
                  <Input name="postingWindow" placeholder="1–15 October" />
                </Label>
                <Label>
                  Content due
                  <Input
                    name="contentDue"
                    placeholder="Draft by 20 September"
                  />
                </Label>
                <Label className="sm:col-span-2">
                  Usage rights
                  <TextArea
                    name="rightsUsage"
                    rows={3}
                    placeholder="Organic usage for 30 days; paid boost extra."
                  />
                </Label>
              </div>

              <div className={step === 3 ? "grid gap-5" : "hidden"}>
                <div>
                  <h3 className="text-base font-semibold text-[var(--woosh-navy)]">
                    Ready to save?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Save as draft to continue editing, or publish to open
                    applications (subject to moderation if your org is
                    unverified).
                  </p>
                </div>
                <ul className="divide-y divide-[var(--woosh-border)] overflow-hidden rounded-xl border border-[var(--woosh-border)]">
                  <li className="flex items-start gap-4 px-4 py-4">
                    <Glyph
                      icon={FileText}
                      size={20}
                      className="mt-0.5 text-[#9b9da3]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                        Save draft
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        Keep it private and keep editing.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 px-4 py-4">
                    <Glyph
                      icon={Send}
                      size={20}
                      className="mt-0.5 text-[#9b9da3]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                        Save &amp; publish
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        Open applications to creators.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:px-6 [&>button]:w-full sm:[&>button]:w-auto">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              ) : null}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    name="publish"
                    value="0"
                    variant="secondary"
                  >
                    Save draft
                  </Button>
                  <Button type="submit" name="publish" value="1">
                    Save & publish
                  </Button>
                </>
              )}
            </div>
          </ActionForm>
        </div>
      </div>
    </AppPage>
  );
}