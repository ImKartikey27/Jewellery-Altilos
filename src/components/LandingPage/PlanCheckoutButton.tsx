"use client";

  import type { ReactNode } from "react";

  import type { CheckoutPlan } from "@/lib/checkout";
  import { markReturnToPlans } from "@/lib/return-to-plans";

  type PlanCheckoutButtonProps = {
    plan: CheckoutPlan;
    children: ReactNode;
    isSelected?: boolean;
    onSelect?: () => void;
  };

  export function PlanCheckoutButton({
    plan,
    children,
    isSelected = false,
    onSelect,
  }: PlanCheckoutButtonProps) {
    function handleCheckout() {
      onSelect?.();
      // Coming back from checkout should land on the plans grid, not wherever
      // scroll restoration puts us once the Steps pin spacer appears.
      markReturnToPlans();
    }

    return (
      <div className="mt-auto pt-8">
        <a
          href={`/checkout?plan=${encodeURIComponent(plan)}`}
          className={`inline-flex h-10.75 w-full items-center justify-center rounded-full border px-5 text-[13px] font-black
  uppercase tracking-[0.06em] transition-all duration-300 ease-out hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#f97316]/25 
  ${
            isSelected
              ? "border-[#f97316] bg-[#f97316]/10 text-white"
              : "border-white/15 bg-[#f97316] text-white hover:border-[#f97316] hover:bg-[#f97316]/10"
          }`}
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          onClick={handleCheckout}
        >
          {isSelected ? "Selected" : children}
        </a>
      </div>
    );
  }
