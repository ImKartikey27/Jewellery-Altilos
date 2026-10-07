import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatBriefSections,
  renderBriefText,
} from "../src/lib/onboarding-brief-format.ts";

const brief = {
  q1_challenge: "Expand smartly",
  q2_objectives: { selected: ["expansion_markets", "something_else"], other: "Test pricing" },
  q3_category: "beverages",
  q4_locations: { selected: ["metro", "tier2"], specifics: { tier2: "Jaipur, Surat" } },
  q5_consumer: { ageRange: "25-34", gender: "all", income: "no_pref" },
  q6_questions: ["Q one", "Q two"],
  q8_competitors: "BrandX",
  q11_other: "None",
};

describe("formatBriefSections", () => {
  it("labels objectives by their option text and appends the free-text", () => {
    const sections = formatBriefSections(brief, "pulse");
    const obj = sections.find((s) => s.label.startsWith("Which of these best"));
    assert.match(obj.value, /Identify the right markets/);
    assert.match(obj.value, /Test pricing/);
  });

  it("includes the tier2 'specify' text next to the location", () => {
    const sections = formatBriefSections(brief, "pulse");
    const loc = sections.find((s) => s.label.startsWith("Which locations"));
    assert.match(loc.value, /Tier 2 cities \(Jaipur, Surat\)/);
  });

  it("omits gated questions for pulse (no Q7/Q9/Q10 rows)", () => {
    const sections = formatBriefSections(brief, "pulse");
    assert.equal(sections.some((s) => s.label.includes("receipts")), false);
  });

  it("renderBriefText joins label/value pairs as readable lines", () => {
    const text = renderBriefText(brief, "pulse");
    assert.match(text, /beverages/);
    assert.match(text, /Q one/);
  });
});

import { renderBriefHtml } from "../src/lib/onboarding-brief-format.ts";
import { entitlementsFromSlugs, NO_ENTITLEMENTS } from "../src/lib/addon-entitlements.ts";

const briefWithGated = {
  ...brief,
  q7_receipts: "yes",
  q9_callWindows: "Tue 3pm, Wed 11am",
  // Present on purpose: formatBriefSections also guards the Q10 row on
  // `&& brief.q10_smartOffers`, so a fixture without this key would make the
  // "still omits" assertion below pass even if isVisible always returned true.
  q10_smartOffers: { enabled: "yes", action: "", offerType: "", metrics: "" },
};

describe("entitlement-aware brief formatting", () => {
  it("is unchanged from plan-only when no entitlements are given", () => {
    assert.deepEqual(
      formatBriefSections(briefWithGated, "pulse"),
      formatBriefSections(briefWithGated, "pulse", NO_ENTITLEMENTS)
    );
  });

  it("emits the Q7 answer for a pulse buyer who unlocked it", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    const without = formatBriefSections(briefWithGated, "pulse");
    const with_ = formatBriefSections(briefWithGated, "pulse", ent);
    assert.equal(without.some((s) => s.label.includes("receipts")), false);
    assert.equal(with_.some((s) => s.label.includes("receipts")), true);
  });

  it("emits the Q9 answer for a pulse buyer who bought an expert call", () => {
    const ent = entitlementsFromSlugs(["pulse.expert_call_30"]);
    const sections = formatBriefSections(briefWithGated, "pulse", ent);
    const q9 = sections.find((s) => s.label.includes("expert call"));
    assert.ok(q9);
    assert.match(q9.value, /Tue 3pm/);
  });

  it("carries the unlocked answer through renderBriefText and renderBriefHtml", () => {
    const ent = entitlementsFromSlugs(["pulse.expert_call_30"]);
    assert.match(renderBriefText(briefWithGated, "pulse", ent), /Tue 3pm/);
    assert.match(renderBriefHtml(briefWithGated, "pulse", ent), /Tue 3pm/);
    assert.equal(/Tue 3pm/.test(renderBriefText(briefWithGated, "pulse")), false);
  });

  it("still omits questions no add-on unlocked", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images"]);
    const sections = formatBriefSections(briefWithGated, "pulse", ent);
    assert.equal(sections.some((s) => s.label.includes("SmartOffers")), false);
  });

  // No catalog add-on unlocks Q5a today, so without a synthetic entitlement the
  // `ent` argument on that one isVisible call is untested and could be dropped
  // without any test noticing.
  it("emits Q5a when an entitlement unlocks it", () => {
    const ent = { ...NO_ENTITLEMENTS, unlocks: ["q5a_segmentation"] };
    const withQ5a = { ...briefWithGated, q5a_segmentation: "Purchase frequency" };
    const label = "advanced segmentation";
    assert.equal(
      formatBriefSections(withQ5a, "pulse").some((s) => s.label.includes(label)),
      false
    );
    const section = formatBriefSections(withQ5a, "pulse", ent).find((s) =>
      s.label.includes(label)
    );
    assert.ok(section);
    assert.equal(section.value, "Purchase frequency");
  });
});
