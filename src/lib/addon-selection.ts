// Validates a client-supplied add-on selection. Pure — test-reachable, so no
// `server-only` and no `@/`.
//
// THIS IS THE TRUST BOUNDARY. The picker runs in the browser and sends slugs
// only; every amount and every Stripe price id is resolved here, server-side,
// from the catalog and the price map. A slug is accepted only if it is in the
// catalog, belongs to the plan being purchased, AND has a mapped `price_` id.
//
// Like addon-price-map.ts this NEVER throws: a bad slug is dropped and reported
// through `rejected` for logging. A customer must always be able to pay for the
// plan even if their add-on selection is nonsense.

import { addOnBySlug, addOnsForPlan, type AddOnSlug } from "./addon-catalog.ts"
import type { AddOnPriceMap } from "./addon-price-map.ts"
import { PLAN_PRICING, type PlanKey } from "./plans.ts"

export type AddOnSelection = {
  slugs: AddOnSlug[]
  rejected: string[]
}

export function parseAddOnSelection(
  plan: PlanKey,
  raw: unknown,
  priceMap: AddOnPriceMap
): AddOnSelection {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { slugs: [], rejected: [] }
  }

  const requested = new Set<string>()
  const rejected: string[] = []

  for (const value of raw) {
    if (typeof value !== "string") continue
    requested.add(value)
  }

  // Iterating the catalog (not the request) is what forces catalog display
  // order onto the line items, so the Stripe summary reads the same way the
  // picker did.
  const offered = addOnsForPlan(plan)
  const slugs: AddOnSlug[] = []

  for (const addOn of offered) {
    if (!requested.has(addOn.slug)) continue
    if (!priceMap.get(addOn.slug)) continue
    slugs.push(addOn.slug)
  }

  const accepted = new Set<string>(slugs)
  for (const value of requested) {
    if (!accepted.has(value)) rejected.push(value)
  }

  return { slugs, rejected }
}

// The order total we can now know BEFORE payment, because the customer chose
// their add-ons on our page rather than inside Stripe's checkout.
export function selectionAmountMinor(plan: PlanKey, slugs: readonly string[]): number {
  let total = PLAN_PRICING[plan].amountMinor

  for (const slug of slugs) {
    const addOn = addOnBySlug(slug)
    if (addOn) total += addOn.amountMinor
  }

  return total
}
