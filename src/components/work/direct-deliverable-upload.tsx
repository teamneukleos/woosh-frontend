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
            const formData = new FormData();
            formData.set("deliverableId", deliverableId);
            formData.set("file", file);
            if (notes) formData.set("notes", notes);
            await uploadDraftAction(formData);
            form.reset();
            setFile(null);
            toast({
              title: isRevision ? "Revision submitted" : "Draft submitted",
              tone: "success",
            });
            router.refresh();
          } catch (error) {
            toast({
              title: error instanceof Error ? error.message : "Upload failed",
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
