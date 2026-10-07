"use client";

import { useMemo, useState } from "react";

import { offeredAddOnsForPlan } from "@/lib/addon-catalog";
import { createCheckoutSession, type CheckoutPlan } from "@/lib/checkout";
import { formatMinor } from "@/lib/money";
import { CHECKOUT_CURRENCY, PLAN_PRICING } from "@/lib/plans";
import { pricingPlans } from "@/lib/content";

// Mirrors the selected state of a pricing card in Pricing.tsx so the two
// surfaces feel like one product.
const CARD_BASE =
  "w-full rounded-[20px] border p-5 text-left transition-all duration-500 ease-out sm:p-6";
const CARD_OFF =
  "border-[#444748] bg-black/15 hover:border-[#f97316]";
const CARD_ON =
  "border-[#f97316] bg-[linear-gradient(135deg,rgba(249,115,22,0.16)_0%,rgba(0,0,0,0)_75%)] shadow-[0_0_0_1px_rgba(249,115,22,0.28),0_16px_44px_rgba(249,115,22,0.18)]";

const PILL_BASE =
  "inline-flex h-8.5 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-inter font-bold uppercase tracking-[0.06em] transition-all duration-300";
const PILL_OFF = "border border-white/20 bg-transparent text-white";
const PILL_ON = "border border-[#f97316] bg-[#f97316] text-white";

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AddOnPicker({
  plan,
  offeredSlugs,
}: {
  plan: CheckoutPlan;
  // Resolved server-side from STRIPE_ADDON_PRICE_IDS by CheckoutGateway. Only
  // add-ons the Checkout Session can actually bill for reach the customer; see
  // the comment at the call site.
  offeredSlugs: readonly string[];
}) {
  const addOns = useMemo(
    () => offeredAddOnsForPlan(plan, offeredSlugs),
    [plan, offeredSlugs]
  );
  const planMeta = useMemo(() => pricingPlans.find((p) => p.key === plan), [plan]);

  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const planAmount = PLAN_PRICING[plan].amountMinor;
  const total =
    planAmount +
    addOns.reduce((sum, a) => (selected.has(a.slug) ? sum + a.amountMinor : sum), 0);
  const chosen = addOns.filter((a) => selected.has(a.slug));

  function toggle(slug: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleContinue() {
    setError("");
    setIsSubmitting(true);

    try {
      // Slugs only — every amount above is display-side. The server recomputes
      // the total from the catalog.
      //
      // Sent from `chosen` rather than `selected` so the request carries exactly
      // what was on screen: both are derived from the offered list, so they
      // cannot disagree today, but deriving the payload from the rendered rows
      // is what keeps that true.
      const session = await createCheckoutSession(plan, chosen.map((a) => a.slug));
      window.location.assign(session.url);
    } catch {
      setError("Checkout is unavailable right now. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-7 lg:flex-1">
        <div className="rounded-[20px] border border-[#444748] bg-black/15 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[13px] font-inter uppercase tracking-[0.06em] text-[#f97316]">
                Your plan &middot; {planMeta?.name ?? plan}
              </p>
              <p className="mt-1.5 font-plusJakartaSans text-[32px] font-bold leading-none text-white">
                {formatMinor(planAmount, CHECKOUT_CURRENCY)}
              </p>
              {planMeta ? (
                <p className="mt-2 text-[13px] font-inter leading-5 text-[#a1a1a1]/60">
                  {planMeta.responsesNote}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 pt-1 text-[12px] font-inter uppercase tracking-[0.06em] text-[#a1a1a1]/40">
              Included
            </span>
          </div>
        </div>

        {addOns.length > 0 ? (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-plusJakartaSans text-[22px] font-bold text-white">
                Add to your study
              </h2>
              <span className="text-[13px] font-inter text-[#a1a1a1]/50">
                {chosen.length} of {addOns.length} selected
              </span>
            </div>

            <ul className="flex flex-col gap-4">
              {addOns.map((addOn) => {
                const isOn = selected.has(addOn.slug);
                return (
                  <li key={addOn.slug}>
                    <button
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => toggle(addOn.slug)}
                      className={`${CARD_BASE} ${isOn ? CARD_ON : CARD_OFF}`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-base font-inter font-semibold leading-tight text-white">
                            {addOn.label}
                          </span>
                          <span className="max-w-md text-[13.5px] font-inter leading-6 text-[#a1a1a1]/65">
                            {addOn.description}
                          </span>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <span
                            className={`font-plusJakartaSans text-lg font-bold whitespace-nowrap ${
                              isOn ? "text-[#f97316]" : "text-white"
                            }`}
                          >
                            {formatMinor(addOn.amountMinor, addOn.currency)}
                          </span>
                          <span className={`${PILL_BASE} ${isOn ? PILL_ON : PILL_OFF}`}>
                            {isOn ? <CheckIcon /> : <PlusIcon />}
                            {isOn ? "Added" : "Add"}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>

      <aside className="w-full rounded-[20px] border border-white/15 bg-black/15 p-7 lg:w-84 lg:shrink-0">
        <h3 className="text-[13px] font-inter font-semibold uppercase tracking-[0.06em] text-[#a1a1a1]/40">
          Order summary
        </h3>

        <div className="mt-5 flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-inter text-white">{planMeta?.name ?? plan}</span>
            <span className="text-sm font-inter whitespace-nowrap text-white">
              {formatMinor(planAmount, CHECKOUT_CURRENCY)}
            </span>
          </div>

          {chosen.map((addOn) => (
            <div className="flex items-baseline justify-between gap-3" key={addOn.slug}>
              <span className="text-sm font-inter leading-5 text-[#a1a1a1]/75">{addOn.label}</span>
              <span className="text-sm font-inter whitespace-nowrap text-[#a1a1a1]/75">
                {formatMinor(addOn.amountMinor, addOn.currency)}
              </span>
            </div>
          ))}

          {chosen.length === 0 && addOns.length > 0 ? (
            <span className="text-[13px] font-inter italic leading-5 text-[#a1a1a1]/35">
              No add-ons selected.
            </span>
          ) : null}
        </div>

        <div className="mt-5 h-px bg-white/12" />

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-inter font-semibold text-white">Total</span>
          <span className="font-plusJakartaSans text-[28px] font-bold leading-none whitespace-nowrap text-white">
            {formatMinor(total, CHECKOUT_CURRENCY)}
          </span>
        </div>
        <p className="mt-2 text-[12px] font-inter leading-5 text-[#a1a1a1]/40">
          GST inclusive. One-time payment.
        </p>

        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className="mt-6 inline-flex h-10.75 w-full items-center justify-center rounded-full border border-[#f97316] bg-[#f97316] px-5 font-plusJakartaSans text-[13px] font-black uppercase tracking-[0.06em] text-white transition-all duration-300 ease-out hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#f97316]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "Redirecting..." : "Continue to payment"}
        </button>

        {error ? (
          <p role="alert" className="mt-4 text-[13px] font-inter leading-5 text-[#f97316]">
            {error}
          </p>
        ) : null}

        <p className="mt-4 text-[12px] font-inter leading-5 text-[#a1a1a1]/50">
          Card details are collected by Stripe. Altilos never sees them.
        </p>
      </aside>
    </div>
  );
}
