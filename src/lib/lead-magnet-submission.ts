import "server-only"

import { validateLeadMagnetSubmissionInput } from "@/lib/lead-magnet-validation"
import { sendLeadMagnetEmail } from "@/lib/mailchimp-transactional"
import { syncLeadMagnetToPipedrive } from "@/lib/pipedrive"
import { prisma } from "@/lib/prisma"

export type LeadMagnetSubmissionInput = {
  email: string
  companyName?: string
  category?: string
  source?: string
}

export type LeadMagnetSubmissionResult =
  | { status: "submitted" }
  | { status: "already_submitted" }
  | { status: "invalid_email" }
  | { status: "missing_company" }

export async function submitLeadMagnet(
  input: LeadMagnetSubmissionInput
): Promise<LeadMagnetSubmissionResult> {
  const validation = validateLeadMagnetSubmissionInput(input)
  if (validation.status !== "valid") {
    return { status: validation.status }
  }

  const name = null
  const { email, companyName, category, source } = validation

  const lead = await prisma.lead.upsert({
    where: { email },
    update: {
      name,
      companyName,
      payload: { email, name, companyName, category, source },
    },
    create: {
      email,
      name,
      companyName,
      source,
      payload: { email, name, companyName, category, source },
    },
  })

  if (lead.reportSentAt) {
    return { status: "already_submitted" }
  }

  try {
    const { personId } = await syncLeadMagnetToPipedrive({
      lead: { email: lead.email, name: lead.name, companyName: lead.companyName },
    })
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        pipedrivePersonId: personId,
        pipedriveSyncedAt: new Date(),
        pipedriveSyncError: null,
      },
    })
  } catch (error) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { pipedriveSyncError: String(error) },
    })
  }

  try {
    await sendLeadMagnetEmail({ toEmail: lead.email, toName: lead.name })
    await prisma.lead.update({
      where: { id: lead.id },
      data: { reportSentAt: new Date(), reportSendError: null },
    })
  } catch (error) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { reportSendError: String(error) },
    })
  }

  return { status: "submitted" }
}
