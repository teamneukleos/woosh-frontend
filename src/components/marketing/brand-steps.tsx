"use client";

import { useState } from "react";
import {
  BriefPipelineMock,
  DeliverMock,
  DiscoveryMock,
  PayMock,
  ProductFrame,
} from "@/components/marketing/product-frame";
import { cn } from "@/lib/cn";

const steps = [
  {
    n: "01",
    title: "Find the right fit.",
    copy: "Search Nigerian creators by niche, location, platform, audience and engagement, whether you're looking from Lagos or London, so you spend less time scrolling.",
    frame: "woosh.app / creators",
    mock: <DiscoveryMock />,
  },
  {
    n: "02",
    title: "Put the brief out.",
    copy: "Post an opportunity, invite specific creators or open it up to the marketplace, giving the right people a chance to come to you.",
    frame: "woosh.app / briefs",
    mock: <BriefPipelineMock />,
  },
  {
    n: "03",
    title: "Keep the work together.",
    copy: "Briefs, chats, deliverables, feedback and approvals stay together, so nobody has to go digging through the WhatsApp archives.",
    frame: "woosh.app / campaigns",
    mock: <DeliverMock />,
  },
  {
    n: "04",
    title: "Keep the money clear.",
    copy: "Campaign funds are secured before work starts and released when the agreed work is completed, so everyone knows where they stand from start to finish.",
    frame: "woosh.app / earnings",
    mock: <PayMock />,
  },
];

export function BrandSteps() {
  const [index, setIndex] = useState(0);
  const step = steps[index]!;

  return (
    <section id="how" className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{How it works}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          Find. Brief. Work. Pay.
        </h2>
        <p className="mt-4 text-sm text-mkt-subtle">
          From finding the right fit to getting the work done, Woosh keeps the
          process simple.
        </p>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <p className="text-[0.75rem] text-[#0de3af]">
              {step.n} <span className="text-mkt-faint">/ 04</span>
            </p>
            <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em] text-mkt-fg">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-mkt-muted">{step.copy}</p>

            <div
              className="mt-10 flex flex-wrap gap-2"
              role="tablist"
              aria-label="How Woosh works"
            >
              {steps.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-current={i === index ? "step" : undefined}
                  onClick={() => setIndex(i)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      setIndex((current) => (current + 1) % steps.length);
                    }
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      setIndex(
                        (current) => (current - 1 + steps.length) % steps.length,
                      );
                    }
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition",
                    i === index
                      ? "bg-[#003af4] text-white shadow-[0_2px_8px_rgb(0_58_244_/_0.2)]"
                      : "bg-mkt-ghost text-mkt-muted shadow-[0_1px_4px_rgb(18_20_26_/_0.08)] hover:bg-mkt-ghost-hover hover:text-mkt-fg",
                  )}
                >
                  {s.n} {s.title}
                </button>
              ))}
            </div>
          </div>

          <ProductFrame title={step.frame} className="transition-opacity duration-300">
            {step.mock}
          </ProductFrame>
        </div>
      </div>
    </section>
  );
}
