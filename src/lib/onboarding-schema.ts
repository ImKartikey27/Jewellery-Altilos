import { z } from "zod"

import { isValidCompanyWebsite } from "./url-validation.ts"
import { isVisible, type PlanKey } from "./onboarding-questions.ts"
import { NO_ENTITLEMENTS, type Entitlements } from "./addon-entitlements.ts"

const researchBriefSchema = z.object({
  q1_challenge: z.string().trim().min(1, "Please describe your primary challenge."),
  q2_objectives: z.object({
    selected: z.array(z.string()).min(1, "Select at least one objective."),
    other: z.string().trim().optional().nullable(),
  }),
  q3_category: z.string().trim().min(1, "Please name the category or product type."),
  q4_locations: z.object({
    selected: z.array(z.string()).min(1, "Select at least one location."),
    specifics: z.record(z.string(), z.string()).optional(),
  }),
  q5_consumer: z.object({
    ageRange: z.string().trim().min(1, "Select an age range."),
    gender: z.string().trim().min(1, "Select a gender."),
    income: z.string().trim().min(1, "Select an income band."),
  }),
  q5a_segmentation: z.string().trim().optional().nullable(),
  q6_questions: z
    .array(z.string().trim())
    .transform((arr) => arr.filter((s) => s.length > 0))
    .pipe(z.array(z.string()).min(1, "Add at least one question.")),
  q7_receipts: z.preprocess(
    (v) => (v === "" ? null : v),
    z.enum(["yes", "no"]).nullable().optional()
  ),
  q8_competitors: z.string().trim().optional().nullable(),
  q9_callWindows: z.string().trim().optional().nullable(),
  q10_smartOffers: z.preprocess(
    (v) =>
      v && typeof v === "object" && (v as { enabled?: unknown }).enabled === ""
        ? null
        : v,
    z
      .object({
        enabled: z.enum(["yes", "no"]),
        action: z.string().trim().optional().nullable(),
        offerType: z.string().trim().optional().nullable(),
        metrics: z.string().trim().optional().nullable(),
      })
      .optional()
      .nullable()
  ),
  q11_other: z.string().trim().optional().nullable(),
})

const companyWebsiteSchema = z
  .string()
  .trim()
  .refine(isValidCompanyWebsite, {
    message: "Company website must start with https://, http://, or www.",
  })

export function buildOnboardingSubmissionSchema(
  plan: PlanKey,
  ent: Entitlements = NO_ENTITLEMENTS
) {
  return z
    .object({
      token: z.string().min(20),
      fullName: z.string().trim().min(2),
      workEmail: z.string().trim().email(),
      jobTitle: z.string().trim().min(2),
      companyName: z
        .string()
        .trim()
        .min(2)
        .refine(
          (value) => !["no", "none", "na", "n/a", "null"].includes(value.toLowerCase()),
          { message: "Company name is required" }
        ),
      companyWebsite: companyWebsiteSchema.optional().or(z.literal("")),
      phoneNumber: z.string().trim().optional().or(z.literal("")),
      termsAccepted: z.literal(true),
      researchBrief: researchBriefSchema,
    })
    .superRefine((val, ctx) => {
      const brief = val.researchBrief
      const issue = (path: string | string[], message: string) =>
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["researchBrief", ...(Array.isArray(path) ? path : [path])],
          message,
        })

      // Forced is checked FIRST and swallows the visibility rule, so "forced
      // implies visible" needs no cross-module cooperation to hold. If the two
      // ran independently, a forces-without-unlocks entitlement would let a
      // payload that simply omits the field through: the visibility rule would
      // not fire below the rank gate, and the forced rule would skip an absent
      // value. The paid-for answer would be stored as null and silently lost.
      // Exactly one issue is still produced per path.
      if (ent.forced.q7_receipts === "yes") {
        if (brief.q7_receipts !== "yes") {
          issue("q7_receipts", "Receipt and image collection is included in your order.")
        }
      } else if (isVisible("q7_receipts", plan, ent) && !brief.q7_receipts) {
        issue("q7_receipts", "Please choose whether to include receipts or images.")
      }

      // One condition, not two: the expert-call add-ons set BOTH `unlocks` and
      // `requires` on q9, so testing them separately would report the same
      // message twice for the same blank field.
      //
      // The `required` half is redundant while isVisible folds requiredness into
      // visibility, and is kept as defence in depth: it means this rule does not
      // silently stop enforcing a paid-for question if that policy ever moves.
      const q9Needed =
        isVisible("q9_callWindows", plan, ent) || ent.required.includes("q9_callWindows")
      if (q9Needed && !(brief.q9_callWindows ?? "").trim()) {
        issue("q9_callWindows", "Please suggest two or three call windows.")
      }

      if (
        ent.required.includes("q8_competitors") &&
        !(brief.q8_competitors ?? "").trim()
      ) {
        issue("q8_competitors", "Please name the competitor brands included in your order.")
      }

      // Same precedence as q7, for the same reason.
      if (ent.forced.q10_smartOffers === "yes") {
        if (brief.q10_smartOffers?.enabled !== "yes") {
          issue("q10_smartOffers", "The SmartOffers pilot is included in your order.")
        }
        // A purchased pilot with a blank brief leaves ops nothing to run. These
        // three inputs render whenever `enabled === "yes"`, which forcing
        // guarantees, so requiring them cannot trap a customer in a field they
        // were never shown. Each reports on its own path so the form can mark
        // the offending input rather than the group.
        const smartOfferFollowUps = [
          ["action", "Please describe the action you want SmartOffers to drive."],
          ["offerType", "Please describe the offer type for your SmartOffers pilot."],
          ["metrics", "Please name the metrics your SmartOffers pilot should report."],
        ] as const
        for (const [field, message] of smartOfferFollowUps) {
          if (!(brief.q10_smartOffers?.[field] ?? "").trim()) {
            issue(["q10_smartOffers", field], message)
          }
        }
      } else if (isVisible("q10_smartOffers", plan, ent) && !brief.q10_smartOffers?.enabled) {
        issue("q10_smartOffers", "Please choose whether to activate SmartOffers.")
      }
    })
}

export type OnboardingSubmissionInput = z.infer<
  ReturnType<typeof buildOnboardingSubmissionSchema>
>
export type ResearchBrief = z.infer<typeof researchBriefSchema>
