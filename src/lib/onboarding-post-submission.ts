import "server-only"

import { prisma } from "@/lib/prisma"
import { syncOnboardingSubmissionToPipedrive } from "@/lib/pipedrive"
import {
  sendTeamBriefNotificationEmail,
  sendBriefReceivedUserEmail,
} from "@/lib/mailchimp-transactional"
import type { OnboardingSubmissionInput } from "@/lib/onboarding-schema"
import type { PlanKey } from "@/lib/onboarding-questions"

export async function handleOnboardingPostSubmission({
  input,
  plan,
  submissionId,
  orderId,
}: {
  input: OnboardingSubmissionInput
  plan: PlanKey
  submissionId: string
  orderId: string
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      plan: true,
      amountCents: true,
      currency: true,
      addOns: true,
      stripeSessionId: true,
      stripePaymentIntentId: true,
    },
  })
  if (!order) return

  // 1. Pipedrive
  try {
    const syncResult = await syncOnboardingSubmissionToPipedrive({ submission: input, order, plan })
    await prisma.$executeRaw`
      UPDATE "OnboardingSubmission"
      SET "pipedriveSyncedAt" = NOW(), "pipedriveSyncError" = NULL, "updatedAt" = NOW()
      WHERE "id" = ${submissionId}
    `
    await prisma.order.update({ where: { id: order.id }, data: { pipedriveDealId: syncResult.dealId } })
    await prisma.customer.updateMany({
      where: { email: input.workEmail },
      data: { pipedrivePersonId: String(syncResult.personId) },
    })
  } catch (error) {
    await prisma.$executeRaw`
      UPDATE "OnboardingSubmission"
      SET "pipedriveSyncError" = ${String(error)}, "updatedAt" = NOW()
      WHERE "id" = ${submissionId}
    `
  }

  // 2. Team notification
  try {
    await sendTeamBriefNotificationEmail({ submission: input, plan, order })
  } catch (error) {
    console.error("Team brief notification failed:", error)
  }

  // 3. User "brief received"
  try {
    await sendBriefReceivedUserEmail({ toEmail: input.workEmail, toName: input.fullName })
  } catch (error) {
    console.error("User brief-received email failed:", error)
  }
}
