"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex min-h-10 w-full items-center gap-1 overflow-x-auto rounded-[var(--radius-md)] bg-black/[0.045] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex min-h-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] px-3 py-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--text-secondary)] transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] data-[state=active]:bg-white data-[state=active]:text-[var(--text-strong)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-5 outline-none", className)}
      {...props}
    />
  );
}
