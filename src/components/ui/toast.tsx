"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "default" | "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  toast: (input: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((input: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...input, id }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[100] flex flex-col gap-2 md:inset-x-auto md:bottom-4 md:right-4 md:w-[min(100%-2rem,22rem)]">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-[1rem] border bg-white/92 px-4 py-3 shadow-[var(--shadow-raised)] backdrop-blur-xl",
              item.tone === "success" &&
                "border-[var(--woosh-teal)]/40 text-[var(--woosh-navy)]",
              item.tone === "error" &&
                "border-[var(--danger)]/20 text-[var(--danger)]",
              (!item.tone || item.tone === "default") &&
                "border-[var(--woosh-border)] text-[var(--woosh-navy)]",
            )}
            role={item.tone === "error" ? "alert" : "status"}
          >
            <p className="break-words text-sm font-semibold">{item.title}</p>
            {item.description ? (
              <p className="mt-0.5 break-words text-xs opacity-70">{item.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (input: Omit<ToastItem, "id">) => {
        console.info("[toast]", input.title, input.description ?? "");
      },
    };
  }
  return ctx;
}
