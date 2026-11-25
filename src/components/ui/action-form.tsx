"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

type ActionResult = {
  ok: false;
  message: string;
};

type ServerAction = (
  formData: FormData,
) => Promise<void | ActionResult> | void | ActionResult;

export function ActionForm({
  action,
  successTitle,
  successDescription,
  className,
  children,
  onSuccess,
  confirmMessage,
}: {
  action: ServerAction;
  successTitle: string;
  successDescription?: string;
  className?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
  confirmMessage?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!confirmationOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) {
        setConfirmationOpen(false);
        setPendingFormData(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmationOpen, pending]);

  function executeAction(formData: FormData) {
    startTransition(async () => {
      try {
       const result = await action(formData);

        setConfirmationOpen(false);
        setPendingFormData(null);

        if (result && result.ok === false) {
          toast({
            title: "Insufficient funds",
            description: result.message,
            tone: "error",
          });
          return;
        }

        toast({
          title: successTitle,
          description: successDescription,
          tone: "success",
        });

        onSuccess?.();
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        if (
          typeof err === "object" &&
          err &&
          "digest" in err &&
          String((err as { digest?: string }).digest).startsWith(
            "NEXT_REDIRECT",
          )
        ) {
          setConfirmationOpen(false);
          setPendingFormData(null);

          toast({
            title: successTitle,
            description: successDescription,
            tone: "success",
          });
          return;
        }

        setConfirmationOpen(false);
        setPendingFormData(null);
        toast({ title: message, tone: "error" });
      }
    });
  }

  const isCloseBrief = successTitle === "Brief closed";

  return (
    <div className={className}>
      <form
        aria-busy={pending}
        action={(formData) => {
          if (confirmMessage) {
            setPendingFormData(formData);
            setConfirmationOpen(true);
            return;
          }

          executeAction(formData);
        }}
      >
        <fieldset disabled={pending || confirmationOpen} className="contents">
          {children}
        </fieldset>
      </form>

      {mounted && confirmationOpen
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="action-confirm-title"
                aria-describedby="action-confirm-desc"
                className="pointer-events-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface,white)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.16)]"
              >
                <h3
                  id="action-confirm-title"
                  className="text-base font-semibold text-[var(--woosh-navy)]"
                >
                  {isCloseBrief ? "Close this brief?" : "Are you sure?"}
                </h3>

                <p
                  id="action-confirm-desc"
                  className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]"
                >
                  {isCloseBrief
                    ? "Closing this brief stops new applications from coming in, while still allowing you to review and manage existing applicants."
                    : confirmMessage}
                </p>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setConfirmationOpen(false);
                      setPendingFormData(null);
                    }}
                    className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--woosh-navy)] transition hover:bg-[var(--woosh-mist)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={pending || !pendingFormData}
                    onClick={() => {
                      if (pendingFormData) executeAction(pendingFormData);
                    }}
                    className="rounded-lg bg-[var(--woosh-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {pending
                      ? isCloseBrief
                        ? "Closing..."
                        : "Confirming..."
                      : isCloseBrief
                        ? "Close brief"
                        : "Confirm"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
