import Link from "next/link";

import { AddOnPicker } from "@/components/CheckoutPage/AddOnPicker";
import type { CheckoutPlan } from "@/lib/checkout";
import { getAddOnPriceMap } from "@/lib/addon-price-map-server";
import { LogoMark } from "@/components/LandingPage/ui/LogoMark";

type CheckoutGatewayProps = {
  plan: CheckoutPlan;
};

// Step 1 of checkout: the customer shapes their study on our page. Step 2 is
// Stripe's own hosted page, which the picker navigates to.
//
// This used to host Stripe's embedded checkout in an iframe. That was dropped
// because embedded mode rejects `branding_settings.logo`/`icon`, and because
// Stripe's `optional_items` cross-sell rendered our six add-ons as a carousel
// whose "View all" opened a full-screen sheet we could not restyle.
export function CheckoutGateway({ plan }: CheckoutGatewayProps) {
  const planLabel = plan === "core+" ? "Core+" : plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link className="inline-flex items-center gap-2" href="/" aria-label="Altilos home">
            <LogoMark />
            <span className="font-inter text-xl text-white">
              altilos<span className="text-[#f97316]">.</span>
            </span>
          </Link>
          <p className="text-sm font-inter uppercase tracking-[0.06em] text-[#f97316]">
            Secure checkout
          </p>
        </header>

        <Link
          className="text-sm font-inter font-semibold uppercase tracking-[0.06em] text-[#a1a1a1] transition hover:text-white"
          href="/#plans"
        >
          &larr; Back to plans
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-2.5 py-1 text-[11px] font-inter font-semibold uppercase tracking-[0.08em] text-[#f97316]">
            Step 1 of 2
          </span>
          <span className="text-[13px] font-inter uppercase tracking-[0.06em] text-[#a1a1a1]/40">
            Build your study &nbsp;&rarr;&nbsp; Pay
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl font-plusJakartaSans text-4xl leading-tight text-white">
          Shape your <span className="font-bold">{planLabel}</span> study before you pay.
        </h1>
        <p className="max-w-xl font-poppins text-base leading-6 text-[#a1a1a1]/80">
          Every add-on below is optional and priced upfront. Pick what you need and
          watch the total move.
        </p>

        <section className="mt-8" aria-label="Study configuration">
          {/* Which add-ons are PURCHASABLE, not which exist. The catalog is
              code and the price map is config, so the two diverge whenever
              STRIPE_ADDON_PRICE_IDS is unset (the documented pre-launch and
              rollback state), partially filled, or one deploy behind a new
              catalog entry. An add-on with no price id is dropped from the
              Checkout Session by parseAddOnSelection, so rendering it would
              show the customer a total they are never charged — and leave them
              expecting a deliverable nobody was paid for. Resolving it here,
              server-side, keeps the displayed total correct by construction
              rather than by a second rule that can drift. */}
          <AddOnPicker plan={plan} offeredSlugs={[...getAddOnPriceMap().keys()]} />
        </section>
      </div>
    </main>
  );
}
