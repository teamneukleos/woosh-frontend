"use client";

import { useEffect, useRef } from "react";

export function ThreadScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [children]);

  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
      {children}
    </div>
  );
}
