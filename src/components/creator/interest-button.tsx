"use client";

import { useEffect, useState, type ReactNode } from "react";
import { expressInterestAction } from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";

export function InterestButton({
  interested,
  activeBrandId,
  prospectId,
  creatorProfileId,
  label = "Interested",
  sentLabel = "Interest sent",
  className,
  children,
}: {
  interested: boolean;
  activeBrandId?: string | null;
  prospectId?: string;
  creatorProfileId?: string;
  label?: string;
  sentLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [sent, setSent] = useState(interested);
  const buttonClass = children ? "w-fit" : "w-full sm:w-auto";
  const formClass = className ?? buttonClass;

  useEffect(() => {
    setSent(interested);
  }, [interested]);

  if (sent) {
    return (
      <Button type="button" size="sm" variant="secondary" disabled className={buttonClass}>
        {sentLabel}
      </Button>
    );
  }

  return (
    <ActionForm
      action={expressInterestAction}
      successTitle={sentLabel}
      onSuccess={() => setSent(true)}
      className={formClass}
    >
      <input type="hidden" name="brandId" value={activeBrandId ?? ""} />
      {prospectId ? <input type="hidden" name="prospectId" value={prospectId} /> : null}
      {creatorProfileId ? (
        <input type="hidden" name="creatorProfileId" value={creatorProfileId} />
      ) : null}
      {children}
      <Button type="submit" size="sm" disabled={!activeBrandId} className={buttonClass}>
        {label}
      </Button>
    </ActionForm>
  );
}
