import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { addOnsForPlan } from "../src/lib/addon-catalog.ts";
import { entitlementsFromSlugs } from "../src/lib/addon-entitlements.ts";
import {
  isVisible,
  visibleResearchQuestions,
} from "../src/lib/onboarding-questions.ts";
import { formatBriefSections } from "../src/lib/onboarding-brief-format.ts";
import { buildOnboardingSubmissionSchema } from "../src/lib/onboarding-schema.ts";
import { PLAN_KEYS } from "../src/lib/plans.ts";

// Every subset of a plan's add-ons. Six add-ons per plan -> 64 subsets, times
// four plans -> 193 combinations including expert's empty set. Cheap at unit speed.
function powerSet(items) {
  return items.reduce((acc, item) => [...acc, ...acc.map((set) => [...set, item])], [[]]);
}

function combinations() {
  const out = [];
  for (const plan of PLAN_KEYS) {
    for (const subset of powerSet(addOnsForPlan(plan).map((a) => a.slug))) {
      out.push({ plan, slugs: subset, ent: entitlementsFromSlugs(subset) });
    }
  }
  return out;
}

// A fully populated brief: every field answered, so the formatter's only reason
// to omit a section is a visibility rule rather than a blank value.
const fullBrief = {
  q1_challenge: "Decide which city to expand to next.",
  q2_objectives: { selected: ["expansion_markets"], other: "" },
  q3_category: "functional beverages",
  q4_locations: { selected: ["metro"], specifics: {} },
  q5_consumer: { ageRange: "25-34", gender: "all", income: "no_pref" },
  q5a_segmentation: "Purchase frequency",
  q6_questions: ["Which flavor do you prefer?"],
  q7_receipts: "yes",
  q8_competitors: "BrandX, BrandY",
  q9_callWindows: "Tue 3pm, Wed 11am",
  q10_smartOffers: {
    enabled: "yes",
    action: "switching",
    offerType: "10% off",
    metrics: "redemption",
  },
  q11_other: "None",
};

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

// Questions whose presence in the emailed brief is gated on visibility. Q1-Q6,
// Q8 and Q11 are emitted for every tier, so they carry no agreement obligation.
const GATED = ["q5a_segmentation", "q7_receipts", "q9_callWindows", "q10_smartOffers"];

const LABEL_MATCH = {
  q5a_segmentation: "advanced segmentation",
  q7_receipts: "receipts",
  q9_callWindows: "expert call",
  q10_smartOffers: "SmartOffers",
};

describe("cross-module entitlement agreement", () => {
  it("covers every plan crossed with every add-on subset", () => {
    assert.equal(combinations().length, 64 * 3 + 1);
  });

  it("renders, validates and emits exactly the same gated question set", () => {
    for (const { plan, slugs, ent } of combinations()) {
      const rendered = new Set(visibleResearchQuestions(plan, ent).map((q) => q.id));
      const sections = formatBriefSections(fullBrief, plan, ent);
      const context = `${plan} + [${slugs.join(", ")}]`;

      for (const id of GATED) {
        const isRendered = rendered.has(id);
        assert.equal(
          isVisible(id, plan, ent),
          isRendered,
          `${context}: isVisible and visibleResearchQuestions disagree on ${id}`
        );

        const emitted = sections.some((s) => s.label.includes(LABEL_MATCH[id]));
        assert.equal(
          emitted,
          isRendered,
          `${context}: ${id} is ${isRendered ? "rendered but not emitted" : "emitted but not rendered"} — the customer's answer would be ${isRendered ? "lost" : "invented"}`
        );
      }
    }
  });

  it("accepts a fully answered brief for every combination", () => {
    for (const { plan, slugs, ent } of combinations()) {
      const result = buildOnboardingSubmissionSchema(plan, ent).safeParse({
        ...baseContact,
        researchBrief: fullBrief,
      });
      assert.equal(
        result.success,
        true,
        `${plan} + [${slugs.join(", ")}] rejected a complete brief: ${JSON.stringify(
          result.error?.issues
        )}`
      );
    }
  });

  it("rejects a blank answer to every question the combination renders", () => {
    const blanked = {
      ...fullBrief,
      q7_receipts: null,
      q8_competitors: "",
      q9_callWindows: "",
      q10_smartOffers: null,
    };

    for (const { plan, slugs, ent } of combinations()) {
      const rendersGated =
        isVisible("q7_receipts", plan, ent) ||
        isVisible("q9_callWindows", plan, ent) ||
        isVisible("q10_smartOffers", plan, ent) ||
        ent.required.includes("q8_competitors");
      if (!rendersGated) continue;

      const result = buildOnboardingSubmissionSchema(plan, ent).safeParse({
        ...baseContact,
        researchBrief: blanked,
      });
      assert.equal(
        result.success,
        false,
        `${plan} + [${slugs.join(", ")}] accepted a brief with its gated questions left blank`
      );
    }
  });

  it("never lets an add-on remove a question the plan already showed", () => {
    for (const { plan, slugs, ent } of combinations()) {
      const planOnly = new Set(visibleResearchQuestions(plan).map((q) => q.id));
      const withAddOns = new Set(visibleResearchQuestions(plan, ent).map((q) => q.id));
      for (const id of planOnly) {
        assert.ok(
          withAddOns.has(id),
          `${plan} + [${slugs.join(", ")}] hid ${id}, which the plan alone shows`
        );
      }
    }
  });
});
