import "server-only"

import type Stripe from "stripe"

import { extractCheckoutContactFields } from "@/lib/checkout-contact-fields"
import { env } from "@/lib/env"
import { sendPurchaseThankYouEmail } from "@/lib/mailchimp-transactional"
import { buildOnboardingUrl, createOnboardingAccessToken } from "@/lib/onboarding-token"
import { prisma } from "@/lib/prisma"
import { invertAddOnPriceMap } from "@/lib/addon-price-map"
import {
  ADDON_SLUGS_METADATA_KEY,
  parseAddOnSlugMetadata,
} from "@/lib/addon-session-metadata"
import { reconcileSessionAmounts, type ReconciledOrder } from "@/lib/addon-reconcile"
import { fetchSessionLineItems } from "@/lib/stripe"
import { getAddOnPriceMap } from "@/lib/addon-price-map-server"
import type { Prisma } from "@/generated/prisma/client"

// Reconciles the order against what Stripe actually charged, including any
// checkout add-ons. Must never throw: it runs before the order.update that sets
// status PAID and triggers the onboarding email, so a failure here would block
// fulfilment over a reporting detail. Degrades to the pre-existing behaviour.
async function safeReconcile(
  session: Stripe.Checkout.Session,
  fallback: { amountCents: number; currency: string }
): Promise<ReconciledOrder | null> {
  try {
    const lineItems = await fetchSessionLineItems(session)
    const planPriceId =
      typeof session.metadata?.planPriceId === "string"
        ? session.metadata.planPriceId
        : null

    return reconcileSessionAmounts({
      amountTotal: session.amount_total,
      currency: session.currency,
      planPriceId,
      lineItems,
      reverseMap: invertAddOnPriceMap(getAddOnPriceMap()),
      // Only consulted when the line items could not be read. Comes off the
      // session object we already hold, so it cannot fail alongside them.
      selectedSlugs: parseAddOnSlugMetadata(
        session.metadata?.[ADDON_SLUGS_METADATA_KEY]
      ),
      fallbackAmountMinor: fallback.amountCents,
      fallbackCurrency: fallback.currency,
    })
  } catch (error) {
    console.error(`Failed to reconcile checkout session ${session.id}`, error)
    return null
  }
}

export async function finalizePaidCheckoutSession(
  session: Stripe.Checkout.Session,
  baseUrl = env.NEXT_PUBLIC_BASE_URL
) {
  if (session.payment_status !== "paid") return null

  const email = session.customer_email ?? session.customer_details?.email
  const name = session.customer_details?.name
  const { companyName, mobileNumber } = extractCheckoutContactFields(session)

  if (!email) {
    throw new Error(`Missing customer email for checkout session ${session.id}`)
  }

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      name: name ?? undefined,
      company: companyName,
      mobileNumber: mobileNumber ?? undefined,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
    },
    create: {
      email,
      name,
      company: companyName,
      mobileNumber,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
    },
  })

  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
    select: { amountCents: true, currency: true },
  })

  const reconciled = existing ? await safeReconcile(session, existing) : null

  // One write: the reconciled amount lands in the same update that marks the
  // order PAID, so there is no window where a PAID order carries the stale
  // pre-add-on amount.
  //
  // There is no "already reconciled" guard, but do NOT read that as "a later
  // replay will repair a degraded row" — it will not. Stripe does not retry a
  // webhook that returned 200, this route's idempotency gate rejects a replay of
  // the same event id regardless, and resolveConfirmationState skips
  // finalization once the order is PAID. Whatever is written here is final in
  // practice, which is why reconciliation recovers the add-on selection from
  // session metadata rather than persisting an empty list when the line-items
  // fetch fails.
  const order = await prisma.order.update({
    where: { stripeSessionId: session.id },
    data: {
      customerId: customer.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      status: "PAID",
      ...(reconciled
        ? {
            amountCents: reconciled.amountCents,
            currency: reconciled.currency,
            addOns: reconciled.addOns as unknown as Prisma.InputJsonValue,
          }
        : {}),
    },
  })

  if (!(await orderEmailWasSent(order.id))) {
    try {
      const { token } = await createOnboardingAccessToken({
        orderId: order.id,
        delivery: "EMAIL",
      })

      await sendPurchaseThankYouEmail({
        toEmail: email,
        toName: name,
        plan: order.plan,
        formUrl: buildOnboardingUrl(baseUrl, token),
      })

      await prisma.order.update({
        where: { id: order.id },
        data: {
          onboardingEmailSentAt: new Date(),
          onboardingEmailError: null,
        },
      })
    } catch (error) {
      await prisma.order.update({
        where: { id: order.id },
        data: { onboardingEmailError: String(error) },
      })
    }
  }

  return { order, customer }
}

async function orderEmailWasSent(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { onboardingEmailSentAt: true },
  })
  return Boolean(order?.onboardingEmailSentAt)
}

export async function markCheckoutSessionExpired(sessionId: string) {
  await prisma.order.update({
    where: { stripeSessionId: sessionId },
    data: { status: "EXPIRED" },
  })
}
