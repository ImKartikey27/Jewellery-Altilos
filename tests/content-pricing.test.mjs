import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { faqs, pricingPlans } from "../src/lib/content.ts";
import { formatMinor } from "../src/lib/money.ts";
import { PLAN_KEYS, PLAN_PRICING } from "../src/lib/plans.ts";
import { ADD_ONS } from "../src/lib/addon-catalog.ts";
import { q6SlotCount } from "../src/lib/onboarding-questions.ts";

describe("pricing card content", () => {
  it("covers every plan exactly once, in ladder order", () => {
    assert.deepEqual(
      pricingPlans.map((plan) => plan.key),
      [...PLAN_KEYS]
    );
  });

  // Guards against anyone re-hardcoding a price string, which is exactly the
  // drift that let content.ts and the checkout route disagree before.
  it("derives every displayed price from the pricing catalog", () => {
    for (const plan of pricingPlans) {
      const { amountMinor, currency } = PLAN_PRICING[plan.key];
      assert.equal(plan.price, formatMinor(amountMinor, currency));
    }
  });

  it("shows the agreed rupee prices", () => {
    assert.deepEqual(
      pricingPlans.map((plan) => plan.price),
      ["₹8,000", "₹40,000", "₹1,00,000", "₹2,00,000"]
    );
  });

  it("badges only the three upper tiers", () => {
    assert.deepEqual(
      pricingPlans.map((plan) => plan.badge ?? null),
      [null, "Most popular", "Best value", "Full depth"]
    );
  });

  it("gives every plan a response note and a tagline", () => {
    for (const plan of pricingPlans) {
      assert.ok(plan.responsesNote.trim().length > 0, `${plan.key} needs a response note`);
      assert.ok(plan.tagline.heading.trim().length > 0, `${plan.key} needs a tagline heading`);
      assert.ok(plan.tagline.body.trim().length > 0, `${plan.key} needs a tagline body`);
    }
  });

  it("uses only the three defined feature markers", () => {
    for (const plan of pricingPlans) {
      assert.ok(plan.features.length > 0, `${plan.key} needs features`);
      for (const feature of plan.features) {
        assert.ok(
          ["check", "star", "excluded"].includes(feature.marker),
          `${plan.key} has an unknown marker: ${feature.marker}`
        );
        assert.ok(feature.label.trim().length > 0);
      }
    }
  });

  it("marks excluded rows only on Pulse, where the upgrade gap is the point", () => {
    for (const plan of pricingPlans) {
      const excluded = plan.features.filter((f) => f.marker === "excluded");
      if (plan.key === "pulse") {
        assert.deepEqual(
          excluded.map((f) => f.label),
          ["Analyst report", "Expert call"]
        );
      } else {
        assert.deepEqual(excluded, [], `${plan.key} should not show excluded rows`);
      }
    }
  });

  it("stars the headline value on every tier above Pulse", () => {
    for (const plan of pricingPlans) {
      const starred = plan.features.filter((f) => f.marker === "star").length;
      if (plan.key === "pulse") {
        assert.equal(starred, 0);
      } else {
        assert.equal(starred, 2, `${plan.key} should star exactly two features`);
      }
    }
  });
});

describe("currency copy", () => {
  it("leaves no dollar amounts in the pricing cards", () => {
    const serialized = JSON.stringify(pricingPlans);
    assert.ok(!serialized.includes("$"), "pricing cards still mention $");
  });

  it("leaves no dollar amounts in the FAQ answers", () => {
    for (const faq of faqs) {
      assert.ok(!faq.answer.includes("$"), `FAQ still mentions $: ${faq.question}`);
      assert.ok(!faq.question.includes("$"));
    }
  });
});

// Both suites below exist because the pricing cards are a PROMISE. Every number
// on them is sold to a customer before any code runs, so a constant that drifts
// away from the copy is not a stale string — it is a customer who paid for
// something the product then refuses to give them. Two such drifts shipped:
// Pulse advertised 5 questions while the form drew 3 inputs, and the Core+
// response add-on claimed a total of 650 when the arithmetic gives 500.

describe("question slots match the pricing copy", () => {
  // "Up to 5 questions" -> 5
  function advertisedQuestions(plan) {
    for (const feature of plan.features) {
      const match = /^Up to (\d+) questions$/.exec(feature.label);
      if (match) return Number(match[1]);
    }
    return null;
  }

  it("draws exactly as many question inputs as each card advertises", () => {
    let asserted = 0;
    for (const plan of pricingPlans) {
      const advertised = advertisedQuestions(plan);
      if (advertised === null) continue;
      assert.equal(
        q6SlotCount(plan.key),
        advertised,
        `${plan.key} advertises ${advertised} questions but the form allocates ${q6SlotCount(
          plan.key
        )} slots`
      );
      asserted += 1;
    }
    // Pulse and Core carry the only explicit counts; if the copy stops stating
    // them this test would silently assert nothing.
    assert.equal(asserted, 2, "expected exactly two plans to state a question count");
  });

  it("never gives a higher tier fewer questions than the one it builds on", () => {
    const ladder = pricingPlans.map((plan) => q6SlotCount(plan.key));
    for (let i = 1; i < ladder.length; i += 1) {
      assert.ok(
        ladder[i] >= ladder[i - 1],
        `${pricingPlans[i].key} allocates fewer question slots than ${pricingPlans[i - 1].key}`
      );
    }
  });
});

describe("response add-on arithmetic", () => {
  // "50 verified responses" -> 50
  function includedResponses(planKey) {
    const plan = pricingPlans.find((p) => p.key === planKey);
    for (const feature of plan.features) {
      const match = /^([\d,]+) verified responses$/.exec(feature.label);
      if (match) return Number(match[1].replace(/,/g, ""));
    }
    return null;
  }

  it("states a resulting sample that equals included + purchased", () => {
    const responseAddOns = ADD_ONS.filter((addOn) => /\.responses_\d+$/.test(addOn.slug));
    assert.ok(responseAddOns.length > 0, "no response add-ons found to check");

    for (const addOn of responseAddOns) {
      const purchased = Number(/^Add ([\d,]+) responses$/.exec(addOn.label)[1].replace(/,/g, ""));
      const included = includedResponses(addOn.planKey);
      assert.ok(included !== null, `${addOn.planKey} card states no response count`);

      const total = included + purchased;
      assert.ok(
        addOn.description.includes(`${total} verified responses`),
        `${addOn.slug}: ${included} + ${purchased} = ${total}, but the description reads "${addOn.description}"`
      );
    }
  });
});
