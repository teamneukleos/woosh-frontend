"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function formatFileSize(bytes: number) {
  if (bytes < 1_000_000) {
    return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  }
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function FileDropzone({
  label = "Drop a file or click to upload",
  hint,
  className,
  onChange,
  preview,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  preview?: "square" | "wide";
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file?.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--woosh-navy)]/25 bg-[var(--woosh-mist)]/40 px-4 py-8 text-center transition hover:border-[var(--woosh-blue)]/40 hover:bg-[var(--woosh-mist)]/70",
        file &&
          "border-solid border-[var(--woosh-blue)]/45 bg-white py-4 hover:border-[var(--woosh-blue)]/60",
        className,
      )}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className={cn(
            "mb-3 rounded-[var(--radius-md)] bg-[var(--woosh-mist)] object-cover",
            preview === "square"
              ? "size-28"
              : preview === "wide"
                ? "h-28 w-full max-w-md"
                : "max-h-36 w-full max-w-md",
          )}
        />
      ) : null}
      <span className="text-sm font-semibold text-[var(--woosh-navy)]">
        {file ? file.name : label}
      </span>
      <span className="mt-1 text-xs text-[var(--woosh-dull)]/65">
        {file
          ? `${formatFileSize(file.size)} · Click to choose a different file`
          : hint}
      </span>
      <input
        type="file"
        className="sr-only"
        {...props}
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          onChange?.(event);
        }}
      />
    </label>
  );
}
