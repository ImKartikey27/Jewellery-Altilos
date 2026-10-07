// The accepted add-on selection, carried on the Stripe Checkout Session itself.
// Pure — test-reachable, so no `server-only` and no `@/`.
//
// WHY THIS EXISTS: reconciliation normally learns which add-ons were bought by
// reading the session's line items, which costs a live `listLineItems` call on
// the webhook path (the webhook payload does not include them). That call can
// fail transiently, and fetchSessionLineItems reports failure by returning null
// — a value, not a throw — which reconcileSessionAmounts then turns into a
// perfectly well-formed "no add-ons were bought" result. That result is written
// to the order as though it were observed truth, and nothing ever revisits it:
// Stripe does not retry a webhook that returned 200, and the confirmation page
// skips finalization for an order that is already PAID.
//
// Metadata closes that hole because it arrives INSIDE the webhook payload. There
// is no request to fail, so the selection survives any line-item outage.

import { isAddOnSlug, type AddOnSlug } from "./addon-catalog.ts"

export const ADDON_SLUGS_METADATA_KEY = "addOnSlugs"

// Stripe's per-value limit. Exceeding it rejects the entire session — which
// would stop the customer paying at all — so the writer truncates instead.
const MAX_METADATA_VALUE_LENGTH = 500

const SEPARATOR = ","

export function formatAddOnSlugMetadata(slugs: readonly string[]): string | undefined {
  if (slugs.length === 0) return undefined

  const kept: string[] = []
  let length = 0

  for (const slug of slugs) {
    const cost = kept.length === 0 ? slug.length : slug.length + SEPARATOR.length
    // Stop rather than skip: the list is in catalog order, and a gap would be
    // more confusing to read back than a short prefix.
    if (length + cost > MAX_METADATA_VALUE_LENGTH) break
    kept.push(slug)
    length += cost
  }

  return kept.length > 0 ? kept.join(SEPARATOR) : undefined
}

export function parseAddOnSlugMetadata(raw: unknown): AddOnSlug[] {
  if (typeof raw !== "string" || raw.trim() === "") return []

  const slugs: AddOnSlug[] = []

  for (const part of raw.split(SEPARATOR)) {
    const slug = part.trim()
    // Anything unrecognised is dropped rather than trusted: this value comes
    // back off a Stripe object that may predate a catalog change, and a stray
    // entry must never invent an entitlement nobody paid for.
    if (!isAddOnSlug(slug)) continue
    if (slugs.includes(slug)) continue
    slugs.push(slug)
  }

  return slugs
}

export type CheckoutSessionMetadataInput = {
  plan: string
  planPriceId: string
  orderId?: string
  addOnSlugs: readonly string[]
}

// Stripe rejects a metadata object containing a non-string value, so optional
// entries are omitted rather than written as undefined.
export function buildCheckoutSessionMetadata(
  input: CheckoutSessionMetadataInput
): Record<string, string> {
  // planPriceId lets reconciliation tell the plan line item apart from the
  // add-ons without an extra API call.
  const metadata: Record<string, string> = {
    plan: input.plan,
    planPriceId: input.planPriceId,
  }

  if (input.orderId) metadata.orderId = input.orderId

  const addOnSlugs = formatAddOnSlugMetadata(input.addOnSlugs)
  if (addOnSlugs) metadata[ADDON_SLUGS_METADATA_KEY] = addOnSlugs

  return metadata
}
