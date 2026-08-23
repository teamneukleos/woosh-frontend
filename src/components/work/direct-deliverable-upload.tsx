"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadDraftAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function DirectDeliverableUpload({
  deliverableId,
  isRevision,
}: {
  deliverableId: string;
  isRevision: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!file) return;
        const form = event.currentTarget;
        const notes = String(new FormData(form).get("notes") || "");
        startTransition(async () => {
          try {
            const intentResponse = await fetch("/api/uploads/intents", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                deliverableId,
                filename: file.name,
                contentType: file.type,
                size: file.size,
              }),
            });
            const intent = (await intentResponse.json()) as
              | { mode: "multipart" }
              | {
                  mode: "s3";
                  key: string;
                  uploadUrl: string;
                }
              | { error: string };
            if (!intentResponse.ok || "error" in intent) {
              throw new Error(
                "error" in intent ? intent.error : "Could not start upload",
              );
            }
            if (intent.mode === "multipart") {
              const formData = new FormData();
              formData.set("deliverableId", deliverableId);
              formData.set("file", file);
              if (notes) formData.set("notes", notes);
              await uploadDraftAction(formData);
            } else {
              const uploadResponse = await fetch(intent.uploadUrl, {
                method: "PUT",
                headers: { "content-type": file.type },
                body: file,
              });
              if (!uploadResponse.ok) {
                throw new Error("The direct upload failed");
              }
              const finalizeResponse = await fetch("/api/uploads/finalize", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  deliverableId,
                  key: intent.key,
                  filename: file.name,
                  contentType: file.type,
                  size: file.size,
                  notes,
                  idempotencyKey: `upload:${intent.key}`,
                }),
              });
              const finalized = (await finalizeResponse.json()) as {
                error?: string;
              };
              if (!finalizeResponse.ok) {
                throw new Error(finalized.error || "Could not finalize upload");
              }
            }
            form.reset();
            setFile(null);
            toast({
              title: isRevision ? "Revision submitted" : "Draft submitted",
              tone: "success",
            });
            router.refresh();
          } catch (error) {
            toast({
              title:
                error instanceof Error ? error.message : "Upload failed",
              tone: "error",
            });
          }
        });
      }}
    >
      <FileDropzone
        hint="Image, video or PDF up to 100 MB"
        name="file"
        required
        disabled={pending}
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      {file ? (
        <p className="text-sm text-[var(--woosh-dull)]/70">
          {file.name} · {(file.size / 1_000_000).toFixed(1)} MB
        </p>
      ) : null}
      <Input
        name="notes"
        disabled={pending}
        placeholder="Submission note (optional)"
      />
      <Button type="submit" disabled={pending || !file} className="w-fit">
        {pending
          ? "Uploading…"
          : `Upload ${isRevision ? "revision" : "draft"}`}
      </Button>
    </form>
  );
}
