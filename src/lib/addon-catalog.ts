// Add-on catalog. Pure data — test-reachable, so no `server-only` and no `@/`.
//
// These are surfaced ONLY inside Stripe's checkout via `optional_items`. They are
// deliberately never rendered on the landing page.
//
// Slugs are plan-qualified (`<plan>.<addon>`) because the same add-on concept is
// priced differently per tier — "priority 3-day" is ₹3,000 / ₹7,000 / ₹10,000. A
// flat slug would be ambiguous. `core+` normalizes to `core_plus` so slugs stay
// safe JSON keys in STRIPE_ADDON_PRICE_IDS.
//
// Array order is checkout display order.
//
// Amounts are in minor units (paise) and are GST-INCLUSIVE, matching PLAN_PRICING.
// Every add-on must map to its OWN distinct Stripe Price: the reverse
// price-ID -> slug lookup used at reconciliation is only a function if the
// mapping is injective.

import type { PlanKey } from "./plans.ts"

export type AddOn = {
  slug: string
  planKey: PlanKey
  label: string
  description: string
  amountMinor: number
  currency: string
}

export const ADD_ONS = [
  // Pulse — widest set; most room to build the study up.
  { slug: "pulse.responses_50", planKey: "pulse", label: "Add 50 responses", description: "Doubles your sample to 100 verified responses, tightening the confidence interval on every question you ask.", amountMinor: 300_000, currency: "inr" },
  { slug: "pulse.competitor_2", planKey: "pulse", label: "Add a 2nd competitor", description: "Map a second brand against yours on the same questions, with the same respondents.", amountMinor: 250_000, currency: "inr" },
  { slug: "pulse.expert_call_30", planKey: "pulse", label: "Add a 30-min expert call", description: "A live walkthrough of your results with an analyst, once you have read the report.", amountMinor: 600_000, currency: "inr" },
  { slug: "pulse.city_2", planKey: "pulse", label: "Add a second city", description: "Run the identical study in a second metro and see where behaviour diverges.", amountMinor: 400_000, currency: "inr" },
  { slug: "pulse.receipt_images", planKey: "pulse", label: "Add receipt & product images", description: "Photo evidence from respondents: what they actually bought, and what they paid for it.", amountMinor: 500_000, currency: "inr" },
  { slug: "pulse.priority_3day", planKey: "pulse", label: "Priority 3-day delivery", description: "Moves your study to the front of the queue. Results in 3 days instead of 7.", amountMinor: 300_000, currency: "inr" },

  // Core — push depth, plus a taste of Core+.
  { slug: "core.responses_100", planKey: "core", label: "Add 100 responses", description: "Takes your sample to 300 verified responses, enough to cut the data by city and segment.", amountMinor: 600_000, currency: "inr" },
  { slug: "core.competitors_4", planKey: "core", label: "Expand to 4 competitors", description: "Benchmark against four brands instead of two, on the same questions and the same sample.", amountMinor: 500_000, currency: "inr" },
  { slug: "core.expert_call_45", planKey: "core", label: "Add a 45-min expert call", description: "A working session with the analyst who wrote your report.", amountMinor: 1_200_000, currency: "inr" },
  { slug: "core.city_3", planKey: "core", label: "Add a third city", description: "Extend coverage to a third metro and compare behaviour across all three.", amountMinor: 700_000, currency: "inr" },
  { slug: "core.receipt_images", planKey: "core", label: "Add receipt & product images", description: "Photo evidence from respondents across every city in your study.", amountMinor: 1_000_000, currency: "inr" },
  { slug: "core.priority_3day", planKey: "core", label: "Priority 3-day delivery", description: "Moves your study to the front of the queue. Results in 3 days.", amountMinor: 700_000, currency: "inr" },

  // Core+ — premium only, plus an Expert taste.
  { slug: "core_plus.responses_150", planKey: "core+", label: "Add 150 responses", description: "Takes your sample to 500 verified responses for finer segment-level cuts.", amountMinor: 900_000, currency: "inr" },
  { slug: "core_plus.expert_session_2", planKey: "core+", label: "Add a 2nd expert session", description: "A second working session, typically used once you have acted on the first.", amountMinor: 1_600_000, currency: "inr" },
  { slug: "core_plus.smartoffers_pilot", planKey: "core+", label: "Add a SmartOffers pilot", description: "Test a pricing or promotion concept with real consumers before you commit to it.", amountMinor: 2_800_000, currency: "inr" },
  { slug: "core_plus.city_extra", planKey: "core+", label: "Add an extra city", description: "Add one more metro to your coverage.", amountMinor: 1_000_000, currency: "inr" },
  { slug: "core_plus.competitors_highcap", planKey: "core+", label: "Expand to high-cap competitors", description: "Add large-cap national brands to the competitive set.", amountMinor: 800_000, currency: "inr" },
  { slug: "core_plus.priority_3day", planKey: "core+", label: "Priority 3-day delivery", description: "Moves your study to the front of the queue. Results in 3 days.", amountMinor: 1_000_000, currency: "inr" },

  // Expert intentionally has no add-ons — everything is baked in. The recurring
  // tracking offer (15-20% off monthly/quarterly repeats) is a post-delivery
  // sales motion, not a checkout item.
] as const satisfies readonly AddOn[]

// CatalogAddOn preserves the literal slug/plan types from ADD_ONS, so callers
// can index the price map without a cast. `AddOn` stays the widened shape used
// to constrain the literal above.
export type CatalogAddOn = (typeof ADD_ONS)[number]
export type AddOnSlug = CatalogAddOn["slug"]

// Stripe caps `optional_items` at 10 per Checkout Session.
export const MAX_OPTIONAL_ITEMS = 10

export function addOnsForPlan(plan: PlanKey): readonly CatalogAddOn[] {
  return ADD_ONS.filter((addOn) => addOn.planKey === plan)
}

// The add-ons a customer may actually be SHOWN: the catalog intersected with the
// slugs that have a configured Stripe price id.
//
// The picker renders this rather than addOnsForPlan because the two sources
// diverge in normal operation — the catalog is code, the price map is config
// (STRIPE_ADDON_PRICE_IDS), and the map is legitimately allowed to be unset or
// partial. An add-on with no price id is dropped from the Checkout Session by
// parseAddOnSelection, so rendering it would quote the customer a total they are
// never charged and leave them expecting a deliverable nobody was paid for.
export function offeredAddOnsForPlan(
  plan: PlanKey,
  offeredSlugs: Iterable<string>
): readonly CatalogAddOn[] {
  const offered = new Set(offeredSlugs)
  return addOnsForPlan(plan).filter((addOn) => offered.has(addOn.slug))
}

export function addOnBySlug(slug: string): CatalogAddOn | undefined {
  return ADD_ONS.find((addOn) => addOn.slug === slug)
}

export function isAddOnSlug(value: unknown): value is AddOnSlug {
  return typeof value === "string" && addOnBySlug(value) !== undefined
}

// `core+` is not a safe JSON key fragment; slugs use `core_plus` instead.
export function slugPlanPrefix(plan: PlanKey): string {
  return plan === "core+" ? "core_plus" : plan
}
