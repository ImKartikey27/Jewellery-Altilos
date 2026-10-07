import "server-only"

import { createHmac, randomBytes } from "node:crypto"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export type OnboardingTokenStatus =
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "used" }
  | { status: "unpaid" }
  | { status: "submitted" }
  | { status: "ready" }

type TokenRecordForState = {
  id?: string
  orderId?: string
  expiresAt: Date
  usedAt: Date | null
  order: {
    status: string
    onboardingSubmission: { id: string } | null
  }
}

export function createOnboardingTokenValue(): string {
  return randomBytes(32).toString("base64url")
}

export function hashOnboardingToken(
  token: string,
  pepper = env.ONBOARDING_TOKEN_PEPPER
): string {
  return createHmac("sha256", pepper).update(token).digest("hex")
}

export function buildOnboardingUrl(baseUrl: string, token: string): string {
  const url = new URL("/formPage", baseUrl)
  url.searchParams.set("token", token)
  return url.toString()
}

export function interpretOnboardingTokenRecord(
  record: TokenRecordForState | null,
  now = new Date()
): OnboardingTokenStatus {
  if (!record) return { status: "invalid" }
  if (record.expiresAt <= now) return { status: "expired" }
  if (record.order.status !== "PAID") return { status: "unpaid" }
  if (record.order.onboardingSubmission) return { status: "submitted" }
  if (record.usedAt) return { status: "used" }
  return { status: "ready" }
}

export async function createOnboardingAccessToken({
  orderId,
  delivery,
  expiresInDays = 14,
}: {
  orderId: string
  delivery: "CONFIRMATION_CTA" | "EMAIL"
  expiresInDays?: number
}) {
  const token = createOnboardingTokenValue()
  const tokenHash = hashOnboardingToken(token)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  await prisma.$executeRaw`
    INSERT INTO "OnboardingAccessToken" ("id", "orderId", "tokenHash", "delivery", "expiresAt", "createdAt")
    VALUES (${cryptoRandomId()}, ${orderId}, ${tokenHash}, ${delivery}::"OnboardingTokenDelivery", ${expiresAt}, NOW())
  `

  return { token, tokenHash, expiresAt }
}

export async function resolveOnboardingAccessToken(token: string) {
  const rows = await prisma.$queryRaw<Array<{
    id: string
    orderId: string
    expiresAt: Date
    usedAt: Date | null
    orderStatus: string
    orderPlan: string
    orderAddOns: unknown
    submissionId: string | null
    customerId: string | null
    customerEmail: string | null
    customerName: string | null
    customerCompany: string | null
    customerMobileNumber: string | null
  }>>`
    SELECT
      oat."id",
      oat."orderId",
      oat."expiresAt",
      oat."usedAt",
      o."status"::text AS "orderStatus",
      o."plan" AS "orderPlan",
      o."addOns" AS "orderAddOns",
      os."id" AS "submissionId",
      c."id" AS "customerId",
      c."email" AS "customerEmail",
      c."name" AS "customerName",
      c."company" AS "customerCompany",
      c."mobileNumber" AS "customerMobileNumber"
    FROM "OnboardingAccessToken" oat
    JOIN "Order" o ON o."id" = oat."orderId"
    LEFT JOIN "Customer" c ON c."id" = o."customerId"
    LEFT JOIN "OnboardingSubmission" os ON os."orderId" = o."id"
    WHERE oat."tokenHash" = ${hashOnboardingToken(token)}
    LIMIT 1
  `

  const row = rows[0]
  const record = row
    ? {
        id: row.id,
        orderId: row.orderId,
        expiresAt: row.expiresAt,
        usedAt: row.usedAt,
        order: {
          status: row.orderStatus,
          plan: row.orderPlan,
          // Raw Order.addOns JSON. Parsed by addon-entitlements, which degrades
          // anything unreadable to NO_ENTITLEMENTS rather than throwing here.
          addOns: row.orderAddOns ?? null,
          onboardingSubmission: row.submissionId ? { id: row.submissionId } : null,
          customer: row.customerId
            ? {
                id: row.customerId,
                email: row.customerEmail ?? "",
                name: row.customerName,
                company: row.customerCompany,
                mobileNumber: row.customerMobileNumber,
              }
            : null,
        },
      }
    : null

  return {
    record,
    state: interpretOnboardingTokenRecord(record),
  }
}

function cryptoRandomId(): string {
  return `ck_${randomBytes(16).toString("hex")}`
}

