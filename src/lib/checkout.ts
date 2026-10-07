import type { PlanKey } from "./plans"

export type CheckoutPlan = PlanKey

export type CreateSessionResult = {
    url: string
    sessionId: string
}

// Sends slugs only. The server resolves prices and amounts — see
// src/lib/addon-selection.ts. Never send amounts from here.
export async function createCheckoutSession(
    plan: CheckoutPlan,
    addOns: readonly string[] = []
): Promise<CreateSessionResult> {
    const res = await fetch("/api/checkout/create-session",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ plan, addOns })
    })

    if(!res.ok) throw new Error("Failed to create checkout session")

    return res.json() as Promise<CreateSessionResult>
}
