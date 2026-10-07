// Turns a paid Stripe Checkout Session into the amount + add-on breakdown we
// persist on the Order. Pure — test-reachable, so no `server-only`, no `@/`, and
// no Stripe SDK import (inputs are structurally typed).
//
// Why this exists: the Order row is written at session-create time with the
// pre-add-on plan amount, because the customer has not chosen their add-ons yet.
// Without reconciliation every add-on sale records a total that is too low, and
// the Pipedrive deal value inherits the error.
//
// The output is a pure function of the session, which is what makes finalization
// idempotent across webhook retries, repeated /confirmPage loads, and
// webhook-vs-confirm-page races.
//
// Invariant, asserted in tests:
//   planAmountMinor + addOnsAmountMinor + sum(unmapped) === amountCents

import { addOnBySlug } from "./addon-catalog.ts"

export type ReconcileLineItem = {
  priceId: string | null
  quantity: number | null
  amountMinor: number | null
}

export type OrderAddOnItem = {
  slug: string
  label: string
  priceId: string
  quantity: number
  unitAmountMinor: number
  amountMinor: number
}

export type OrderUnmappedItem = {
  priceId: string | null
  quantity: number
  amountMinor: number
}

export type OrderAddOns = {
  v: 1
  planPriceId: string | null
  planAmountMinor: number
  addOnsAmountMinor: number
  items: OrderAddOnItem[]
  unmapped: OrderUnmappedItem[]
  // How this breakdown was established, in descending order of trust:
  //   "line_items"        observed on the session — authoritative
  //   "metadata_fallback" the line-items fetch failed, so the selection was
  //                       recovered from session metadata and priced from the
  //                       catalog. Entitlements are exact; amounts are derived.
  //   "amount_total_only" neither was available, so the whole charge is
  //                       attributed to the plan and no add-on is recorded.
  source: "line_items" | "metadata_fallback" | "amount_total_only"
}

export type ReconcileInput = {
  amountTotal: number | null
  currency: string | null
  planPriceId: string | null
  lineItems: ReconcileLineItem[] | null
  reverseMap: ReadonlyMap<string, string>
  // The accepted selection as recorded in the Checkout Session's metadata. Used
  // ONLY when `lineItems` is null: it arrives inside the webhook payload, so it
  // is the one source that survives a line-items outage. Observed line items
  // always win — they reflect what was actually billed.
  selectedSlugs?: readonly string[]
  fallbackAmountMinor: number
  fallbackCurrency: string
}

export type ReconciledOrder = {
  amountCents: number
  currency: string
  addOns: OrderAddOns
}

// Reads the stored Order.addOns blob back defensively. It arrives from Prisma as
// an untyped JSON value and may predate the current shape, so anything
// unrecognised degrades to an empty list rather than throwing in an email
// renderer or a CRM sync.
export function summarizeOrderAddOns(value: unknown): OrderAddOnItem[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return []
  }

  const items = (value as { items?: unknown }).items
  if (!Array.isArray(items)) return []

  const summarized: OrderAddOnItem[] = []

  for (const item of items) {
    if (typeof item !== "object" || item === null) continue
    const candidate = item as Partial<OrderAddOnItem>
    if (typeof candidate.label !== "string" || typeof candidate.amountMinor !== "number") {
      continue
    }
    summarized.push({
      slug: typeof candidate.slug === "string" ? candidate.slug : "",
      label: candidate.label,
      priceId: typeof candidate.priceId === "string" ? candidate.priceId : "",
      quantity: typeof candidate.quantity === "number" ? candidate.quantity : 1,
      unitAmountMinor:
        typeof candidate.unitAmountMinor === "number"
          ? candidate.unitAmountMinor
          : candidate.amountMinor,
      amountMinor: candidate.amountMinor,
    })
  }

  return summarized
}

export function reconcileSessionAmounts(input: ReconcileInput): ReconciledOrder {
  const amountCents = input.amountTotal ?? input.fallbackAmountMinor
  const currency = (input.currency ?? input.fallbackCurrency).toLowerCase()

  if (input.lineItems === null) {
    return reconcileFromSelection(input, amountCents, currency)
  }

  const items: OrderAddOnItem[] = []
  const nonAddOn: ReconcileLineItem[] = []
  let addOnsAmountMinor = 0

  for (const lineItem of input.lineItems) {
    const priceId = lineItem.priceId
    const slug = priceId === null ? undefined : input.reverseMap.get(priceId)

    if (priceId !== null && slug !== undefined) {
      const quantity = lineItem.quantity ?? 1
      const amountMinor = lineItem.amountMinor ?? 0
      items.push({
        slug,
        // Denormalized snapshot: this order must still render correctly after
        // the catalog is repriced or relabelled.
        label: addOnBySlug(slug)?.label ?? slug,
        priceId,
        quantity,
        unitAmountMinor: quantity > 0 ? Math.round(amountMinor / quantity) : amountMinor,
        amountMinor,
      })
      addOnsAmountMinor += amountMinor
      continue
    }

    nonAddOn.push(lineItem)
  }

  let planAmountMinor = 0
  const unmapped: OrderUnmappedItem[] = []

  // `planPriceId` normally arrives via session metadata. If it is missing (a
  // session created before this shipped) and exactly one line item is left, it
  // can only be the plan.
  const planIdentifiable =
    input.planPriceId !== null || nonAddOn.length === 1

  for (const lineItem of nonAddOn) {
    const isPlan =
      input.planPriceId !== null
        ? lineItem.priceId === input.planPriceId
        : planIdentifiable

    if (isPlan) {
      planAmountMinor += lineItem.amountMinor ?? 0
      continue
    }

    // Never silently drop the remainder — that would lose money on the books.
    unmapped.push({
      priceId: lineItem.priceId,
      quantity: lineItem.quantity ?? 1,
      amountMinor: lineItem.amountMinor ?? 0,
    })
  }

  return {
    amountCents,
    currency,
    addOns: {
      v: 1,
      planPriceId: input.planPriceId,
      planAmountMinor,
      addOnsAmountMinor,
      items,
      unmapped,
      source: "line_items",
    },
  }
}

// The line items never arrived. The charged total is still trustworthy — it
// comes straight off the session — but the breakdown has to be rebuilt.
//
// Without the metadata selection this used to return "bought nothing", and
// because that is a well-formed result rather than an error, finalization
// persisted it and marked the order PAID. No replay ever corrected it, so the
// customer's paid entitlements vanished. Recovering the selection here is what
// makes that outage survivable.
function reconcileFromSelection(
  input: ReconcileInput,
  amountCents: number,
  currency: string
): ReconciledOrder {
  const selected = (input.selectedSlugs ?? [])
    .map((slug) => addOnBySlug(slug))
    .filter((addOn) => addOn !== undefined)

  if (selected.length === 0) {
    return {
      amountCents,
      currency,
      addOns: {
        v: 1,
        planPriceId: input.planPriceId,
        planAmountMinor: amountCents,
        addOnsAmountMinor: 0,
        items: [],
        unmapped: [],
        source: "amount_total_only",
      },
    }
  }

  // Catalog prices are today's; the charge is the session's. They agree unless
  // the catalog was repriced after the session was created. If the derived
  // amounts would overdraw the real total, keep the slugs — entitlements are the
  // reason this path exists — but record no amounts rather than publish a
  // breakdown that does not balance.
  const derivedTotal = selected.reduce((sum, addOn) => sum + addOn.amountMinor, 0)
  const priced = derivedTotal <= amountCents
  const addOnsAmountMinor = priced ? derivedTotal : 0

  const items: OrderAddOnItem[] = selected.map((addOn) => ({
    slug: addOn.slug,
    label: addOn.label,
    // Unknown here by definition: the line item that carried the price id is
    // exactly what failed to arrive.
    priceId: "",
    quantity: 1,
    unitAmountMinor: priced ? addOn.amountMinor : 0,
    amountMinor: priced ? addOn.amountMinor : 0,
  }))

  return {
    amountCents,
    currency,
    addOns: {
      v: 1,
      planPriceId: input.planPriceId,
      planAmountMinor: amountCents - addOnsAmountMinor,
      addOnsAmountMinor,
      items,
      unmapped: [],
      source: "metadata_fallback",
    },
  }
}
