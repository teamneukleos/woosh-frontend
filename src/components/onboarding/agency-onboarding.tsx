"use client";

import { useState } from "react";
import { createClientBrandAction } from "@/app/actions";
import { BRAND_INDUSTRIES } from "@/lib/taxonomy";
import { Stepper } from "@/components/ui/stepper";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";

const STEPS = ["Welcome", "First brand", "Invite team"];

export function AgencyOnboarding({
  orgName,
}: {
  orgName: string;
}) {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Stepper steps={STEPS} current={step} />

      {step === 0 ? (
        <Panel title={`Welcome, ${orgName}`}>
          <p className="text-sm leading-6 text-[var(--woosh-dull)]/75">
            Agencies work in brand context. Next you&apos;ll create a client
            brand, then you can optionally invite a teammate.
          </p>
          <Button
            type="button"
            className="mt-5 w-full"
            onClick={() => setStep(1)}
          >
            Continue
          </Button>
        </Panel>
      ) : null}

      {step === 1 ? (
        <Panel title="Create your first client brand">
          <ActionForm action={createClientBrandAction} successTitle="Brand created" className="grid gap-4">
            <input
              type="hidden"
              name="next"
              value="/app/onboarding?step=invite"
            />
            <Label>
              Client brand name
              <Input name="name" required placeholder="Palm Cola" />
            </Label>
            <Label>
              Industry
              <Select name="industry" defaultValue="">
                <option value="">Select industry</option>
                {BRAND_INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(0)}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Create brand
              </Button>
            </div>
          </ActionForm>
        </Panel>
      ) : null}
    </div>
  );
}
