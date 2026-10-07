import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createHostedSession } from "@/lib/stripe"
import { getAddOnPriceMap } from "@/lib/addon-price-map-server"
import { prisma } from "@/lib/prisma"
import { parseAddOnSelection, selectionAmountMinor } from "@/lib/addon-selection"
import { CHECKOUT_CURRENCY } from "@/lib/plans"

// The client sends add-on SLUGS, never prices or amounts. Everything monetary is
// resolved server-side from the catalog and the price map — see
// addon-selection.ts. `.max(10)` is a cheap guard on payload size; the real
// filter is that a slug must belong to the plan being bought.
const bodySchema = z.object({
    plan: z.enum(["pulse", "core", "core+", "expert"]),
    addOns: z.array(z.string().max(64)).max(10).optional(),
})

export async function POST(req: NextRequest){
    try {

        const body = await req.json()
        const result = bodySchema.safeParse(body)

        if(!result.success){
            return NextResponse.json({error: "Invalid request body"}, {status: 400})
        }

        const { plan, addOns } = result.data
        const successUrl = `${new URL(req.url).origin}/confirmPage?session_id={CHECKOUT_SESSION_ID}`

        const selection = parseAddOnSelection(plan, addOns, getAddOnPriceMap())

        // A rejected slug is a client/config bug, not a customer-facing error:
        // the sale proceeds without that add-on rather than failing.
        if (selection.rejected.length > 0) {
            console.warn(
                `Dropped unrecognised add-ons for plan ${plan}: ${selection.rejected.join(", ")}`
            )
        }

        // The customer picked their add-ons on our page, so unlike the old
        // optional_items flow we know the true total BEFORE payment. This is
        // still reconciled against the session's amount_total in
        // finalizePaidCheckoutSession, which now acts as a cross-check rather
        // than a repair.
        const order = await prisma.order.create({
            data:{
                plan,
                amountCents: selectionAmountMinor(plan, selection.slugs),
                currency: CHECKOUT_CURRENCY,
                status: "PENDING"
            }
        })

        const { url, sessionId } = await createHostedSession({
            plan,
            successUrl,
            addOnSlugs: selection.slugs,
            orderId: order.id,
        })

        await prisma.order.update({
            where: { id: order.id },
            data: {
                stripeSessionId: sessionId,
            }
        })

        return NextResponse.json({ url, sessionId })

    } catch (error) {

        console.error("Error creating checkout session", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})

    }
}
