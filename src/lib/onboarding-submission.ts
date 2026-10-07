import "server-only"

import { randomBytes } from "node:crypto"

import { prisma } from "@/lib/prisma"
import { hashOnboardingToken, interpretOnboardingTokenRecord } from "@/lib/onboarding-token"
import {
  buildOnboardingSubmissionSchema,
  type OnboardingSubmissionInput,
} from "@/lib/onboarding-schema"
import { sanitizeSubmissionPayload, emptyToNull } from "@/lib/onboarding-payload"
import { handleOnboardingPostSubmission } from "@/lib/onboarding-post-submission"
import type { PlanKey } from "@/lib/onboarding-questions"
import { entitlementsFromOrderAddOns } from "@/lib/addon-entitlements"

export type { OnboardingSubmissionInput }

type SubmissionResult =
  | { status: "submitted"; submissionId: string; orderId: string }
  | { status: "already_submitted" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "used" }
  | { status: "unpaid" }

const PLAN_KEYS: PlanKey[] = ["pulse", "core", "core+", "expert"]
function asPlanKey(value: string): PlanKey {
  return (PLAN_KEYS as string[]).includes(value) ? (value as PlanKey) : "pulse"
}

export async function submitOnboardingForm(rawInput: unknown): Promise<SubmissionResult> {
  const token = extractToken(rawInput)
  if (!token) return { status: "invalid" }

  const result = await prisma.$transaction(async (tx) => {
    const tokenRows = await tx.$queryRaw<Array<{
      id: string
      orderId: string
      expiresAt: Date
      usedAt: Date | null
      orderStatus: string
      orderPlan: string
      orderAddOns: unknown
      customerId: string | null
      submissionId: string | null
    }>>`
      SELECT
        oat."id",
        oat."orderId",
        oat."expiresAt",
        oat."usedAt",
        o."status"::text AS "orderStatus",
        o."plan" AS "orderPlan",
        o."addOns" AS "orderAddOns",
        o."customerId",
        os."id" AS "submissionId"
      FROM "OnboardingAccessToken" oat
      JOIN "Order" o ON o."id" = oat."orderId"
      LEFT JOIN "OnboardingSubmission" os ON os."orderId" = o."id"
      WHERE oat."tokenHash" = ${hashOnboardingToken(token)}
      LIMIT 1
    `

    const tokenRow = tokenRows[0]
    const tokenRecord = tokenRow
      ? {
          id: tokenRow.id,
          orderId: tokenRow.orderId,
          expiresAt: tokenRow.expiresAt,
          usedAt: tokenRow.usedAt,
          order: {
            status: tokenRow.orderStatus,
            onboardingSubmission: tokenRow.submissionId ? { id: tokenRow.submissionId } : null,
          },
        }
      : null

    const state = interpretOnboardingTokenRecord(tokenRecord)
    if (state.status === "submitted") return { status: "already_submitted" as const }
    if (state.status !== "ready") return state
    if (!tokenRow?.customerId) return { status: "invalid" as const }

    // Plan- and add-on-aware validation. Both are derived from the order row,
    // never trusted from client input: the form's own idea of which questions
    // are unlocked has no bearing on what the server will accept.
    const plan = asPlanKey(tokenRow.orderPlan)
    const entitlements = entitlementsFromOrderAddOns(tokenRow.orderAddOns)
    const input = buildOnboardingSubmissionSchema(plan, entitlements).parse(rawInput)
    const sanitized = sanitizeSubmissionPayload(input)

    try {
      const submissionId = cryptoRandomId()
      await tx.$executeRaw`
        INSERT INTO "OnboardingSubmission" (
          "id", "orderId", "customerId", "fullName", "workEmail", "jobTitle",
          "companyName", "companyWebsite", "phoneNumber", "researchBrief",
          "termsAccepted", "payload", "createdAt", "updatedAt"
        )
        VALUES (
          ${submissionId}, ${tokenRow.orderId}, ${tokenRow.customerId}, ${input.fullName},
          ${input.workEmail}, ${input.jobTitle}, ${input.companyName},
          ${emptyToNull(input.companyWebsite)}, ${emptyToNull(input.phoneNumber)},
          ${JSON.stringify(input.researchBrief)}::jsonb,
          ${input.termsAccepted},
          ${JSON.stringify(sanitized)}::jsonb, NOW(), NOW()
        )
      `

      await tx.$executeRaw`
        UPDATE "OnboardingAccessToken" SET "usedAt" = NOW() WHERE "id" = ${tokenRow.id}
      `

      return { status: "submitted" as const, submissionId, orderId: tokenRow.orderId, plan, input }
    } catch (error) {
      if (isPrismaUniqueError(error)) return { status: "already_submitted" as const }
      throw error
    }
  })

  if (result.status === "submitted") {
    // Fan out (Pipedrive + team email + user email); never blocks the success path.
    await handleOnboardingPostSubmission({
      input: result.input,
      plan: result.plan,
      submissionId: result.submissionId,
      orderId: result.orderId,
    })
    return { status: "submitted", submissionId: result.submissionId, orderId: result.orderId }
  }

  return result
}

function extractToken(rawInput: unknown): string | null {
  if (rawInput && typeof rawInput === "object" && "token" in rawInput) {
    const t = (rawInput as { token?: unknown }).token
    if (typeof t === "string" && t.length >= 20) return t
  }
  return null
}

function isPrismaUniqueError(error: unknown): error is { code: "P2002" } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}

function cryptoRandomId(): string {
  return `ck_${randomBytes(16).toString("hex")}`
}
