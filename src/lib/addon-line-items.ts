// Builds the `line_items` array for a Checkout Session. Pure — test-reachable,
// so no `server-only` and no `@/`.
//
// Replaces addon-optional-items.ts (which will be deleted in a later task).
// Add-ons are no longer offered through Stripe's `optional_items` cross-sell
// widget (a carousel with a full-screen "View all" sheet that cannot be
// restyled); the customer chooses them on our own /checkout page and they
// arrive here as ordinary line items. A session with no `optional_items`
// renders no cross-sell UI at all, which is the point.
//
// Every slug reaching this function has already passed parseAddOnSelection, so
// the price lookup should always hit. The skip is belt-and-braces: emitting
// `{ price: undefined }` would fail the whole session — including the plan — and
// a missing add-on must never cost us the sale.

import type { AddOnSlug } from "./addon-catalog.ts"
import type { AddOnPriceMap } from "./addon-price-map.ts"

export type StripeLineItem = {
  price: string
  quantity: number
}

export function buildCheckoutLineItems(
  planPriceId: string,
  slugs: readonly AddOnSlug[],
  priceMap: AddOnPriceMap
): StripeLineItem[] {
  const items: StripeLineItem[] = [{ price: planPriceId, quantity: 1 }]

  for (const slug of slugs) {
    const price = priceMap.get(slug)
    if (!price) continue
    items.push({ price, quantity: 1 })
  }

  return items
}
