import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CHECKOUT_CURRENCY,
  PLAN_KEYS,
  PLAN_PRICING,
  isPlanKey,
} from "../src/lib/plans.ts";

describe("plan pricing", () => {
  // A dropped or extra zero here is the single highest-consequence bug in the
  // INR migration, so pin the exact minor-unit amounts.
  it("prices every plan at the agreed INR amount in paise", () => {
    assert.equal(PLAN_PRICING.pulse.amountMinor, 800000); // ₹8,000
    assert.equal(PLAN_PRICING.core.amountMinor, 4000000); // ₹40,000
    assert.equal(PLAN_PRICING["core+"].amountMinor, 10000000); // ₹1,00,000
    assert.equal(PLAN_PRICING.expert.amountMinor, 20000000); // ₹2,00,000
  });

  it("prices every plan in INR", () => {
    assert.equal(CHECKOUT_CURRENCY, "inr");
    for (const key of PLAN_KEYS) {
      assert.equal(PLAN_PRICING[key].currency, "inr");
    }
  });

  it("uses positive whole-rupee amounts", () => {
    for (const key of PLAN_KEYS) {
      const { amountMinor } = PLAN_PRICING[key];
      assert.ok(Number.isInteger(amountMinor), `${key} must be an integer`);
      assert.ok(amountMinor > 0, `${key} must be positive`);
      assert.equal(amountMinor % 100, 0, `${key} must be whole rupees`);
    }
  });

  it("prices the ladder in strictly ascending order", () => {
    const amounts = PLAN_KEYS.map((key) => PLAN_PRICING[key].amountMinor);
    for (let i = 1; i < amounts.length; i += 1) {
      assert.ok(
        amounts[i] > amounts[i - 1],
        `${PLAN_KEYS[i]} must cost more than ${PLAN_KEYS[i - 1]}`
      );
    }
  });

  it("exposes exactly the four plan keys", () => {
    assert.equal(PLAN_KEYS.length, 4);
    assert.deepEqual([...PLAN_KEYS], ["pulse", "core", "core+", "expert"]);
    assert.deepEqual(Object.keys(PLAN_PRICING).sort(), [...PLAN_KEYS].sort());
  });
});

describe("isPlanKey", () => {
  it("accepts every real plan key", () => {
    for (const key of PLAN_KEYS) {
      assert.equal(isPlanKey(key), true);
    }
  });

  it("rejects near-misses and non-strings", () => {
    // `core_plus` is the SLUG spelling, never a plan key — keep them distinct.
    for (const value of ["core_plus", "Core", "CORE+", "", " pulse", "plus"]) {
      assert.equal(isPlanKey(value), false, `${JSON.stringify(value)} is not a plan key`);
    }
    for (const value of [null, undefined, 0, {}, ["pulse"]]) {
      assert.equal(isPlanKey(value), false);
    }
  });
});
