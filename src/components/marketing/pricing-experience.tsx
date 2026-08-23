"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AudienceFaq } from "@/components/marketing/audience/audience-faq";
import { AudienceClose } from "@/components/marketing/audience/audience-close";
import { cn } from "@/lib/cn";
import {
  PRICING_FAQS,
  PRICING_FEATURES,
  type BillingCycle,
  type PricingAudience,
  type PricingPlan,
  annualSavingsNgn,
  billedMonthlyNgn,
  formatNgn,
  plansFor,
} from "@/lib/pricing";

export function PricingExperience() {
  const [audience, setAudience] = useState<PricingAudience>("brand");
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const plans = plansFor(audience);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-mkt-bg text-mkt-fg">
        <div aria-hidden className="mkt-pattern absolute inset-0 -z-10 opacity-80" />
        <div className="mx-auto max-w-6xl px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-10">
          <p className="mkt-kicker">{"{Pricing}"}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[clamp(1.85rem,8vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-pretty">
            Run the brief.{" "}
            <span className="text-[#0de3af]">Pay for volume.</span> Creators
            stay free.
          </h1>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-6 text-mkt-muted md:mt-5 md:leading-7 md:text-base">
            0% of the creator rate — on every plan. Brands and agencies buy
            brief slots. Creators claim, apply, collect.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <Toggle
              value={audience}
              onChange={setAudience}
              options={[
                { id: "brand", label: "Brands" },
                { id: "agency", label: "Agencies" },
              ]}
            />
            <Toggle
              value={cycle}
              onChange={setCycle}
              options={[
                { id: "annual", label: "Annual · 2 months free", shortLabel: "Annual" },
                { id: "monthly", label: "Monthly" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-mkt-bg pb-16 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-3 px-5 md:grid-cols-2 md:gap-4 md:px-8 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </div>
      </section>

      <section className="border-t border-mkt-border bg-mkt-panel py-16 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(1.65rem,7vw,3rem)] leading-[1.1] text-mkt-fg text-pretty">
              Not sure which seat?
            </h2>
            <p className="mt-3 text-sm leading-6 text-mkt-muted">
              Start free. One brief. If the fifth one is the problem, Studio
              or Roster is the upgrade — not a hiring fee.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href={audience === "agency" ? "/register?type=agency" : "/register?type=brand"}
              className="mkt-cta mkt-cta-primary w-full sm:w-auto"
            >
              Sign up
            </Link>
            <Link href="/for-creators" className="mkt-cta mkt-cta-ghost w-full sm:w-auto">
              Creators stay free
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{The loop}"}</p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(1.65rem,7vw,3rem)] leading-[1.1] text-mkt-fg text-pretty">
            What the subscription actually unlocks.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {PRICING_FEATURES.map((item) => (
              <article key={item.kicker} className="border-t border-mkt-border pt-6">
                <p className="text-[0.75rem] text-mkt-faint">{item.kicker}</p>
                <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] text-mkt-fg">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-mkt-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AudienceFaq heading="Before you pick a seat." items={PRICING_FAQS} />
      <AudienceClose
        title="Creators never see this page."
        lede="They claim the handle, apply, ship, collect. We take 0% of theirs. Brands and agencies pay for how many briefs they run."
        primaryHref="/register"
        primaryLabel="Sign up"
        secondaryHref="/for-creators"
        secondaryLabel="For creators"
      />
    </>
  );
}

function Toggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string; shortLabel?: string }[];
}) {
  return (
    <div className="flex w-full rounded-full bg-mkt-ghost p-1 sm:w-auto sm:inline-flex">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "min-w-0 flex-1 rounded-full px-2.5 py-2 text-center text-[0.8125rem] font-medium transition-colors sm:flex-none sm:px-3.5 sm:py-1.5",
            value === option.id
              ? "bg-[var(--mkt-electric)] text-white"
              : "text-mkt-muted hover:text-mkt-fg",
          )}
        >
          {option.shortLabel ? (
            <>
              <span className="sm:hidden">{option.shortLabel}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </>
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: PricingPlan; cycle: BillingCycle }) {
  const paid = plan.monthlyNgn != null && plan.monthlyNgn > 0;
  const showAnnual = cycle === "annual" && paid;

  return (
    <article
      className={cn(
        "flex min-w-0 w-full flex-col rounded-[1.25rem] border p-4 sm:p-5",
        plan.popular
          ? "border-[var(--mkt-electric)] bg-mkt-raised shadow-[0_8px_24px_rgb(0_58_244_/_0.12)]"
          : "border-mkt-border bg-mkt-inset",
      )}
    >
      <div className="min-h-[1.25rem] text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--mkt-electric)]">
        {plan.popular ? "Most popular" : "\u00a0"}
      </div>
      <h2 className="mt-2 font-display text-2xl text-mkt-fg">{plan.name}</h2>
      <p className="mt-1 text-sm leading-5 text-mkt-muted md:min-h-10">{plan.pitch}</p>

      <div className="mt-5 md:mt-6">
        {plan.monthlyNgn == null ? (
          <p className="font-display text-[1.75rem] text-mkt-fg sm:text-3xl">Custom</p>
        ) : plan.monthlyNgn === 0 ? (
          <p className="font-display text-[1.75rem] text-mkt-fg sm:text-3xl">{formatNgn(0)}</p>
        ) : (
          <p className="font-display text-[1.75rem] leading-none text-mkt-fg sm:text-3xl">
            {formatNgn(showAnnual ? billedMonthlyNgn(plan.monthlyNgn, "annual") : plan.monthlyNgn)}
            <span className="ml-1 text-sm font-sans font-normal text-mkt-muted">/mo</span>
          </p>
        )}
        <p className="mt-1 text-xs leading-4 text-mkt-faint md:min-h-5">
          {showAnnual && plan.monthlyNgn
            ? `Billed yearly · save ${formatNgn(annualSavingsNgn(plan.monthlyNgn))}`
            : paid
              ? "Billed monthly"
              : "No card to start"}
        </p>
      </div>

      <Link
        href={plan.cta.href}
        className={cn(
          "mkt-cta mt-6 w-full",
          plan.popular ? "mkt-cta-primary" : "mkt-cta-ghost",
        )}
      >
        {plan.cta.label}
      </Link>

      <ul className="mt-6 grid gap-2.5 text-sm text-mkt-muted">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-[var(--mkt-electric)]"
              strokeWidth={2}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
