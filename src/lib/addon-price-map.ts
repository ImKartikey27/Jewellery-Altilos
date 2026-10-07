// Parses STRIPE_ADDON_PRICE_IDS (a JSON object of `<add-on slug>: "price_..."`)
// into a validated map. Pure — test-reachable, so no `server-only` and no `@/`.
//
// Layer A of the add-on failure containment: THIS NEVER THROWS. Add-ons are
// strictly additive to checkout, so a misconfiguration must degrade to "the
// customer sees fewer options", never to "the customer cannot pay". Every
// rejection is reported through `errors` for logging, not raised.
//
// Deliberately stricter than `resolveCheckoutPriceId` in stripe.ts, which also
// accepts `prod_` ids: resolving a product to its default price costs a live
// `products.retrieve()`, and six add-ons would add six serial round-trips to
// the checkout hot path. Add-ons must be `price_` ids.

import { addOnBySlug, type AddOnSlug } from "./addon-catalog.ts"

export type AddOnPriceMap = ReadonlyMap<AddOnSlug, string>

export type ParsedAddOnPriceMap = {
  map: AddOnPriceMap
  errors: string[]
}

const PRICE_ID_PATTERN = /^price_[A-Za-z0-9]+$/

const EMPTY: ParsedAddOnPriceMap = { map: new Map(), errors: [] }

export function parseAddOnPriceMap(raw: string | undefined | null): ParsedAddOnPriceMap {
  // Unset is the valid pre-launch state, not an error: no add-ons are offered.
  if (raw === undefined || raw === null || raw.trim() === "") {
    return { map: new Map(), errors: [] }
  }

  let decoded: unknown
  try {
    decoded = JSON.parse(raw)
  } catch {
    return {
      map: new Map(),
      errors: ["STRIPE_ADDON_PRICE_IDS is not valid JSON; no add-ons will be offered"],
    }
  }

  if (typeof decoded !== "object" || decoded === null || Array.isArray(decoded)) {
    return {
      map: new Map(),
      errors: [
        "STRIPE_ADDON_PRICE_IDS must be a JSON object of slug -> price id; no add-ons will be offered",
      ],
    }
  }

  const errors: string[] = []
  const accepted = new Map<AddOnSlug, string>()

  for (const [slug, value] of Object.entries(decoded as Record<string, unknown>)) {
    if (addOnBySlug(slug) === undefined) {
      errors.push(`STRIPE_ADDON_PRICE_IDS: unknown add-on slug "${slug}"`)
      continue
    }

    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`STRIPE_ADDON_PRICE_IDS: "${slug}" has a non-string price id`)
      continue
    }

    const priceId = value.trim()

    if (!PRICE_ID_PATTERN.test(priceId)) {
      const hint = priceId.startsWith("prod_")
        ? ' (add-ons must use a "price_" id, not a "prod_" id)'
        : ""
      errors.push(`STRIPE_ADDON_PRICE_IDS: "${slug}" has an invalid price id${hint}`)
      continue
    }

    accepted.set(slug as AddOnSlug, priceId)
  }

  // A price id shared by two slugs makes the reverse (price id -> slug) lookup
  // ambiguous, which would mis-attribute revenue at reconciliation. Dropping
  // both is safer than guessing: a missing add-on is recoverable, a silently
  // mislabelled order is not.
  const slugsByPriceId = new Map<string, AddOnSlug[]>()
  for (const [slug, priceId] of accepted) {
    const existing = slugsByPriceId.get(priceId)
    if (existing) {
      existing.push(slug)
    } else {
      slugsByPriceId.set(priceId, [slug])
    }
  }

  for (const [priceId, slugs] of slugsByPriceId) {
    if (slugs.length < 2) continue
    errors.push(
      `STRIPE_ADDON_PRICE_IDS: price id "${priceId}" is reused by ${slugs
        .map((slug) => `"${slug}"`)
        .join(", ")}; all of them were dropped`
    )
    for (const slug of slugs) {
      accepted.delete(slug)
    }
  }

  return { map: accepted, errors }
}

export function invertAddOnPriceMap(map: AddOnPriceMap): ReadonlyMap<string, AddOnSlug> {
  const inverted = new Map<string, AddOnSlug>()
  for (const [slug, priceId] of map) {
    inverted.set(priceId, slug)
  }
  return inverted
}

export const EMPTY_ADDON_PRICE_MAP: AddOnPriceMap = EMPTY.map
