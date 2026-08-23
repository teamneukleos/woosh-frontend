"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AudienceFaqItem } from "@/lib/audience-faq";

export function AudienceFaq({
  heading,
  items,
}: {
  heading: string;
  items: readonly AudienceFaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{FAQ}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          {heading}
        </h2>
        <div className="mt-12 divide-y divide-mkt-border border-t border-mkt-border">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `audience-faq-${i}`;
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-start justify-between gap-3 text-left text-[0.9375rem] font-medium text-mkt-fg transition-colors hover:text-[var(--mkt-teal)] sm:gap-6"
                >
                  <span>
                    <span className="mr-3 text-mkt-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "mkt-accent mt-0.5 text-lg transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                  >
                    +
                  </span>
                </button>
                <p
                  id={panelId}
                  hidden={!isOpen}
                  className="mt-3 max-w-2xl pl-0 text-sm leading-6 text-mkt-subtle sm:pl-10"
                >
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
