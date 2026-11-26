"use client";

import { useCallback, useState } from "react";

/**
 * Walks through `sources` until one loads. Returns `src: null` once every source failed.
 *
 * Remote photos (e.g. expired Instagram CDN links) can fail before React hydrates and
 * attaches `onError`, so when the first source's <img> is attached we also check whether it
 * already failed. Later sources (the generated SVG avatar) rely on `onError` only, because
 * an SVG can legitimately report a zero natural size.
 */
export function useImageFallback(sources: readonly string[]) {
  const key = sources.join("\n");
  const [failed, setFailed] = useState({ key, count: 0 });
  const index = failed.key === key ? failed.count : 0;

  const onError = useCallback(() => {
    setFailed((current) => ({
      key,
      count: (current.key === key ? current.count : 0) + 1,
    }));
  }, [key]);

  const attach = useCallback(
    (image: HTMLImageElement | null) => {
      if (index === 0 && image?.complete && image.naturalWidth === 0) onError();
    },
    [index, onError],
  );

  return { src: sources[index] ?? null, attach, onError };
}
