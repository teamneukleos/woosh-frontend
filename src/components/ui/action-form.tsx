"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

type ServerAction = (formData: FormData) => Promise<void> | void;

/** Client form wrapper that toasts on success/failure around a server action. */
export function ActionForm({
  action,
  successTitle,
  successDescription,
  className,
  children,
  onSuccess,
}: {
  action: ServerAction;
  successTitle: string;
  successDescription?: string;
  className?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      aria-busy={pending}
      action={(formData) => {
        startTransition(async () => {
          try {
            await action(formData);
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
            // Next.js redirect throws; treat as success
            if (
              typeof err === "object" &&
              err &&
              "digest" in err &&
              String((err as { digest?: string }).digest).startsWith(
                "NEXT_REDIRECT",
              )
            ) {
              toast({
                title: successTitle,
                description: successDescription,
                tone: "success",
              });
              return;
            }
            toast({ title: message, tone: "error" });
          }
        });
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
