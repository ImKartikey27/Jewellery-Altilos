import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCheckoutLineItems } from "../src/lib/addon-line-items.ts";

const PRICES = new Map([
  ["pulse.responses_50", "price_pulse_responses"],
  ["pulse.city_2", "price_pulse_city"],
]);

describe("buildCheckoutLineItems", () => {
  it("puts the plan first, then the add-ons", () => {
    const items = buildCheckoutLineItems("price_plan_pulse", ["pulse.responses_50", "pulse.city_2"], PRICES);
    assert.deepEqual(items, [
      { price: "price_plan_pulse", quantity: 1 },
      { price: "price_pulse_responses", quantity: 1 },
      { price: "price_pulse_city", quantity: 1 },
    ]);
  });

  it("returns the plan alone when nothing was selected", () => {
    const items = buildCheckoutLineItems("price_plan_pulse", [], PRICES);
    assert.deepEqual(items, [{ price: "price_plan_pulse", quantity: 1 }]);
  });

  it("skips a slug with no mapped price rather than emitting an undefined price", () => {
    const items = buildCheckoutLineItems("price_plan_pulse", ["pulse.responses_50", "pulse.expert_call_30"], PRICES);
    assert.deepEqual(items, [
      { price: "price_plan_pulse", quantity: 1 },
      { price: "price_pulse_responses", quantity: 1 },
    ]);
  });
});
