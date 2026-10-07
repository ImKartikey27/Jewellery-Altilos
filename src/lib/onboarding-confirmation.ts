import "server-only"

import { env } from "@/lib/env"
import { finalizePaidCheckoutSession } from "@/lib/order-finalization"
import { buildOnboardingUrl, createOnboardingAccessToken } from "@/lib/onboarding-token"
import { prisma } from "@/lib/prisma"
import { getStripeClient } from "@/lib/stripe"

export type ConfirmationState =
  | { status: "missing_session" }
  | { status: "not_found" }
  | { status: "not_paid" }
  | { status: "configuration_missing" }
  | { status: "ready"; email: string; formUrl: string }
  | { status: "already_submitted"; email: string; formUrl: string }

export async function resolveConfirmationState(
  sessionId: string | undefined
): Promise<ConfirmationState> {
  if (!sessionId) return { status: "missing_session" }

  let order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      customer: true,
    },
  })

  if (!order || order.status !== "PAID" || !order.customer) {
    // Expanding line_items here means reconciliation costs zero extra API calls
    // on this path — the retrieve already happens.
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    })
    if (session.payment_status !== "paid") {
      return { status: "not_paid" }
    }

    await finalizePaidCheckoutSession(session)
    order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        customer: true,
      },
    })
  }

  if (!order || !order.customer) return { status: "not_found" }
  if (order.status !== "PAID") return { status: "not_paid" }

  let formUrl: string
  try {
    const { token } = await createOnboardingAccessToken({
      orderId: order.id,
      delivery: "CONFIRMATION_CTA",
    })

    formUrl = buildOnboardingUrl(env.NEXT_PUBLIC_BASE_URL, token)
  } catch (error) {
    if (isMissingConfirmationEnvironment(error)) {
      return { status: "configuration_missing" }
    }

    throw error
  }

  return {
    status: (await orderHasSubmission(order.id)) ? "already_submitted" : "ready",
    email: order.customer.email,
    formUrl,
  }
}

async function orderHasSubmission(orderId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "OnboardingSubmission" WHERE "orderId" = ${orderId} LIMIT 1
  `
  return rows.length > 0
}

function isMissingConfirmationEnvironment(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  return (
    error.message.includes("ONBOARDING_TOKEN_PEPPER") ||
    error.message.includes("NEXT_PUBLIC_BASE_URL")
  )
}
