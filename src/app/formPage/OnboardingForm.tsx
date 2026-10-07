"use client"

import { useState } from "react"

import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  INCOME_OPTIONS,
  q6SlotCount,
  visibleResearchQuestions,
  type PlanKey,
  type ResearchQuestionId,
} from "@/lib/onboarding-questions"
import { entitlementsFromSlugs } from "@/lib/addon-entitlements"
import { SubmitButton } from "./SubmitButton"

type Defaults = {
  fullName: string
  workEmail: string
  companyName: string
  phoneNumber: string
}

type BriefState = {
  q1_challenge: string
  q2_objectives: { selected: string[]; other: string }
  q3_category: string
  q4_locations: { selected: string[]; specifics: Record<string, string> }
  q5_consumer: { ageRange: string; gender: string; income: string }
  q5a_segmentation: string
  q6_questions: string[]
  q7_receipts: "" | "yes" | "no"
  q8_competitors: string
  q9_callWindows: string
  q10_smartOffers: { enabled: "" | "yes" | "no"; action: string; offerType: string; metrics: string }
  q11_other: string
}

export function OnboardingForm({
  token,
  plan,
  addOnSlugs,
  defaults,
  action,
  errorMessage,
}: {
  token: string
  plan: PlanKey
  addOnSlugs: string[]
  defaults: Defaults
  action: (formData: FormData) => void | Promise<void>
  errorMessage: string | null
}) {
  // Entitlements are re-derived here from plain slugs because a Set cannot cross
  // the RSC boundary. This copy drives presentation ONLY — the server derives its
  // own from the database when validating the submission.
  const ent = entitlementsFromSlugs(addOnSlugs)
  const slots = q6SlotCount(plan, ent)
  const questions = visibleResearchQuestions(plan, ent)

  const [brief, setBrief] = useState<BriefState>({
    q1_challenge: "",
    q2_objectives: { selected: [], other: "" },
    q3_category: "",
    q4_locations: { selected: [], specifics: {} },
    q5_consumer: { ageRange: "", gender: "", income: "" },
    q5a_segmentation: "",
    q6_questions: Array.from({ length: slots }, () => ""),
    q7_receipts: ent.forced.q7_receipts ?? "",
    q8_competitors: "",
    q9_callWindows: "",
    q10_smartOffers: {
      enabled: ent.forced.q10_smartOffers ?? "",
      action: "",
      offerType: "",
      metrics: "",
    },
    q11_other: "",
  })

  // Normalize unselected enum fields: the schema's z.enum rejects "", and
  // Q7/Q10 are invisible below their tiers, so send null when nothing is chosen.
  const serialized = JSON.stringify({
    ...brief,
    q7_receipts: brief.q7_receipts || null,
    q10_smartOffers: brief.q10_smartOffers.enabled ? brief.q10_smartOffers : null,
  })

  const inputClass =
    "mt-2 w-full border border-[#6f4b38]/80 bg-[#202020] px-4 py-3 font-inter text-base text-white outline-none focus:border-[#f97316]"
  const labelClass = "block"
  const labelText = "font-poppins text-sm font-medium tracking-wide text-[#e5c8b8]"
  const helperText = "mt-1 block font-inter text-xs text-[#b79c8c]"
  const noteText = "mt-1 block font-inter text-xs text-[#f9a05e]"

  const notesFor = (id: ResearchQuestionId) => {
    const notes = ent.notes[id]
    if (!notes || notes.length === 0) return null
    return (
      <span className={noteText}>Your order includes: {notes.join("; ")}</span>
    )
  }

  // An add-on made this question mandatory. The server rejects a blank answer,
  // and its only feedback is a banner that never names the field — so the form
  // has to block at the field itself.
  const isAddOnRequired = (id: ResearchQuestionId) => ent.required.includes(id)

  // Q9 is visible to this customer ONLY because an expert-call add-on unlocked
  // it, so the stored helper — which names the Core+ and Expert tiers — would
  // describe a plan they did not buy.
  const isAddOnUnlocked = (id: ResearchQuestionId) => ent.unlocks.includes(id)

  // Replacement helper copy for questions whose stored helper contradicts what
  // the customer actually bought. q8's stored copy opens with "Optional.", which
  // is a flat lie once a competitor add-on makes it blocking. The add-on's own
  // name is already on screen via notesFor, so this copy does not repeat it.
  const ADD_ON_HELPER: Partial<Record<ResearchQuestionId, string>> = {
    q8_competitors:
      "Your order covers competitor tracking, so we need the brand names to set up your panel. Name the competitor brands you want tracked or compared.",
    q9_callWindows:
      "Your order includes an expert call. Suggest two or three windows that suit you and your analyst will confirm the booking within 24 hours.",
  }

  const helperFor = (id: ResearchQuestionId, stored: string | undefined) => {
    if (isAddOnRequired(id) || isAddOnUnlocked(id)) return ADD_ON_HELPER[id] ?? stored
    return stored
  }

  const requiredMarker = <span className="text-[#f97316]"> (required)</span>

  // Under a forced Q10 the schema requires all three follow-ups, each on its own
  // path, so the placeholders must not read as invitations to skip them.
  const q10Forced = ent.forced.q10_smartOffers === "yes"
  const q10RequiredSuffix = q10Forced ? " (required)" : ""

  return (
    <form action={action} className="scroll-mt-10 mx-auto mt-10 max-w-3xl space-y-8">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="researchBrief" value={serialized} />

      {errorMessage && (
        <p className="text-center font-inter text-sm text-[#fb861c]">{errorMessage}</p>
      )}

      {/* Contact Details */}
      <fieldset className="space-y-5 rounded-lg border border-[#6f4b38]/80 bg-black/55 p-6">
        <legend className="font-hankenGrotesk text-2xl text-white">Contact Details</legend>
        <label className={labelClass}>
          <span className={labelText}>Full Name</span>
          <input name="fullName" required defaultValue={defaults.fullName} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelText}>Preferred Email</span>
          <input name="workEmail" type="email" required defaultValue={defaults.workEmail} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelText}>Designation</span>
          <input name="jobTitle" required placeholder="Your role or job title" className={inputClass} />
        </label>
      </fieldset>

      {/* Company Context */}
      <fieldset className="space-y-5 rounded-lg border border-[#6f4b38]/80 bg-black/55 p-6">
        <legend className="font-hankenGrotesk text-2xl text-white">Company Context</legend>
        <label className={labelClass}>
          <span className={labelText}>Company Name</span>
          <input name="companyName" required defaultValue={defaults.companyName} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelText}>Company Website <span className="text-[#b79c8c]">(optional)</span></span>
          <input name="companyWebsite" placeholder="https://company.com" className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelText}>Phone Number <span className="text-[#b79c8c]">(optional)</span></span>
          <input name="phoneNumber" type="tel" defaultValue={defaults.phoneNumber} className={inputClass} />
        </label>
      </fieldset>

      {/* Research Brief */}
      <fieldset className="space-y-8 rounded-lg border border-[#6f4b38]/80 bg-black/55 p-6">
        <legend className="font-hankenGrotesk text-2xl text-white">Research Brief</legend>

        {questions.map((q) => {
          if (q.id === "q1_challenge" || q.id === "q3_category" || q.id === "q8_competitors" ||
              q.id === "q11_other" || q.id === "q5a_segmentation" || q.id === "q9_callWindows") {
            const key = q.id as keyof BriefState
            const addOnRequired = isAddOnRequired(q.id)
            const helper = helperFor(q.id, q.helper)
            return (
              <label key={q.id} className={labelClass}>
                <span className={labelText}>
                  {q.label}
                  {addOnRequired && requiredMarker}
                </span>
                {helper && <span className={helperText}>{helper}</span>}
                {notesFor(q.id)}
                <textarea
                  rows={3}
                  required={addOnRequired}
                  className={inputClass}
                  value={brief[key] as string}
                  onChange={(e) => setBrief((b) => ({ ...b, [q.id]: e.target.value }))}
                />
              </label>
            )
          }

          if (q.id === "q2_objectives") {
            return (
              <div key={q.id}>
                <span className={labelText}>{q.label}</span>
                {q.helper && <span className={helperText}>{q.helper}</span>}
                {notesFor(q.id)}
                <div className="mt-2 space-y-2">
                  {q.options!.map((opt) => {
                    const checked = brief.q2_objectives.selected.includes(opt.id)
                    return (
                      <div key={opt.id}>
                        <label className="flex items-start gap-2 font-inter text-sm text-white">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setBrief((b) => {
                                const selected = e.target.checked
                                  ? [...b.q2_objectives.selected, opt.id]
                                  : b.q2_objectives.selected.filter((s) => s !== opt.id)
                                return { ...b, q2_objectives: { ...b.q2_objectives, selected } }
                              })
                            }
                          />
                          <span>{opt.label}</span>
                        </label>
                        {opt.allowsFreeText && checked && (
                          <input
                            className={inputClass}
                            placeholder="Please describe"
                            value={brief.q2_objectives.other}
                            onChange={(e) =>
                              setBrief((b) => ({ ...b, q2_objectives: { ...b.q2_objectives, other: e.target.value } }))
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }

          if (q.id === "q4_locations") {
            return (
              <div key={q.id}>
                <span className={labelText}>{q.label}</span>
                {q.helper && <span className={helperText}>{q.helper}</span>}
                {notesFor(q.id)}
                <div className="mt-2 space-y-2">
                  {q.options!.map((opt) => {
                    const checked = brief.q4_locations.selected.includes(opt.id)
                    return (
                      <div key={opt.id}>
                        <label className="flex items-start gap-2 font-inter text-sm text-white">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setBrief((b) => {
                                const selected = e.target.checked
                                  ? [...b.q4_locations.selected, opt.id]
                                  : b.q4_locations.selected.filter((s) => s !== opt.id)
                                return { ...b, q4_locations: { ...b.q4_locations, selected } }
                              })
                            }
                          />
                          <span>{opt.label}</span>
                        </label>
                        {opt.allowsFreeText && checked && (
                          <input
                            className={inputClass}
                            placeholder="Please specify"
                            value={brief.q4_locations.specifics[opt.id] ?? ""}
                            onChange={(e) =>
                              setBrief((b) => ({
                                ...b,
                                q4_locations: {
                                  ...b.q4_locations,
                                  specifics: { ...b.q4_locations.specifics, [opt.id]: e.target.value },
                                },
                              }))
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }

          if (q.id === "q5_consumer") {
            const groups: Array<[keyof BriefState["q5_consumer"], string, typeof AGE_OPTIONS]> = [
              ["ageRange", "Age range", AGE_OPTIONS],
              ["gender", "Gender", GENDER_OPTIONS],
              ["income", "Monthly household income", INCOME_OPTIONS],
            ]
            return (
              <div key={q.id}>
                <span className={labelText}>{q.label}</span>
                {notesFor(q.id)}
                <div className="mt-3 space-y-4">
                  {groups.map(([field, title, options]) => (
                    <div key={field}>
                      <span className="font-inter text-xs text-[#d8c4b8]">{title}</span>
                      <div className="mt-1 flex flex-wrap gap-3">
                        {options.map((opt) => (
                          <label key={opt.id} className="flex items-center gap-1 font-inter text-sm text-white">
                            <input
                              type="radio"
                              name={`q5_${field}`}
                              checked={brief.q5_consumer[field] === opt.id}
                              onChange={() =>
                                setBrief((b) => ({ ...b, q5_consumer: { ...b.q5_consumer, [field]: opt.id } }))
                              }
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          if (q.id === "q6_questions") {
            return (
              <div key={q.id}>
                <span className={labelText}>{q.label}</span>
                {q.helper && <span className={helperText}>{q.helper}</span>}
                {notesFor(q.id)}
                <div className="mt-2 space-y-2">
                  {brief.q6_questions.map((val, i) => (
                    <input
                      key={i}
                      className={inputClass}
                      placeholder={`Question ${i + 1}`}
                      value={val}
                      onChange={(e) =>
                        setBrief((b) => {
                          const next = [...b.q6_questions]
                          next[i] = e.target.value
                          return { ...b, q6_questions: next }
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )
          }

          if (q.id === "q7_receipts") {
            if (ent.forced.q7_receipts === "yes") {
              return (
                <div key={q.id}>
                  <span className={labelText}>{q.label}</span>
                  {notesFor(q.id)}
                  <p className="mt-2 font-inter text-sm text-white">
                    Yes — receipt and product image collection is included in your order.
                  </p>
                </div>
              )
            }
            return (
              <div key={q.id}>
                <span className={labelText}>{q.label}</span>
                {notesFor(q.id)}
                <div className="mt-2 space-y-2">
                  {q.options!.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 font-inter text-sm text-white">
                      <input
                        type="radio"
                        name="q7_receipts"
                        checked={brief.q7_receipts === opt.id}
                        onChange={() => setBrief((b) => ({ ...b, q7_receipts: opt.id as "yes" | "no" }))}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          }

          if (q.id === "q10_smartOffers") {
            return (
              <div key={q.id}>
                <span className={labelText}>{q.label}</span>
                {notesFor(q.id)}
                {q10Forced ? (
                  <p className="mt-2 font-inter text-sm text-white">
                    Yes — the SmartOffers pilot is included in your order.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {q.options!.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 font-inter text-sm text-white">
                        <input
                          type="radio"
                          name="q10_enabled"
                          checked={brief.q10_smartOffers.enabled === opt.id}
                          onChange={() =>
                            setBrief((b) => ({
                              ...b,
                              q10_smartOffers: { ...b.q10_smartOffers, enabled: opt.id as "yes" | "no" },
                            }))
                          }
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
                {brief.q10_smartOffers.enabled === "yes" && (
                  <div className="mt-3 space-y-3">
                    {q10Forced && (
                      <span className={helperText}>
                        All three details below are needed to set up your pilot.
                      </span>
                    )}
                    <input
                      className={inputClass}
                      required={q10Forced}
                      placeholder={`The action you want to drive (switching / loyalty / trial / other)${q10RequiredSuffix}`}
                      value={brief.q10_smartOffers.action}
                      onChange={(e) =>
                        setBrief((b) => ({ ...b, q10_smartOffers: { ...b.q10_smartOffers, action: e.target.value } }))
                      }
                    />
                    <input
                      className={inputClass}
                      required={q10Forced}
                      placeholder={`The type of offer or incentive you have in mind${q10RequiredSuffix}`}
                      value={brief.q10_smartOffers.offerType}
                      onChange={(e) =>
                        setBrief((b) => ({ ...b, q10_smartOffers: { ...b.q10_smartOffers, offerType: e.target.value } }))
                      }
                    />
                    <input
                      className={inputClass}
                      required={q10Forced}
                      placeholder={`The redemption or uplift metrics we should track${q10RequiredSuffix}`}
                      value={brief.q10_smartOffers.metrics}
                      onChange={(e) =>
                        setBrief((b) => ({ ...b, q10_smartOffers: { ...b.q10_smartOffers, metrics: e.target.value } }))
                      }
                    />
                  </div>
                )}
              </div>
            )
          }

          return null
        })}

        <label className="flex items-start gap-3 font-inter text-xs leading-relaxed text-white">
          <input name="termsAccepted" type="checkbox" required className="mt-1 h-4 w-4 accent-[#f97316]" />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-[#f97316]">Terms of Service</a> and{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-[#f97316]">Privacy Policy</a>. Your payment is secured with
            AES-256 encryption.
          </span>
        </label>
      </fieldset>

      <SubmitButton />
    </form>
  )
}
