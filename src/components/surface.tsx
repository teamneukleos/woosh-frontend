"use client";

import { useEffect } from "react";

export function Surface({
  name,
  children,
}: {
  name: "marketing" | "app" | "default";
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.dataset.surface = name;
    return () => {
      delete document.body.dataset.surface;
    };
  }, [name]);

  return children;
}
