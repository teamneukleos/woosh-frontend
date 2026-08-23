"use client";

import { useState } from "react";
import { createBriefAction } from "@/app/actions";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input, Select, TextArea, Label } from "@/components/ui/field";
import { ButtonLink } from "@/components/ui/button-link";
import { Checkbox } from "@/components/ui/checkbox-switch";
import { ActionForm } from "@/components/ui/action-form";
import { CREATOR_CATEGORIES } from "@/lib/taxonomy";

const steps = ["Basics", "Commercial", "Fit", "Review"];

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
      width="narrow"
      className="max-w-2xl"
    >
      <Stepper steps={steps} current={step} />

      <ActionForm
        action={createBriefAction}
        successTitle="Brief saved"
        className="grid gap-4"
      >
        <input type="hidden" name="brandId" value={brandId} />
        <Panel className={step === 0 ? "" : "hidden"}>
          <Label>
            Title
            <Input name="title" required placeholder="Campaign title" />
          </Label>
          <Label className="mt-4">
            Description
            <TextArea
              name="description"
              required
              rows={5}
              placeholder="Objective, creative direction, must-haves…"
            />
          </Label>
          <Label className="mt-4">
            Distribution
            <Select name="distribution" defaultValue="OPEN">
              <option value="OPEN">Open</option>
              <option value="INVITE_ONLY">Invite only</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          </Label>
        </Panel>

        <Panel className={step === 1 ? "" : "hidden"}>
          <Label>
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
              <option value="DELIVERABLE_BASED">Priced by deliverable</option>
              <option value="CREATOR_BUNDLE">Creator bundle</option>
            </Select>
          </Label>
          {rateMode === "RANGE_NEGOTIABLE" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Label>
                Minimum rate (NGN)
                <Input name="rateMin" type="number" min={0} placeholder="100000" />
              </Label>
              <Label>
                Maximum rate (NGN)
                <Input name="rateMax" type="number" min={0} placeholder="180000" />
              </Label>
            </div>
          ) : (
            <Label className="mt-4">
              {rateMode === "CREATOR_BUNDLE"
                ? "Bundle budget (NGN)"
                : rateMode === "DELIVERABLE_BASED"
                  ? "Primary deliverable rate (NGN)"
                  : "Rate (NGN)"}
              <Input name="rateAmount" type="number" min={0} placeholder="150000" />
            </Label>
          )}
          <Label className="mt-4">
            Primary deliverable
            <Input
              name="deliverableTitle"
              defaultValue="Feed post"
              placeholder="Feed post"
            />
          </Label>
        </Panel>

        <Panel className={step === 2 ? "" : "hidden"}>
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-[var(--woosh-navy)]">
              Channels
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {["INSTAGRAM", "TIKTOK", "YOUTUBE"].map((c) => (
                <label key={c} className="flex items-center gap-2">
                  <Checkbox name="channels" value={c} />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>
          <Label className="mt-4">
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Label>
              Min followers
              <Input name="minFollowers" type="number" min={0} placeholder="10000" />
            </Label>
            <Label>
              Locations
              <Input name="locations" placeholder="Lagos, NG" />
            </Label>
            <Label>
              Languages
              <Input name="languages" placeholder="English, Yoruba" />
            </Label>
            <Label>
              Apply by
              <Input name="applicationDeadline" type="date" />
            </Label>
          </div>
          <Label className="mt-4">
            Usage rights
            <TextArea
              name="rightsUsage"
              rows={3}
              placeholder="Organic usage for 30 days; paid boost extra."
            />
          </Label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Label>
              Posting window
              <Input name="postingWindow" placeholder="1–15 October" />
            </Label>
            <Label>
              Content due
              <Input name="contentDue" placeholder="Draft by 20 September" />
            </Label>
          </div>
        </Panel>

        <Panel className={step === 3 ? "" : "hidden"} title="Ready to save?">
          <p className="text-sm text-[var(--woosh-dull)]/75">
            Save as draft to continue editing, or publish to open applications
            (subject to moderation if your org is unverified).
          </p>
        </Panel>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">
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
    </AppPage>
  );
}
