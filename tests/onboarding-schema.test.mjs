import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildOnboardingSubmissionSchema } from "../src/lib/onboarding-schema.ts";
import { isVisible } from "../src/lib/onboarding-questions.ts";

const baseContact = {
  token: "x".repeat(24),
  fullName: "Jane Doe",
  workEmail: "jane@acme.com",
  jobTitle: "Head of Insights",
  companyName: "Acme Inc",
  companyWebsite: "",
  phoneNumber: "",
  termsAccepted: true,
};

const baseBrief = {
  q1_challenge: "Decide which city to expand to next.",
  q2_objectives: { selected: ["expansion_markets"], other: "" },
  q3_category: "functional beverages",
  q4_locations: { selected: ["metro"], specifics: {} },
  q5_consumer: { ageRange: "25-34", gender: "all", income: "no_pref" },
  q6_questions: ["Which flavor do you prefer?"],
};

// The EXACT shape the client (OnboardingForm.tsx) serializes: every key present,
// with q7_receipts normalized to null and q10_smartOffers null when unselected.
// This mirrors what actually reaches the server and guards the client<->schema contract.
const clientDefaultBrief = {
  q1_challenge: "Decide which city to expand to next.",
  q2_objectives: { selected: ["expansion_markets"], other: "" },
  q3_category: "functional beverages",
  q4_locations: { selected: ["metro"], specifics: {} },
  q5_consumer: { ageRange: "25-34", gender: "all", income: "no_pref" },
  q5a_segmentation: "",
  q6_questions: ["Which flavor do you prefer?", "", ""],
  q7_receipts: null,
  q8_competitors: "",
  q9_callWindows: "",
  q10_smartOffers: null,
  q11_other: "",
};

describe("buildOnboardingSubmissionSchema", () => {
  it("accepts a valid pulse submission", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    const parsed = schema.parse({ ...baseContact, researchBrief: baseBrief });
    assert.equal(parsed.researchBrief.q1_challenge, "Decide which city to expand to next.");
  });

  it("accepts the real client default shape for pulse (q7/q10 normalized to null)", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    const parsed = schema.parse({ ...baseContact, researchBrief: clientDefaultBrief });
    assert.equal(parsed.researchBrief.q6_questions.length, 1); // empty slots filtered
  });

  it("tolerates empty-string q7_receipts and q10.enabled without a raw enum throw", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    const parsed = schema.parse({
      ...baseContact,
      researchBrief: {
        ...clientDefaultBrief,
        q7_receipts: "",
        q10_smartOffers: { enabled: "", action: "", offerType: "", metrics: "" },
      },
    });
    assert.equal(parsed.researchBrief.q7_receipts ?? null, null);
    assert.equal(parsed.researchBrief.q10_smartOffers ?? null, null);
  });

  it("rejects an empty Q1 challenge", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    assert.throws(() =>
      schema.parse({ ...baseContact, researchBrief: { ...baseBrief, q1_challenge: "" } })
    );
  });

  it("rejects Q2 with no objective selected", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    assert.throws(() =>
      schema.parse({
        ...baseContact,
        researchBrief: { ...baseBrief, q2_objectives: { selected: [], other: "" } },
      })
    );
  });

  it("rejects Q6 with zero filled questions", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    assert.throws(() =>
      schema.parse({ ...baseContact, researchBrief: { ...baseBrief, q6_questions: [] } })
    );
  });

  it("does NOT require Q7 for pulse", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    const parsed = schema.parse({ ...baseContact, researchBrief: baseBrief });
    assert.ok(parsed);
  });

  it("REQUIRES Q7 and Q9 for core+", () => {
    const schema = buildOnboardingSubmissionSchema("core+");
    assert.throws(() =>
      schema.parse({ ...baseContact, researchBrief: baseBrief })
    );
    const ok = schema.parse({
      ...baseContact,
      researchBrief: { ...baseBrief, q7_receipts: "no", q9_callWindows: "Tue 3pm, Wed 11am" },
    });
    assert.equal(ok.researchBrief.q7_receipts, "no");
  });

  it("REQUIRES Q10 enabled flag for expert", () => {
    const schema = buildOnboardingSubmissionSchema("expert");
    assert.throws(() =>
      schema.parse({
        ...baseContact,
        researchBrief: { ...baseBrief, q7_receipts: "no", q9_callWindows: "Tue 3pm" },
      })
    );
    const ok = schema.parse({
      ...baseContact,
      researchBrief: {
        ...baseBrief,
        q7_receipts: "no",
        q9_callWindows: "Tue 3pm",
        q10_smartOffers: { enabled: "no" },
      },
    });
    assert.equal(ok.researchBrief.q10_smartOffers.enabled, "no");
  });

  it("rejects a bad companyWebsite", () => {
    const schema = buildOnboardingSubmissionSchema("pulse");
    assert.throws(() =>
      schema.parse({
        ...baseContact,
        companyWebsite: "notaurl",
        researchBrief: baseBrief,
      })
    );
  });
});

import { entitlementsFromSlugs, NO_ENTITLEMENTS } from "../src/lib/addon-entitlements.ts";

const briefWith = (extra) => ({ ...clientDefaultBrief, ...extra });

describe("entitlement-aware validation", () => {
  it("is unchanged from plan-only when no entitlements are given", () => {
    const withDefault = buildOnboardingSubmissionSchema("pulse");
    const withNone = buildOnboardingSubmissionSchema("pulse", NO_ENTITLEMENTS);
    const payload = { ...baseContact, researchBrief: clientDefaultBrief };
    assert.deepEqual(withDefault.parse(payload), withNone.parse(payload));
  });

  it("demands a Q7 answer once the receipt add-on unlocks it for pulse", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    const result = schema.safeParse({ ...baseContact, researchBrief: clientDefaultBrief });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some((i) => i.path.includes("q7_receipts")));
  });

  it("rejects a 'no' to Q7 when the customer paid for receipts", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    const result = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q7_receipts: "no" }),
    });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some((i) => i.path.includes("q7_receipts")));
  });

  it("accepts a 'yes' to Q7 when the customer paid for receipts", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    const result = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q7_receipts: "yes" }),
    });
    assert.equal(result.success, true, JSON.stringify(result.error?.issues));
  });

  it("demands call windows once an expert call add-on unlocks Q9 for pulse", () => {
    const ent = entitlementsFromSlugs(["pulse.expert_call_30"]);
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    const result = schema.safeParse({ ...baseContact, researchBrief: clientDefaultBrief });
    assert.equal(result.success, false);
    // Exactly one issue: these add-ons set both `unlocks` and `requires` on q9,
    // and the customer must not be shown the same complaint twice.
    const q9Issues = result.error.issues.filter((i) => i.path.includes("q9_callWindows"));
    assert.equal(q9Issues.length, 1, JSON.stringify(q9Issues));

    const ok = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q9_callWindows: "Tue 3pm, Wed 11am" }),
    });
    assert.equal(ok.success, true, JSON.stringify(ok.error?.issues));
  });

  it("makes Q8 mandatory when a competitor add-on requires it", () => {
    const ent = entitlementsFromSlugs(["pulse.competitor_2"]);
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    const result = schema.safeParse({ ...baseContact, researchBrief: clientDefaultBrief });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some((i) => i.path.includes("q8_competitors")));

    const ok = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q8_competitors: "BrandX, BrandY" }),
    });
    assert.equal(ok.success, true, JSON.stringify(ok.error?.issues));
  });

  it("leaves Q8 optional without a competitor add-on", () => {
    const schema = buildOnboardingSubmissionSchema("pulse", NO_ENTITLEMENTS);
    const result = schema.safeParse({ ...baseContact, researchBrief: clientDefaultBrief });
    assert.equal(result.success, true, JSON.stringify(result.error?.issues));
  });

  it("rejects a 'no' to Q10 when the SmartOffers pilot was purchased", () => {
    const ent = entitlementsFromSlugs(["core_plus.smartoffers_pilot"]);
    const schema = buildOnboardingSubmissionSchema("core+", ent);
    const result = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({
        q5a_segmentation: "",
        q7_receipts: "no",
        q9_callWindows: "Tue 3pm",
        q10_smartOffers: { enabled: "no", action: "", offerType: "", metrics: "" },
      }),
    });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some((i) => i.path.includes("q10_smartOffers")));
  });

  it("accepts a 'yes' to Q10 when the SmartOffers pilot was purchased", () => {
    const ent = entitlementsFromSlugs(["core_plus.smartoffers_pilot"]);
    const schema = buildOnboardingSubmissionSchema("core+", ent);
    const result = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({
        q7_receipts: "no",
        q9_callWindows: "Tue 3pm",
        q10_smartOffers: {
          enabled: "yes",
          action: "switching",
          offerType: "10% off",
          metrics: "redemption",
        },
      }),
    });
    assert.equal(result.success, true, JSON.stringify(result.error?.issues));
  });
});

describe("entitlement precedence and requiredness", () => {
  // Fix 3: without `ent` threaded into the q10 visibility check, a core+ pilot
  // buyer could submit q10_smartOffers: null and lose the answer they paid for.
  it("demands a Q10 answer once the pilot unlocks it for core+", () => {
    const ent = entitlementsFromSlugs(["core_plus.smartoffers_pilot"]);
    const schema = buildOnboardingSubmissionSchema("core+", ent);
    const r = schema.safeParse({ ...baseContact, researchBrief:
      briefWith({ q7_receipts: "no", q9_callWindows: "Tue 3pm", q10_smartOffers: null }) });
    assert.equal(r.success, false);
    assert.ok(r.error.issues.some((i) => i.path.includes("q10_smartOffers")));
  });

  // Forced must beat visibility: a forces-without-unlocks entitlement below the
  // rank gate must still reject a payload that simply omits the field, or the
  // paid-for answer is stored as null and silently lost.
  it("rejects an omitted Q7 when forced without an unlock below the rank gate", () => {
    const ent = { ...NO_ENTITLEMENTS, forced: { q7_receipts: "yes" } };
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    assert.equal(isVisible("q7_receipts", "pulse", ent), false);

    for (const value of [null, undefined, "no"]) {
      const r = schema.safeParse({
        ...baseContact,
        researchBrief: briefWith({ q7_receipts: value }),
      });
      assert.equal(r.success, false, JSON.stringify(value));
      const q7Issues = r.error.issues.filter((i) => i.path.includes("q7_receipts"));
      assert.equal(q7Issues.length, 1, JSON.stringify(q7Issues));
    }

    const ok = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q7_receipts: "yes" }),
    });
    assert.equal(ok.success, true, JSON.stringify(ok.error?.issues));
  });

  it("rejects an omitted Q10 when forced without an unlock below the rank gate", () => {
    const ent = { ...NO_ENTITLEMENTS, forced: { q10_smartOffers: "yes" } };
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    assert.equal(isVisible("q10_smartOffers", "pulse", ent), false);

    const r = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q10_smartOffers: null }),
    });
    assert.equal(r.success, false);
    const enabledIssues = r.error.issues.filter(
      (i) => i.path.length === 2 && i.path.includes("q10_smartOffers")
    );
    assert.equal(enabledIssues.length, 1, JSON.stringify(enabledIssues));
  });

  // Pins the `else if` visibility branches, which forcing would otherwise mask:
  // every real add-on that unlocks q7/q10 also forces them.
  it("demands an answer when an entitlement unlocks Q7 or Q10 without forcing it", () => {
    const q7Ent = { ...NO_ENTITLEMENTS, unlocks: ["q7_receipts"] };
    const q7 = buildOnboardingSubmissionSchema("pulse", q7Ent).safeParse({
      ...baseContact,
      researchBrief: clientDefaultBrief,
    });
    assert.equal(q7.success, false);
    assert.ok(q7.error.issues.some((i) => i.path.includes("q7_receipts")));
    // Not forced, so "no" is a legitimate answer.
    const q7No = buildOnboardingSubmissionSchema("pulse", q7Ent).safeParse({
      ...baseContact,
      researchBrief: briefWith({ q7_receipts: "no" }),
    });
    assert.equal(q7No.success, true, JSON.stringify(q7No.error?.issues));

    const q10Ent = { ...NO_ENTITLEMENTS, unlocks: ["q10_smartOffers"] };
    const q10 = buildOnboardingSubmissionSchema("core+", q10Ent).safeParse({
      ...baseContact,
      researchBrief: briefWith({ q7_receipts: "no", q9_callWindows: "Tue 3pm" }),
    });
    assert.equal(q10.success, false);
    assert.ok(q10.error.issues.some((i) => i.path.includes("q10_smartOffers")));
    // Not forced, so "no" is a legitimate answer and needs no follow-ups.
    const q10No = buildOnboardingSubmissionSchema("core+", q10Ent).safeParse({
      ...baseContact,
      researchBrief: briefWith({
        q7_receipts: "no",
        q9_callWindows: "Tue 3pm",
        q10_smartOffers: { enabled: "no", action: "", offerType: "", metrics: "" },
      }),
    });
    assert.equal(q10No.success, true, JSON.stringify(q10No.error?.issues));
  });

  // Fix 4: a purchased pilot with a blank brief leaves ops nothing to run.
  it("requires the Q10 follow-ups when the pilot is forced", () => {
    const ent = entitlementsFromSlugs(["core_plus.smartoffers_pilot"]);
    const schema = buildOnboardingSubmissionSchema("core+", ent);
    const blank = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({
        q7_receipts: "no",
        q9_callWindows: "Tue 3pm",
        q10_smartOffers: { enabled: "yes", action: "", offerType: "", metrics: "   " },
      }),
    });
    assert.equal(blank.success, false);
    for (const field of ["action", "offerType", "metrics"]) {
      assert.ok(
        blank.error.issues.some(
          (i) => i.path.includes("q10_smartOffers") && i.path.includes(field)
        ),
        `no issue reported on q10_smartOffers.${field}`
      );
    }
    // The enabled flag itself is fine, so it must not be complained about.
    assert.equal(
      blank.error.issues.filter((i) => i.path.length === 2 && i.path.includes("q10_smartOffers"))
        .length,
      0
    );
  });

  it("leaves the Q10 follow-ups optional when the pilot was not purchased", () => {
    const schema = buildOnboardingSubmissionSchema("expert", NO_ENTITLEMENTS);
    const r = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({
        q7_receipts: "no",
        q9_callWindows: "Tue 3pm",
        q10_smartOffers: { enabled: "yes", action: "", offerType: "", metrics: "" },
      }),
    });
    assert.equal(r.success, true, JSON.stringify(r.error?.issues));
  });

  // Fix 5: pins requiredness on its own, on a plan where Q9 is not rank-visible.
  it("demands Q9 from a required-only entitlement below the rank gate", () => {
    const ent = { ...NO_ENTITLEMENTS, required: ["q9_callWindows"] };
    const schema = buildOnboardingSubmissionSchema("pulse", ent);
    const r = schema.safeParse({ ...baseContact, researchBrief: clientDefaultBrief });
    assert.equal(r.success, false);
    const q9Issues = r.error.issues.filter((i) => i.path.includes("q9_callWindows"));
    assert.equal(q9Issues.length, 1, JSON.stringify(q9Issues));

    // ...and the same entitlement must make the form draw the field, or the
    // customer is asked for something they can never fill in.
    assert.equal(isVisible("q9_callWindows", "pulse", ent), true);

    const ok = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q9_callWindows: "Tue 3pm, Wed 11am" }),
    });
    assert.equal(ok.success, true, JSON.stringify(ok.error?.issues));
  });
});

// Pins the rank-visibility half of the q9 condition on its own. The pre-existing
// "REQUIRES Q7 and Q9 for core+" test cannot do this: its payload also omits q7,
// so it still throws when the q9 rule is removed entirely.
describe("Q9 requiredness from plan rank alone", () => {
  it("demands Q9 for core+ when every other answer is supplied", () => {
    const schema = buildOnboardingSubmissionSchema("core+", NO_ENTITLEMENTS);
    const r = schema.safeParse({
      ...baseContact,
      researchBrief: briefWith({ q7_receipts: "no", q9_callWindows: "" }),
    });
    assert.equal(r.success, false);
    assert.deepEqual(
      r.error.issues.map((i) => i.path.join(".")),
      ["researchBrief.q9_callWindows"]
    );
  });
});
