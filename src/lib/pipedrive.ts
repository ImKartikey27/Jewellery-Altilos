import "server-only"

import { env } from "@/lib/env"
import type { OnboardingSubmissionInput } from "@/lib/onboarding-schema"
import type { PlanKey } from "@/lib/onboarding-questions"
import { renderBriefText } from "@/lib/onboarding-brief-format"
import { buildPersonCustomFields } from "@/lib/pipedrive-payload"
import { summarizeOrderAddOns } from "@/lib/addon-reconcile"
import { entitlementsFromOrderAddOns } from "@/lib/addon-entitlements"
import { formatMinor } from "@/lib/money"

type PipedriveOrgResponse = {
  data: {
    id: number
  }
}

type PipedriveOrgSearchResponse = {
  data: {
    items: Array<{
      item: {
        id: number
        name: string
      }
    }>
  }
}

type PipedrivePersonResponse = {
  data: {
    id: number
  }
}

type PipedriveDealResponse = {
  data: {
    id: number
  }
}

export async function syncOnboardingSubmissionToPipedrive({
  submission,
  order,
  plan,
}: {
  submission: OnboardingSubmissionInput
  order: {
    id: string
    plan: string
    amountCents: number
    currency: string
    addOns?: unknown
    stripeSessionId: string | null
    stripePaymentIntentId: string | null
  }
  plan: PlanKey
}) {
  if (!env.PIPEDRIVE_API_TOKEN) {
    throw new Error("Pipedrive is not configured")
  }

  const orgId = await findOrCreateOrganization(submission.companyName)

  const personCustomFields = buildPersonCustomFields({
    leadSourceKey: env.PIPEDRIVE_LEAD_SOURCE_FIELD_KEY,
    secondaryLeadSourceKey: env.PIPEDRIVE_SECONDARY_LEAD_SOURCE_FIELD_KEY,
    jobTitleKey: env.PIPEDRIVE_JOB_TITLE_FIELD_KEY,
    websiteKey: env.PIPEDRIVE_WEBSITE_FIELD_KEY,
    jobTitle: submission.jobTitle,
    website: submission.companyWebsite,
  })

  const person = await pipedriveFetch<PipedrivePersonResponse>("/persons", {
    method: "POST",
    body: JSON.stringify({
      name: submission.fullName,
      emails: [{ value: submission.workEmail, primary: true }],
      phones: submission.phoneNumber
        ? [{ value: submission.phoneNumber, primary: true }]
        : undefined,
      org_id: orgId,
      owner_id: env.PIPEDRIVE_DEFAULT_OWNER_ID,
      custom_fields: Object.keys(personCustomFields).length > 0 ? personCustomFields : undefined,
    }),
  })

  // Add-ons are only ever shown inside Stripe checkout, never on the site, so
  // the deal note is where sales first learns what was bought.
  const orderAddOns = summarizeOrderAddOns(order.addOns)
  // Without this the brief silently drops any answer that only an add-on
  // unlocked — the customer fills it in and sales never sees it.
  const entitlements = entitlementsFromOrderAddOns(order.addOns)

  const context = [
    `Order ID: ${order.id}`,
    `Stripe session: ${order.stripeSessionId ?? "not available"}`,
    `Payment intent: ${order.stripePaymentIntentId ?? "not available"}`,
    `Plan: ${order.plan}`,
    orderAddOns.length > 0
      ? `Add-ons: ${orderAddOns
          .map(
            (addOn) =>
              `${addOn.label}${addOn.quantity > 1 ? ` x${addOn.quantity}` : ""} (${formatMinor(
                addOn.amountMinor,
                order.currency
              )})`
          )
          .join(", ")}`
      : null,
    `Full name: ${submission.fullName}`,
    `Work email: ${submission.workEmail}`,
    `Job title: ${submission.jobTitle}`,
    `Company: ${submission.companyName}`,
    submission.companyWebsite ? `Website: ${submission.companyWebsite}` : null,
    submission.phoneNumber ? `Phone: ${submission.phoneNumber}` : null,
    "",
    renderBriefText(submission.researchBrief, plan, entitlements),
  ]
    .filter((line) => line !== null)
    .join("\n")

  const dealCustomFields: Record<string, string> = {}
  if (env.PIPEDRIVE_ONBOARDING_CONTEXT_FIELD_KEY) {
    dealCustomFields[env.PIPEDRIVE_ONBOARDING_CONTEXT_FIELD_KEY] = context
  }

  const deal = await pipedriveFetch<PipedriveDealResponse>("/deals", {
    method: "POST",
    body: JSON.stringify({
      title: `Altilos ${order.plan} onboarding - ${submission.fullName}`,
      person_id: person.data.id,
      org_id: orgId,
      value: order.amountCents / 100,
      currency: order.currency.toUpperCase(),
      status: "won",
      owner_id: env.PIPEDRIVE_DEFAULT_OWNER_ID,
      custom_fields: Object.keys(dealCustomFields).length > 0 ? dealCustomFields : undefined,
    }),
  })

  return { personId: person.data.id, dealId: deal.data.id }
}

export async function syncLeadMagnetToPipedrive({
  lead,
}: {
  lead: {
    email: string
    name: string | null
    companyName: string | null
  }
}) {
  if (!env.PIPEDRIVE_API_TOKEN) {
    throw new Error("Pipedrive is not configured")
  }

  const orgId = lead.companyName
    ? await findOrCreateOrganization(lead.companyName)
    : undefined

  const labelIds = env.PIPEDRIVE_LEAD_MAGNET_LABEL_ID
    ? [env.PIPEDRIVE_LEAD_MAGNET_LABEL_ID]
    : undefined

  const customFields: Record<string, string> = {}
  if (env.PIPEDRIVE_LEAD_SOURCE_FIELD_KEY) {
    customFields[env.PIPEDRIVE_LEAD_SOURCE_FIELD_KEY] = "Jewellery Altilos"
  }
  if (env.PIPEDRIVE_SECONDARY_LEAD_SOURCE_FIELD_KEY) {
    customFields[env.PIPEDRIVE_SECONDARY_LEAD_SOURCE_FIELD_KEY] = "D2C Jewellery"
  }
  if (env.PIPEDRIVE_LEAD_STATUS_FIELD_KEY) {
    customFields[env.PIPEDRIVE_LEAD_STATUS_FIELD_KEY] = "51"
  }

  const person = await pipedriveFetch<PipedrivePersonResponse>("/persons", {
    method: "POST",
    body: JSON.stringify({
      name: lead.email,
      emails: [{ value: lead.email, primary: true }],
      org_id: orgId,
      owner_id: env.PIPEDRIVE_DEFAULT_OWNER_ID,
      label_ids: labelIds,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
    }),
  })

  return { personId: person.data.id }
}

async function findOrCreateOrganization(name: string): Promise<number> {
  const search = await pipedriveFetch<PipedriveOrgSearchResponse>(
    `/organizations/search?term=${encodeURIComponent(name)}&fields=name&exact_match=false`,
    { method: "GET", body: undefined }
  )

  const normalizedName = name.toLowerCase().trim()
  const existing = search.data.items.find(
    ({ item }) => item.name.toLowerCase().trim() === normalizedName
  )

  if (existing) return existing.item.id

  const created = await pipedriveFetch<PipedriveOrgResponse>("/organizations", {
    method: "POST",
    body: JSON.stringify({
      name,
      owner_id: env.PIPEDRIVE_DEFAULT_OWNER_ID,
    }),
  })

  return created.data.id
}

async function pipedriveFetch<T>(path: string, init: RequestInit): Promise<T> {
  const [pathname, qs] = path.split("?")
  const url = new URL(`${env.PIPEDRIVE_API_BASE_URL}${pathname}`)
  if (qs) {
    for (const [k, v] of new URLSearchParams(qs)) url.searchParams.set(k, v)
  }
  url.searchParams.set("api_token", env.PIPEDRIVE_API_TOKEN!)

  const headers: Record<string, string> = { ...init.headers as Record<string, string> }
  if (init.body) headers["Content-Type"] = "application/json"

  const response = await fetch(url, { ...init, headers })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Pipedrive request failed: ${response.status} ${path} — ${body}`
    )
  }

  return (await response.json()) as T
}
