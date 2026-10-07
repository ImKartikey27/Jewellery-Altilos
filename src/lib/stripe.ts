import "server-only"
import Stripe from "stripe"
import { env } from "./env"
import { buildCheckoutContactCustomFields } from "./checkout-contact-fields"
import { buildCheckoutLineItems } from "./addon-line-items"
import { getAddOnPriceMap } from "./addon-price-map-server"
import type { AddOnSlug } from "./addon-catalog"
import { buildCheckoutSessionMetadata } from "./addon-session-metadata"
import type { PlanKey } from "./plans"

let stripeClient: Stripe | null = null

export function getStripeClient(){
    if(!stripeClient){
        stripeClient = new Stripe(env.STRIPE_SECRET_KEY,{
            apiVersion: "2026-05-27.dahlia"
        })
    }

    return stripeClient
}

function checkoutPriceIdForPlan(plan: PlanKey): string {
    const map = {
        pulse: env.STRIPE_PRODUCT_ID_PULSE,
        core: env.STRIPE_PRODUCT_ID_CORE,
        "core+": env.STRIPE_PRODUCT_ID_CORE_PLUS,
        expert: env.STRIPE_PRODUCT_ID_EXPERT,
    }

    return map[plan]
}

async function resolveCheckoutPriceId(plan: PlanKey): Promise<string> {
    const configuredId = checkoutPriceIdForPlan(plan)

    if (configuredId.startsWith("price_")) {
        return configuredId
    }

    // Deprecated path: resolving a product to its default price costs a live API
    // call on every checkout. Point STRIPE_PRODUCT_ID_* at `price_` ids instead;
    // this branch is kept only as a rollback hatch.
    if (!configuredId.startsWith("prod_")) {
        throw new Error(`Invalid Stripe price configuration for plan ${plan}`)
    }

    const product = await getStripeClient().products.retrieve(configuredId)
    const defaultPrice = product.default_price

    if (typeof defaultPrice === "string") {
        return defaultPrice
    }

    if (defaultPrice && !defaultPrice.deleted) {
        return defaultPrice.id
    }

    throw new Error(`Stripe product ${configuredId} has no default price for plan ${plan}`)
}

// Branding is the only lever we have over Stripe's own checkout page, and it is
// what stops a paying customer seeing the Rwazi mark and "Altilos's Sandbox".
//
// `logo` and `icon` are accepted ONLY because this session is `hosted_page`;
// Stripe rejects both with "You cannot set X when `ui_mode` is `embedded_page`".
// That rejection is why the previous embedded integration had no logo inside
// the payment frame, and it is a large part of why we moved.
//
// Colours are set to the Altilos palette (src/app/globals.css): #0a0a0a ground,
// #f97316 accent. `font_family: "inter"` matches the site's body face.
function buildBrandingSettings(): Stripe.Checkout.SessionCreateParams.BrandingSettings {
    const logoFile = env.STRIPE_BRAND_LOGO_FILE
    const iconFile = env.STRIPE_BRAND_ICON_FILE

    return {
        display_name: "Altilos",
        background_color: "#0a0a0a",
        button_color: "#f97316",
        border_style: "rounded",
        font_family: "inter",
        ...(logoFile ? { logo: { type: "file" as const, file: logoFile } } : {}),
        ...(iconFile ? { icon: { type: "file" as const, file: iconFile } } : {}),
    }
}

interface HostedSessionParams {
    plan: PlanKey
    successUrl: string
    addOnSlugs: readonly AddOnSlug[]
    orderId?: string
}

interface HostedSessionResult {
    url: string
    sessionId: string
}

export async function createHostedSession(
    { plan, successUrl, addOnSlugs, orderId }: HostedSessionParams
): Promise<HostedSessionResult> {
    const priceId = await resolveCheckoutPriceId(plan)
    const lineItems = buildCheckoutLineItems(priceId, addOnSlugs, getAddOnPriceMap())

    // GST: prices are GST-INCLUSIVE. Stripe Tax does not support India as a
    // business location, so `automatic_tax` cannot compute GST here. Deliberately
    // omitted.
    //
    // No `optional_items`: add-ons are chosen on our own /checkout page and
    // arrive above as line_items. A session without optional_items renders no
    // cross-sell carousel and no "View all" sheet, which is the whole point of
    // the picker.
    const session = await getStripeClient().checkout.sessions.create({
        ui_mode: "hosted_page",
        mode: "payment",
        line_items: lineItems,
        success_url: successUrl,
        // Stable label so the picker's attach rate is comparable in the Dashboard.
        integration_identifier: "altilos-hosted-qxbtrnwm",
        branding_settings: buildBrandingSettings(),
        custom_fields: buildCheckoutContactCustomFields(),
        // Carries the accepted add-on selection as well as planPriceId. That
        // selection is what lets finalization survive a failed line-items fetch:
        // metadata arrives inside the webhook payload, so unlike the line items
        // there is no request that can fail. See addon-session-metadata.ts.
        metadata: buildCheckoutSessionMetadata({
            plan,
            planPriceId: priceId,
            orderId,
            addOnSlugs,
        }),
    })

    if (!session.url) {
        throw new Error(`Stripe returned no hosted checkout URL for session ${session.id}`)
    }

    return { url: session.url, sessionId: session.id }
}

export type SessionLineItem = {
    priceId: string | null
    quantity: number | null
    amountMinor: number | null
}

// Returns null ONLY when the breakdown cannot be established, which
// reconciliation records as source: "amount_total_only" — a repairable state,
// not a failure.
//
// There used to be an `optional_items`-empty short-circuit here as an
// API-call optimisation. It MUST NOT come back: add-ons now arrive as ordinary
// line_items and no session carries optional_items at all, so that guard would
// silently degrade every order to "amount_total_only" and wipe the add-on
// breakdown out of Order.addOns. This runs once per paid order in
// finalization, never on the checkout hot path, so one list call is cheap.
export async function fetchSessionLineItems(
    session: Stripe.Checkout.Session
): Promise<SessionLineItem[] | null> {
    try {
        const expanded = session.line_items?.data
        const lineItems =
            expanded ??
            (await getStripeClient().checkout.sessions.listLineItems(session.id, {
                limit: 100,
            })).data

        return lineItems.map((lineItem) => ({
            priceId: typeof lineItem.price?.id === "string" ? lineItem.price.id : null,
            quantity: lineItem.quantity,
            amountMinor: lineItem.amount_total,
        }))
    } catch (error) {
        console.error(`Failed to read line items for session ${session.id}`, error)
        return null
    }
}
