"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { marketingFaqs } from "@/lib/marketing-faq";

export function BrandFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{FAQ}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          Ask away.
        </h2>
        <div className="mt-12 divide-y divide-mkt-border border-t border-mkt-border">
          {marketingFaqs.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-start justify-between gap-6 text-left text-[0.9375rem] font-medium text-mkt-fg transition-colors hover:text-[#0de3af]"
                >
                  <span>
                    <span className="mr-3 text-mkt-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-lg text-[#0de3af] transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                  >
                    +
                  </span>
                </button>
                <p
                  id={panelId}
                  hidden={!isOpen}
                  className={cn(
                    "mt-3 max-w-2xl origin-top pl-10 text-sm leading-6 text-mkt-subtle",
                    isOpen && "motion-safe:animate-[mkt-rise_0.4s_ease]",
                  )}
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
