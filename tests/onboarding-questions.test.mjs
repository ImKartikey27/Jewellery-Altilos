import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  planRank,
  q6SlotCount,
  isVisible,
  RESEARCH_QUESTIONS,
} from "../src/lib/onboarding-questions.ts";

describe("planRank", () => {
  it("ranks tiers in ascending order", () => {
    assert.equal(planRank("pulse"), 0);
    assert.equal(planRank("core"), 1);
    assert.equal(planRank("core+"), 2);
    assert.equal(planRank("expert"), 3);
  });
});

describe("q6SlotCount", () => {
  it("gives 5 slots for pulse and 7 for core and above", () => {
    assert.equal(q6SlotCount("pulse"), 5);
    assert.equal(q6SlotCount("core"), 7);
    assert.equal(q6SlotCount("core+"), 7);
    assert.equal(q6SlotCount("expert"), 7);
  });
});

describe("isVisible", () => {
  it("hides Q5a/Q7/Q9 below core+", () => {
    assert.equal(isVisible("q5a_segmentation", "core"), false);
    assert.equal(isVisible("q5a_segmentation", "core+"), true);
    assert.equal(isVisible("q7_receipts", "pulse"), false);
    assert.equal(isVisible("q7_receipts", "expert"), true);
  });
  it("shows Q10 only for expert", () => {
    assert.equal(isVisible("q10_smartOffers", "core+"), false);
    assert.equal(isVisible("q10_smartOffers", "expert"), true);
  });
  it("shows base questions to everyone", () => {
    assert.equal(isVisible("q1_challenge", "pulse"), true);
    assert.equal(isVisible("q11_other", "pulse"), true);
  });
});

describe("RESEARCH_QUESTIONS", () => {
  it("defines Q2 objectives with a free-text 'something else' option", () => {
    const q2 = RESEARCH_QUESTIONS.find((q) => q.id === "q2_objectives");
    assert.equal(q2.type, "multiselect");
    const other = q2.options.find((o) => o.id === "something_else");
    assert.equal(other.allowsFreeText, true);
  });
  it("defines Q4 location options with specify free-text on tier2/tier3/specific/other", () => {
    const q4 = RESEARCH_QUESTIONS.find((q) => q.id === "q4_locations");
    const withText = q4.options.filter((o) => o.allowsFreeText).map((o) => o.id);
    assert.deepEqual(withText, ["tier2", "tier3", "specific_cities", "other_market"]);
  });
});

import { visibleResearchQuestions } from "../src/lib/onboarding-questions.ts";
import {
  NO_ENTITLEMENTS,
  entitlementsFromSlugs,
} from "../src/lib/addon-entitlements.ts";
import { PLAN_KEYS } from "../src/lib/plans.ts";

describe("entitlement-aware visibility", () => {
  it("defaults to plan-only behaviour when no entitlements are passed", () => {
    for (const plan of PLAN_KEYS) {
      assert.deepEqual(
        visibleResearchQuestions(plan).map((q) => q.id),
        visibleResearchQuestions(plan, NO_ENTITLEMENTS).map((q) => q.id),
        plan
      );
    }
  });

  it("unlocks Q7 for a pulse buyer who bought receipt images", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    assert.equal(isVisible("q7_receipts", "pulse"), false);
    assert.equal(isVisible("q7_receipts", "pulse", ent), true);
  });

  it("unlocks Q9 for a pulse buyer who bought an expert call", () => {
    const ent = entitlementsFromSlugs(["pulse.expert_call_30"]);
    assert.equal(isVisible("q9_callWindows", "pulse", ent), true);
  });

  it("unlocks Q10 for a core+ buyer who bought the SmartOffers pilot", () => {
    const ent = entitlementsFromSlugs(["core_plus.smartoffers_pilot"]);
    assert.equal(isVisible("q10_smartOffers", "core+"), false);
    assert.equal(isVisible("q10_smartOffers", "core+", ent), true);
  });

  it("never unlocks a question the add-ons do not mention", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    assert.equal(isVisible("q5a_segmentation", "pulse", ent), false);
    assert.equal(isVisible("q10_smartOffers", "pulse", ent), false);
  });

  it("adds granted Q6 slots on top of the plan baseline", () => {
    assert.equal(q6SlotCount("pulse", NO_ENTITLEMENTS), 5);
    assert.equal(q6SlotCount("core", NO_ENTITLEMENTS), 7);
    const synthetic = { ...NO_ENTITLEMENTS, extraQ6Slots: 2 };
    assert.equal(q6SlotCount("pulse", synthetic), 7);
    assert.equal(q6SlotCount("core", synthetic), 9);
  });

  it("puts unlocked questions in their canonical catalog order", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images", "pulse.expert_call_30"]);
    const ids = visibleResearchQuestions("pulse", ent).map((q) => q.id);
    assert.ok(ids.indexOf("q7_receipts") < ids.indexOf("q8_competitors"));
    assert.ok(ids.indexOf("q8_competitors") < ids.indexOf("q9_callWindows"));
  });
});
