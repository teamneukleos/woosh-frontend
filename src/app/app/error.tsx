"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Panel title="Something went wrong">
      <p className="text-sm text-[var(--woosh-dull)]/75">
        {error.message || "An unexpected error occurred in the workspace."}
      </p>
      <Button type="button" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </Panel>
  );
}
