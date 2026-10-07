"use client";

import Image from "next/image";
import { useState } from "react";

import { pricingPlans } from "@/lib/content";
import type { PricingFeatureMarker } from "@/lib/content";
import { PrimaryButton } from "@/components/LandingPage/ui/PrimaryButton";
import { PlanCheckoutButton } from "@/components/LandingPage/PlanCheckoutButton";
import { useLandingHashAnchor } from "@/components/LandingPage/useLandingHashAnchor";

function FeatureMarker({ marker }: { marker: PricingFeatureMarker }) {
  if (marker === "star") {
    return (
      <svg
        aria-hidden="true"
        className="mt-0.75 h-3 w-3 shrink-0 text-[#f97316]"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path d="M6 0.5l1.65 3.5 3.85.5-2.8 2.65.68 3.85L6 9.15 2.62 11l.68-3.85L0.5 4.5l3.85-.5L6 0.5z" />
      </svg>
    );
  }

  if (marker === "excluded") {
    return (
      <svg
        aria-hidden="true"
        className="mt-2 h-0.5 w-2.5 shrink-0 text-[#a1a1a1]/35"
        viewBox="0 0 10 2"
        fill="none"
      >
        <path
          d="M1 1h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="mt-1.5 h-2 w-2.5 shrink-0 text-[#f97316]"
      viewBox="0 0 10 8"
      fill="none"
    >
      <path
        d="M1 4l2.5 2.5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useLandingHashAnchor("plans");

  return (
    <section
      id="pricing"
      className="relative isolate overflow-hidden bg-black px-5 py-24 sm:px-8 lg:px-16"
      aria-labelledby="plans-title"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="object-contain object-center opacity-40"
        fill
        sizes="100vw"
        src="/images/pricing/mesh.jpeg"
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div>
          <h2
            id="plans-title"
            className="max-w-5xl text-4xl font-plusJakartaSans leading-tight text-white sm:text-[40px]"
          >
           Get a <span className="font-bold">free snapshot</span> of{" "}
           <span className="font-bold">real</span> consumer{" "}
           <span className="font-bold">behaviour</span> in{" "}
           <span className="font-bold">your category</span>.{" "}
           No pitch. No card details
          </h2>
          <p className="mt-10 max-w-2xl text-[16px] font-poppins text-lg leading-tight text-[#a1a1a1]/80">
            Start with a rapid report, then scale into deeper market coverage as
            your team moves from curiosity to conviction.
          </p>
          <div className="mt-10">
            <PrimaryButton>Get Free Market report</PrimaryButton>
          </div>
        </div>

        <div
          id="plans"
          className="mt-15 scroll-mt-32 grid gap-10.5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {pricingPlans.map((plan) => {
            // "core+" is a legal id character but escapes badly in CSS and
            // querySelector, so the slug is spelled out.
            const nameId = `plan-${plan.key.replace("+", "plus")}-name`;

            return (
            <article
              className="grid row-span-2 grid-rows-subgrid gap-5"
              key={plan.key}
              aria-labelledby={nameId}
            >
            <div
              className={`group relative flex min-h-92.5 h-full transform-gpu flex-col overflow-hidden rounded-[20px] border bg-black/15 p-8 transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-[#f97316] hover:bg-[linear-gradient(135deg,rgba(249,115,22,0.14)_0%,rgba(0,0,0,0)_75%)] hover:shadow-[0_0_0_1px_rgba(249,115,22,0.24),0_18px_48px_rgba(249,115,22,0.2)] ${
                selectedPlan === plan.key
                  ? "scale-[1.012] border-[#f97316] bg-[linear-gradient(135deg,rgba(249,115,22,0.16)_0%,rgba(0,0,0,0)_75%)] shadow-[0_0_0_1px_rgba(249,115,22,0.28),0_16px_44px_rgba(249,115,22,0.18)]"
                  : "border-[#444748] scale-100"
              }`}
            >
              {/* Badgeless plans keep an invisible badge so every card's header
                  block starts on the same baseline once cards sit side by side. */}
              <span
                aria-hidden={!plan.badge}
                className={`mb-4 w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-inter font-semibold uppercase tracking-[0.08em] ${
                  plan.badge
                    ? "inline-flex border-[#f97316]/40 bg-[#f97316]/10 text-[#f97316]"
                    : "hidden invisible border-transparent sm:inline-flex"
                }`}
              >
                {plan.badge ?? "\u00A0"}
              </span>
              <h3
                id={nameId}
                className={`text-[13px] font-inter uppercase tracking-[0.06em] transition-colors duration-300 group-hover:text-[#f97316] ${
                  selectedPlan === plan.key
                    ? "text-[#f97316]"
                    : "text-[#a1a1a1]/40"
                }`}
              >
                {plan.name}
              </h3>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-[32px] font-bold font-plusJakartaSans leading-none text-white">
                  {plan.price}
                </span>
              </div>
              <p className="mt-2 text-[13px] font-inter leading-5 text-[#a1a1a1]/40">
                {plan.responsesNote}
              </p>
              <p className="mt-4 text-base font-medium font-inter leading-6 text-[#a1a1a1]/60">
                {plan.summary}
              </p>
              {/* Same trick for the "Everything in X, plus:" line, so the
                  feature lists line up row to row. */}
              <p
                aria-hidden={!plan.featuresPrefix}
                className={`mt-6 text-sm font-inter italic leading-5 ${
                  plan.featuresPrefix
                    ? "text-[#f97316]/80"
                    : "hidden invisible sm:block"
                }`}
              >
                {plan.featuresPrefix ?? "\u00A0"}
              </p>
              <ul
                className={`${plan.featuresPrefix ? "mt-3" : "mt-6 sm:mt-3"} space-y-2 text-sm leading-5.25 text-[#a1a1a1]/80`}
              >
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-3" key={feature.label}>
                    <FeatureMarker marker={feature.marker} />
                    <span
                      className={`font-inter ${
                        feature.marker === "excluded" ? "text-[#a1a1a1]/35" : ""
                      }`}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
              <PlanCheckoutButton
                plan={plan.key}
                isSelected={selectedPlan === plan.key}
                onSelect={() => setSelectedPlan(plan.key)}
              >
                {plan.cta}
              </PlanCheckoutButton>
            </div>
            {/* Inside the <article> now, so the tagline belongs to the card it
                describes. Still a <p>: it is a caption, not a section title. */}
            <div className="px-1">
              <p className="text-sm font-inter font-semibold leading-5 text-white">
                {plan.tagline.heading}
              </p>
              <p className="mt-1 text-sm font-inter leading-5 text-[#a1a1a1]/60">
                {plan.tagline.body}
              </p>
            </div>
            </article>
            );
          })}
        </div>

        <p className="mt-10 text-sm font-inter leading-5 text-[#a1a1a1]/50">
          <span className="text-[#f97316]">★</span> marks the headline value each
          tier unlocks over the one below.
        </p>
      </div>
    </section>
  );
}
