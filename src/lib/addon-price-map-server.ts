import "server-only"

// The process-wide add-on price map, read once from STRIPE_ADDON_PRICE_IDS.
//
// This lives here rather than in stripe.ts so that a rendering path can ask
// "which add-ons are actually purchasable?" without importing the Stripe SDK.
// The /checkout server component needs exactly that: the picker must render the
// INTERSECTION of the catalog and this map, because an add-on with no price id
// is one the checkout session will silently omit — the customer would see it in
// their total and never be charged for it.

import { parseAddOnPriceMap, type AddOnPriceMap } from "./addon-price-map"
import { env } from "./env"

let addOnPriceMap: AddOnPriceMap | null = null

// Memoized like the Stripe client: parsing is cheap, but the misconfiguration
// warning should fire once at boot rather than on every checkout.
export function getAddOnPriceMap(): AddOnPriceMap {
    if (addOnPriceMap === null) {
        const { map, errors } = parseAddOnPriceMap(env.STRIPE_ADDON_PRICE_IDS)
        for (const error of errors) {
            console.warn(error)
        }
        addOnPriceMap = map
    }

    return addOnPriceMap
}
