import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADD_ONS,
  MAX_OPTIONAL_ITEMS,
  addOnBySlug,
  addOnsForPlan,
  offeredAddOnsForPlan,
  isAddOnSlug,
  slugPlanPrefix,
} from "../src/lib/addon-catalog.ts";
import { PLAN_KEYS } from "../src/lib/plans.ts";

describe("add-on catalog", () => {
  it("holds exactly the 18 agreed add-ons", () => {
    assert.equal(ADD_ONS.length, 18);
  });

  it("offers six add-ons each for pulse, core and core+, and none for expert", () => {
    assert.equal(addOnsForPlan("pulse").length, 6);
    assert.equal(addOnsForPlan("core").length, 6);
    assert.equal(addOnsForPlan("core+").length, 6);
    assert.deepEqual(addOnsForPlan("expert"), []);
  });

  // Stripe rejects a Checkout Session with more than 10 optional_items. We are
  // at 6 today; this guards a future catalog edit from silently 400-ing.
  it("keeps every plan within Stripe's optional_items cap", () => {
    for (const plan of PLAN_KEYS) {
      assert.ok(
        addOnsForPlan(plan).length <= MAX_OPTIONAL_ITEMS,
        `${plan} exceeds Stripe's ${MAX_OPTIONAL_ITEMS}-item cap`
      );
    }
  });

  it("uses globally unique slugs", () => {
    const slugs = ADD_ONS.map((addOn) => addOn.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("prefixes every slug with its own plan", () => {
    for (const addOn of ADD_ONS) {
      const expected = `${slugPlanPrefix(addOn.planKey)}.`;
      assert.ok(
        addOn.slug.startsWith(expected),
        `${addOn.slug} should start with ${expected}`
      );
      assert.match(addOn.slug, /^(pulse|core|core_plus)\.[a-z0-9_]+$/);
    }
  });

  it("assigns every add-on to a real plan", () => {
    for (const addOn of ADD_ONS) {
      assert.ok(PLAN_KEYS.includes(addOn.planKey), `${addOn.slug} has an unknown plan`);
    }
  });

  it("prices every add-on in INR at the agreed amount", () => {
    const expected = {
      "pulse.responses_50": 300000,
      "pulse.competitor_2": 250000,
      "pulse.expert_call_30": 600000,
      "pulse.city_2": 400000,
      "pulse.receipt_images": 500000,
      "pulse.priority_3day": 300000,
      "core.responses_100": 600000,
      "core.competitors_4": 500000,
      "core.expert_call_45": 1200000,
      "core.city_3": 700000,
      "core.receipt_images": 1000000,
      "core.priority_3day": 700000,
      "core_plus.responses_150": 900000,
      "core_plus.expert_session_2": 1600000,
      "core_plus.smartoffers_pilot": 2800000,
      "core_plus.city_extra": 1000000,
      "core_plus.competitors_highcap": 800000,
      "core_plus.priority_3day": 1000000,
    };

    assert.deepEqual(
      Object.fromEntries(ADD_ONS.map((addOn) => [addOn.slug, addOn.amountMinor])),
      expected
    );

    for (const addOn of ADD_ONS) {
      assert.equal(addOn.currency, "inr");
      assert.ok(Number.isInteger(addOn.amountMinor), `${addOn.slug} must be an integer`);
      assert.ok(addOn.amountMinor > 0, `${addOn.slug} must be positive`);
      assert.equal(addOn.amountMinor % 100, 0, `${addOn.slug} must be whole rupees`);
    }
  });

  it("gives every add-on a non-empty customer-facing label", () => {
    for (const addOn of ADD_ONS) {
      assert.ok(addOn.label.trim().length > 0, `${addOn.slug} needs a label`);
    }
  });

  // Add-ons that repeat across tiers share a label but must never share a slug,
  // because they are priced differently and need distinct Stripe Prices.
  it("keeps repeated labels on distinct per-tier slugs", () => {
    const priority = ADD_ONS.filter((a) => a.label === "Priority 3-day delivery");
    assert.equal(priority.length, 3);
    assert.deepEqual(
      priority.map((a) => a.amountMinor),
      [300000, 700000, 1000000]
    );
    assert.equal(new Set(priority.map((a) => a.slug)).size, 3);
  });

  it("gives every add-on a non-empty description for the checkout picker", () => {
    for (const addOn of ADD_ONS) {
      assert.equal(typeof addOn.description, "string", `${addOn.slug} has no description`);
      assert.ok(addOn.description.trim().length > 0, `${addOn.slug} has an empty description`);
    }
  });

  it("keeps descriptions short enough for a picker row", () => {
    for (const addOn of ADD_ONS) {
      assert.ok(
        addOn.description.length <= 160,
        `${addOn.slug} description is ${addOn.description.length} chars; keep it under 160`
      );
    }
  });
});

describe("addOnBySlug / isAddOnSlug", () => {
  it("finds a known add-on", () => {
    assert.equal(addOnBySlug("core_plus.smartoffers_pilot")?.amountMinor, 2800000);
    assert.equal(isAddOnSlug("core_plus.smartoffers_pilot"), true);
  });

  it("returns undefined for unknown slugs", () => {
    assert.equal(addOnBySlug("pulse.nope"), undefined);
    assert.equal(isAddOnSlug("pulse.nope"), false);
    assert.equal(isAddOnSlug(null), false);
  });
});

describe("slugPlanPrefix", () => {
  it("normalizes core+ to a JSON-key-safe prefix", () => {
    assert.equal(slugPlanPrefix("core+"), "core_plus");
    assert.equal(slugPlanPrefix("pulse"), "pulse");
    assert.equal(slugPlanPrefix("core"), "core");
    assert.equal(slugPlanPrefix("expert"), "expert");
  });
});

// The checkout picker renders offeredAddOnsForPlan, never addOnsForPlan. The
// difference is what a customer is QUOTED versus what Stripe will actually bill:
// an add-on with no configured price id is dropped from the Checkout Session by
// parseAddOnSelection, so showing it would put a line in the customer's total
// that never reaches the invoice, and leave them expecting a deliverable nobody
// was paid for. STRIPE_ADDON_PRICE_IDS is legitimately allowed to be unset or
// partial, so this is a normal operating state, not a corner case.
describe("offeredAddOnsForPlan", () => {
  it("shows nothing when no price ids are configured", () => {
    for (const plan of PLAN_KEYS) {
      assert.deepEqual(offeredAddOnsForPlan(plan, []), []);
    }
  });

  it("shows only the add-ons that have a configured price id", () => {
    const offered = offeredAddOnsForPlan("pulse", [
      "pulse.responses_50",
      "pulse.priority_3day",
    ]);
    assert.deepEqual(
      offered.map((addOn) => addOn.slug),
      ["pulse.responses_50", "pulse.priority_3day"]
    );
  });

  it("keeps catalog display order regardless of the map's key order", () => {
    const catalogOrder = addOnsForPlan("pulse").map((addOn) => addOn.slug);
    const reversed = offeredAddOnsForPlan("pulse", [...catalogOrder].reverse());
    assert.deepEqual(
      reversed.map((addOn) => addOn.slug),
      catalogOrder
    );
  });

  it("still refuses to leak another plan's add-ons", () => {
    const everySlug = ADD_ONS.map((addOn) => addOn.slug);
    for (const plan of PLAN_KEYS) {
      for (const addOn of offeredAddOnsForPlan(plan, everySlug)) {
        assert.equal(addOn.planKey, plan);
      }
    }
  });

  it("ignores configured slugs that are not in the catalog", () => {
    const offered = offeredAddOnsForPlan("pulse", ["pulse.responses_50", "not.a_real_addon"]);
    assert.deepEqual(
      offered.map((addOn) => addOn.slug),
      ["pulse.responses_50"]
    );
  });

  // The whole point: what the picker totals up can never exceed what the
  // Checkout Session bills, because both are derived from the same map.
  it("never displays an add-on the checkout session would drop", () => {
    const configured = ["core.responses_100", "core.city_3"];
    const displayed = offeredAddOnsForPlan("core", configured).map((addOn) => addOn.slug);
    for (const slug of displayed) {
      assert.ok(configured.includes(slug), `${slug} would be quoted but never billed`);
    }
  });
});
