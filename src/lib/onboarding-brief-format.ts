import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  INCOME_OPTIONS,
  RESEARCH_QUESTIONS,
  isVisible,
  type PlanKey,
} from "./onboarding-questions.ts"
import type { ResearchBrief } from "./onboarding-schema.ts"
import { NO_ENTITLEMENTS, type Entitlements } from "./addon-entitlements.ts"

export type BriefSection = { label: string; value: string }

function labelFor(id: string): string {
  return RESEARCH_QUESTIONS.find((q) => q.id === id)?.label ?? id
}

function optionLabel(questionId: string, optionId: string): string {
  const q = RESEARCH_QUESTIONS.find((x) => x.id === questionId)
  return q?.options?.find((o) => o.id === optionId)?.label ?? optionId
}

function lookup(options: { id: string; label: string }[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id
}

export function formatBriefSections(
  brief: ResearchBrief,
  plan: PlanKey,
  ent: Entitlements = NO_ENTITLEMENTS
): BriefSection[] {
  const sections: BriefSection[] = []
  const push = (id: string, value: string | null | undefined) => {
    if (value && value.trim()) sections.push({ label: labelFor(id), value: value.trim() })
  }

  push("q1_challenge", brief.q1_challenge)

  // Q2 objectives
  const objectives = brief.q2_objectives.selected.map((id) => {
    if (id === "something_else" && brief.q2_objectives.other) {
      return `Something else: ${brief.q2_objectives.other}`
    }
    return optionLabel("q2_objectives", id)
  })
  if (objectives.length) sections.push({ label: labelFor("q2_objectives"), value: objectives.join("; ") })

  push("q3_category", brief.q3_category)

  // Q4 locations with specify text
  const locations = brief.q4_locations.selected.map((id) => {
    const spec = brief.q4_locations.specifics?.[id]
    const base = optionLabel("q4_locations", id)
    return spec ? `${base} (${spec})` : base
  })
  if (locations.length) sections.push({ label: labelFor("q4_locations"), value: locations.join("; ") })

  // Q5 consumer
  const consumer = [
    `Age: ${lookup(AGE_OPTIONS, brief.q5_consumer.ageRange)}`,
    `Gender: ${lookup(GENDER_OPTIONS, brief.q5_consumer.gender)}`,
    `Income: ${lookup(INCOME_OPTIONS, brief.q5_consumer.income)}`,
  ].join(" · ")
  sections.push({ label: labelFor("q5_consumer"), value: consumer })

  if (isVisible("q5a_segmentation", plan, ent)) push("q5a_segmentation", brief.q5a_segmentation)

  if (brief.q6_questions.length) {
    sections.push({
      label: labelFor("q6_questions"),
      value: brief.q6_questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
    })
  }

  if (isVisible("q7_receipts", plan, ent) && brief.q7_receipts) {
    sections.push({
      label: labelFor("q7_receipts"),
      value: optionLabel("q7_receipts", brief.q7_receipts),
    })
  }

  push("q8_competitors", brief.q8_competitors)

  if (isVisible("q9_callWindows", plan, ent)) push("q9_callWindows", brief.q9_callWindows)

  if (isVisible("q10_smartOffers", plan, ent) && brief.q10_smartOffers) {
    const so = brief.q10_smartOffers
    const parts = [optionLabel("q10_smartOffers", so.enabled)]
    if (so.enabled === "yes") {
      if (so.action) parts.push(`Action: ${so.action}`)
      if (so.offerType) parts.push(`Offer type: ${so.offerType}`)
      if (so.metrics) parts.push(`Metrics: ${so.metrics}`)
    }
    sections.push({ label: labelFor("q10_smartOffers"), value: parts.join(" — ") })
  }

  push("q11_other", brief.q11_other)

  return sections
}

export function renderBriefText(
  brief: ResearchBrief,
  plan: PlanKey,
  ent: Entitlements = NO_ENTITLEMENTS
): string {
  return formatBriefSections(brief, plan, ent)
    .map((s) => `${s.label}\n${s.value}`)
    .join("\n\n")
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function renderBriefHtml(
  brief: ResearchBrief,
  plan: PlanKey,
  ent: Entitlements = NO_ENTITLEMENTS
): string {
  return formatBriefSections(brief, plan, ent)
    .map(
      (s) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;">` +
        `<div style="font-size:13px;color:#6b7280;margin-bottom:4px;">${escapeHtml(s.label)}</div>` +
        `<div style="font-size:15px;color:#111827;white-space:pre-line;">${escapeHtml(s.value)}</div>` +
        `</td></tr>`
    )
    .join("")
}
