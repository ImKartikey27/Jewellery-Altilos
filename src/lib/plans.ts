// Canonical plan definitions. Pure data — no `server-only`, no `@/` aliases, no
// non-erasable TS, so `tests/*.test.mjs` can import this file directly under
// `node --experimental-strip-types`. Keep it that way.
//
// Amounts are in MINOR units (paise for INR). ₹8,000 === 800_000 paise.
// Prices are GST-INCLUSIVE: the displayed amount is what the customer pays.
// Stripe Tax does not support India as a business location, so GST is neither
// calculated nor collected by Stripe — it is accounted for downstream.

export type PlanKey = "pulse" | "core" | "core+" | "expert"

export const PLAN_KEYS: readonly PlanKey[] = ["pulse", "core", "core+", "expert"]

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && (PLAN_KEYS as readonly string[]).includes(value)
}

export type PlanPricing = {
  amountMinor: number
  currency: string
}

export const PLAN_PRICING: Record<PlanKey, PlanPricing> = {
  pulse: { amountMinor: 800_000, currency: "inr" },
  core: { amountMinor: 4_000_000, currency: "inr" },
  "core+": { amountMinor: 10_000_000, currency: "inr" },
  expert: { amountMinor: 20_000_000, currency: "inr" },
}

export const CHECKOUT_CURRENCY = "inr"
