// PlanKey is declared once, in plans.ts, and re-exported here so the nine
// existing importers of this module need no change.
export type { PlanKey } from "./plans.ts"

import type { PlanKey } from "./plans.ts"
import { NO_ENTITLEMENTS, type Entitlements } from "./addon-entitlements.ts"

const PLAN_RANK = { pulse: 0, core: 1, "core+": 2, expert: 3 } as const

export function planRank(plan: PlanKey): number {
  return PLAN_RANK[plan]
}

// These baselines ARE the "Up to N questions" promise on the pricing cards —
// Pulse sells 5, Core sells 7, and Core+/Expert inherit Core's line through
// "Everything in Core, plus:". The form renders exactly this many inputs with no
// way to add another, so a number lower than the copy is a customer who paid for
// questions they cannot enter. tests/content-pricing.test.mjs reads the counts
// back out of the pricing copy to keep the two from drifting again.
export function q6SlotCount(plan: PlanKey, ent: Entitlements = NO_ENTITLEMENTS): number {
  return (planRank(plan) >= 1 ? 7 : 5) + ent.extraQ6Slots
}

export type ResearchQuestionId =
  | "q1_challenge"
  | "q2_objectives"
  | "q3_category"
  | "q4_locations"
  | "q5_consumer"
  | "q5a_segmentation"
  | "q6_questions"
  | "q7_receipts"
  | "q8_competitors"
  | "q9_callWindows"
  | "q10_smartOffers"
  | "q11_other"

export type QuestionOption = {
  id: string
  label: string
  allowsFreeText?: boolean
}

export type ResearchQuestion = {
  id: ResearchQuestionId
  label: string
  helper?: string
  type: "textarea" | "multiselect" | "radio" | "repeatable" | "nestedGroup"
  minPlanRank: number
  required: "always" | "withinTier" | "never"
  options?: QuestionOption[]
}

// Minimum plan rank a question is visible at.
const MIN_RANK: Record<ResearchQuestionId, number> = {
  q1_challenge: 0,
  q2_objectives: 0,
  q3_category: 0,
  q4_locations: 0,
  q5_consumer: 0,
  q5a_segmentation: 2,
  q6_questions: 0,
  q7_receipts: 2,
  q8_competitors: 0,
  q9_callWindows: 2,
  q10_smartOffers: 3,
  q11_other: 0,
}

// An add-on can only ever ADD visibility. There is no path by which buying
// something removes a question the plan already includes.
//
// `required` counts as visibility on purpose: an entitlement that makes a
// question mandatory without also unlocking it would otherwise produce an
// unsubmittable form — the schema demands an answer the form never draws a field
// for, and the customer is hard-locked out of submitting. Requiredness therefore
// implies visibility here rather than being a cross-module invariant nobody
// enforces.
export function isVisible(
  id: ResearchQuestionId,
  plan: PlanKey,
  ent: Entitlements = NO_ENTITLEMENTS
): boolean {
  return (
    planRank(plan) >= MIN_RANK[id] ||
    ent.unlocks.includes(id) ||
    ent.required.includes(id)
  )
}

export const AGE_OPTIONS: QuestionOption[] = [
  { id: "18-24", label: "18–24" },
  { id: "25-34", label: "25–34" },
  { id: "35-44", label: "35–44" },
  { id: "45+", label: "45+" },
  { id: "all", label: "All" },
]

export const GENDER_OPTIONS: QuestionOption[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "all", label: "All" },
]

export const INCOME_OPTIONS: QuestionOption[] = [
  { id: "under_25k", label: "Under ₹25,000" },
  { id: "25k_50k", label: "₹25,000–50,000" },
  { id: "50k_1l", label: "₹50,000–1,00,000" },
  { id: "above_1l", label: "Above ₹1,00,000" },
  { id: "no_pref", label: "No preference" },
]

export const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  {
    id: "q1_challenge",
    label: "What is the primary business challenge you want this study to address?",
    helper:
      "The decision you need to make, the problem you are trying to solve, or the question you need answered. The more specific you are, the sharper the signal we collect.",
    type: "textarea",
    minPlanRank: 0,
    required: "always",
  },
  {
    id: "q2_objectives",
    label: "Which of these best describes your objective?",
    helper: "Select all that apply.",
    type: "multiselect",
    minPlanRank: 0,
    required: "always",
    options: [
      { id: "switch_brands", label: "Understand why consumers choose or switch brands in my category" },
      { id: "validate_launch", label: "Validate a new product, SKU, or pricing decision before launch" },
      { id: "expansion_markets", label: "Identify the right markets or cities for expansion" },
      { id: "repeat_loyalty", label: "Understand what drives repeat purchase and loyalty" },
      { id: "competitive_landscape", label: "Map the competitive landscape in my category" },
      { id: "something_else", label: "Something else", allowsFreeText: true },
    ],
  },
  {
    id: "q3_category",
    label: "Which category or product type would this intel be focused on?",
    helper:
      "For example: skincare serums, men's grooming, functional beverages, protein supplements, D2C apparel. Be as specific as possible.",
    type: "textarea",
    minPlanRank: 0,
    required: "always",
  },
  {
    id: "q4_locations",
    label: "Which locations should we collect consumer signals from?",
    helper: "Select all that apply.",
    type: "multiselect",
    minPlanRank: 0,
    required: "always",
    options: [
      { id: "pan_india", label: "Pan-India" },
      { id: "metro", label: "Metro cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata)" },
      { id: "tier2", label: "Tier 2 cities", allowsFreeText: true },
      { id: "tier3", label: "Tier 3 cities", allowsFreeText: true },
      { id: "specific_cities", label: "Specific cities", allowsFreeText: true },
      { id: "other_market", label: "Other market", allowsFreeText: true },
    ],
  },
  {
    id: "q5_consumer",
    label: "Who is your target consumer?",
    type: "nestedGroup",
    minPlanRank: 0,
    required: "always",
  },
  {
    id: "q5a_segmentation",
    label: "Any advanced segmentation requirements?",
    helper:
      "For example: skin concern, purchase frequency, brand affinity, channel preference, lifestyle indicators.",
    type: "textarea",
    minPlanRank: 2,
    required: "never",
  },
  {
    id: "q6_questions",
    label: "What questions do you want your consumers to answer?",
    helper: "List your questions below. Keep each one focused on a single decision.",
    type: "repeatable",
    minPlanRank: 0,
    required: "always",
  },
  {
    id: "q7_receipts",
    label: "Do you want consumers to submit purchase receipts or product images?",
    type: "radio",
    minPlanRank: 2,
    required: "withinTier",
    options: [
      { id: "yes", label: "Yes, please include receipt or image submissions" },
      { id: "no", label: "No, questions only" },
    ],
  },
  {
    id: "q8_competitors",
    label: "Are there specific competitor brands you want tracked or included in the consumer panel?",
    helper:
      "Optional. If you want us to recruit consumers of a specific competitor brand or include competitor comparison in the study, name them here.",
    type: "textarea",
    minPlanRank: 0,
    required: "never",
  },
  {
    id: "q9_callWindows",
    label: "Please suggest two or three windows for your expert call session.",
    helper:
      "Core+ includes one 45-minute session. Expert includes two 1-hour sessions. Your analyst will confirm the booking within 24 hours.",
    type: "textarea",
    minPlanRank: 2,
    required: "withinTier",
  },
  {
    id: "q10_smartOffers",
    label:
      "Do you want to activate in-app targeted brand vouchers and promotions via Altilos SmartOffers?",
    type: "nestedGroup",
    minPlanRank: 3,
    required: "withinTier",
    options: [
      { id: "yes", label: "Yes, include SmartOffers in my study" },
      { id: "no", label: "No, research only" },
    ],
  },
  {
    id: "q11_other",
    label: "Is there anything else the team should know before configuring your study?",
    helper:
      "Optional. Any brand guidelines, sensitivities, previous research findings, or context that would help us produce a sharper brief.",
    type: "textarea",
    minPlanRank: 0,
    required: "never",
  },
]

export function visibleResearchQuestions(
  plan: PlanKey,
  ent: Entitlements = NO_ENTITLEMENTS
): ResearchQuestion[] {
  return RESEARCH_QUESTIONS.filter((q) => isVisible(q.id, plan, ent))
}
