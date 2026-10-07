// Maps the add-ons a customer actually bought onto the shape of their onboarding
// form. Pure — test-reachable, so no `server-only` and no `@/`.
//
// This is the ONLY place that knows "buying X changes question Y". The three
// consumers (onboarding-questions, onboarding-schema, onboarding-brief-format)
// all read the same computed Entitlements value, which is what stops question
// visibility, server validation and the emailed brief from drifting apart. A
// question that is rendered but not validated, or validated but not emailed, is
// silent data loss — see tests/onboarding-entitlement-agreement.test.mjs.
//
// IMPORT CYCLE: onboarding-questions.ts imports NO_ENTITLEMENTS from here as a
// VALUE. The ResearchQuestionId import below must therefore stay `import type`,
// so --experimental-strip-types erases it and no runtime cycle exists.

import { ADD_ONS, addOnBySlug, isAddOnSlug, type AddOnSlug } from "./addon-catalog.ts"
import { summarizeOrderAddOns } from "./addon-reconcile.ts"
import type { ResearchQuestionId } from "./onboarding-questions.ts"

export type AddOnEffect = {
  // Make a rank-gated question visible below its normal tier.
  unlocks?: readonly ResearchQuestionId[]
  // The customer answered this yes/no question with their wallet. The form locks
  // the control and the schema rejects any other answer.
  forces?: Readonly<{ q7_receipts?: "yes"; q10_smartOffers?: "yes" }>
  // Question is already visible, but this purchase makes answering it mandatory.
  requires?: readonly ResearchQuestionId[]
  // Extra Q6 question slots. No add-on grants any today; the field exists so a
  // future "extra questions" add-on is a catalog line plus one entry here.
  extraQ6Slots?: number
  // Attach this add-on's own catalog label as helper copy under these questions.
  // Referencing the label rather than duplicating a string keeps checkout copy
  // and form copy from diverging.
  notes?: readonly ResearchQuestionId[]
}

// A FULL Record, deliberately not Partial: adding a line to ADD_ONS breaks the
// build until someone decides what it does to the form. `{}` is a valid answer.
const EFFECTS_TABLE: Record<AddOnSlug, AddOnEffect> = {
  // Pulse
  "pulse.responses_50": {},
  "pulse.competitor_2": { requires: ["q8_competitors"], notes: ["q8_competitors"] },
  "pulse.expert_call_30": { unlocks: ["q9_callWindows"], requires: ["q9_callWindows"] },
  "pulse.city_2": { notes: ["q4_locations"] },
  "pulse.receipt_images": { unlocks: ["q7_receipts"], forces: { q7_receipts: "yes" } },
  "pulse.priority_3day": {},

  // Core
  "core.responses_100": {},
  "core.competitors_4": { requires: ["q8_competitors"], notes: ["q8_competitors"] },
  "core.expert_call_45": { unlocks: ["q9_callWindows"], requires: ["q9_callWindows"] },
  "core.city_3": { notes: ["q4_locations"] },
  "core.receipt_images": { unlocks: ["q7_receipts"], forces: { q7_receipts: "yes" } },
  "core.priority_3day": {},

  // Core+ — Q5a/Q7/Q9 are already visible at this rank, so these only add
  // requiredness and copy. SmartOffers is the one genuine unlock.
  "core_plus.responses_150": {},
  "core_plus.expert_session_2": { requires: ["q9_callWindows"], notes: ["q9_callWindows"] },
  "core_plus.smartoffers_pilot": {
    unlocks: ["q10_smartOffers"],
    forces: { q10_smartOffers: "yes" },
  },
  "core_plus.city_extra": { notes: ["q4_locations"] },
  "core_plus.competitors_highcap": { requires: ["q8_competitors"], notes: ["q8_competitors"] },
  "core_plus.priority_3day": {},
}

// Frozen through: EFFECTS is exported, and an importer able to rewrite an entry
// would silently change the form rules for the whole process.
for (const effect of Object.values(EFFECTS_TABLE)) {
  if (effect.unlocks) Object.freeze(effect.unlocks)
  if (effect.requires) Object.freeze(effect.requires)
  if (effect.notes) Object.freeze(effect.notes)
  if (effect.forces) Object.freeze(effect.forces)
  Object.freeze(effect)
}

export const EFFECTS: Readonly<Record<AddOnSlug, AddOnEffect>> = Object.freeze(EFFECTS_TABLE)

// Readonly all the way down, matching the frozen runtime value. Without the
// wrapper `ent.extraQ6Slots = 9` compiles clean and throws at runtime — a trap
// laid for the seven consumers written against this type in later tasks.
export type Entitlements = Readonly<{
  unlocks: readonly ResearchQuestionId[]
  forced: Readonly<{ q7_receipts?: "yes"; q10_smartOffers?: "yes" }>
  required: readonly ResearchQuestionId[]
  extraQ6Slots: number
  notes: Readonly<Partial<Record<ResearchQuestionId, readonly string[]>>>
}>

// The fail-closed value. Every consumer defaults to it, so "no add-on data" and
// "add-on data we cannot read" both produce exactly the plan-only form that
// shipped before this feature existed.
export const NO_ENTITLEMENTS: Entitlements = Object.freeze({
  unlocks: Object.freeze([]) as readonly ResearchQuestionId[],
  forced: Object.freeze({}),
  required: Object.freeze([]) as readonly ResearchQuestionId[],
  extraQ6Slots: 0,
  notes: Object.freeze({}),
})

// `effects` is a dependency-injection seam, the same pattern
// `buildOptionalItems(plan, priceMap)` uses in addon-optional-items.ts: it lets
// tests exercise accumulator behaviour (extraQ6Slots summation, duplicate
// handling) that no entry in the real catalog triggers today. Production callers
// pass nothing and get EFFECTS.
export function entitlementsFromSlugs(
  slugs: readonly unknown[],
  effects: Readonly<Partial<Record<AddOnSlug, AddOnEffect>>> = EFFECTS
): Entitlements {
  const unique = [...new Set(slugs)]

  const unlocks = new Set<ResearchQuestionId>()
  const required = new Set<ResearchQuestionId>()
  const forced: { q7_receipts?: "yes"; q10_smartOffers?: "yes" } = {}
  const notes: Partial<Record<ResearchQuestionId, string[]>> = {}
  let extraQ6Slots = 0

  for (const slug of unique) {
    if (!isAddOnSlug(slug)) continue
    // EFFECTS covers every catalog slug, but an injected table need not. The
    // Partial in the signature makes this guard compulsory rather than
    // conventional: without it the four `effect.` reads below are TS18048.
    const effect = effects[slug]
    if (!effect) continue

    for (const id of effect.unlocks ?? []) unlocks.add(id)
    for (const id of effect.requires ?? []) required.add(id)
    if (effect.forces?.q7_receipts) forced.q7_receipts = "yes"
    if (effect.forces?.q10_smartOffers) forced.q10_smartOffers = "yes"
    extraQ6Slots += effect.extraQ6Slots ?? 0

    for (const id of effect.notes ?? []) {
      const label = addOnBySlug(slug)?.label
      if (!label) continue
      notes[id] = [...(notes[id] ?? []), label]
    }
  }

  // Returning the shared frozen constant — by identity, which the tests assert —
  // keeps "bought only inert add-ons" and "bought nothing" indistinguishable to
  // every consumer.
  const hasEffect =
    unlocks.size > 0 ||
    required.size > 0 ||
    extraQ6Slots > 0 ||
    Object.keys(forced).length > 0 ||
    Object.keys(notes).length > 0
  if (!hasEffect) return NO_ENTITLEMENTS

  // Frozen as deeply as NO_ENTITLEMENTS is, so a consumer that mutates an
  // Entitlements value fails the same way on both paths instead of corrupting
  // shared state only when add-ons happen to be present.
  return Object.freeze({
    unlocks: Object.freeze([...unlocks]) as readonly ResearchQuestionId[],
    forced: Object.freeze(forced),
    required: Object.freeze([...required]) as readonly ResearchQuestionId[],
    extraQ6Slots,
    notes: Object.freeze(
      Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, Object.freeze(v)]))
    ),
  })
}

// Reads the stored Order.addOns JSON back into slugs. Deliberately delegates the
// defensive parsing to summarizeOrderAddOns so there is one reader of that blob.
export function addOnSlugsFromOrderAddOns(value: unknown): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return []

  // "amount_total_only" means the line-items fetch failed at payment: the total
  // is trustworthy, the breakdown is not. An empty or partial items list here
  // would understate what the customer bought, so treat it as no data at all
  // and let the form fall back to plan-only.
  if ((value as { source?: unknown }).source === "amount_total_only") return []

  return summarizeOrderAddOns(value)
    .map((item) => item.slug)
    .filter((slug) => slug.length > 0)
}

export function entitlementsFromOrderAddOns(value: unknown): Entitlements {
  return entitlementsFromSlugs(addOnSlugsFromOrderAddOns(value))
}

// Exported for the catalog coverage guard in tests/addon-entitlements.test.mjs.
export const ALL_ADD_ON_SLUGS: readonly AddOnSlug[] = ADD_ONS.map((a) => a.slug)
