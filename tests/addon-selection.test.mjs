import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAddOnSelection, selectionAmountMinor } from "../src/lib/addon-selection.ts";

const PRICES = new Map([
  ["pulse.responses_50", "price_pulse_responses"],
  ["pulse.city_2", "price_pulse_city"],
  ["pulse.priority_3day", "price_pulse_priority"],
  ["core.responses_100", "price_core_responses"],
]);

describe("parseAddOnSelection", () => {
  it("accepts slugs that belong to the plan and have a mapped price", () => {
    const result = parseAddOnSelection("pulse", ["pulse.city_2", "pulse.responses_50"], PRICES);
    assert.deepEqual(result.slugs, ["pulse.responses_50", "pulse.city_2"]);
    assert.deepEqual(result.rejected, []);
  });

  it("returns catalog order, not the order the client sent", () => {
    const result = parseAddOnSelection("pulse", ["pulse.priority_3day", "pulse.responses_50"], PRICES);
    assert.deepEqual(result.slugs, ["pulse.responses_50", "pulse.priority_3day"]);
  });

  it("rejects a slug belonging to a different plan", () => {
    const result = parseAddOnSelection("pulse", ["core.responses_100"], PRICES);
    assert.deepEqual(result.slugs, []);
    assert.deepEqual(result.rejected, ["core.responses_100"]);
  });

  it("rejects an unknown slug", () => {
    const result = parseAddOnSelection("pulse", ["pulse.free_lunch"], PRICES);
    assert.deepEqual(result.slugs, []);
    assert.deepEqual(result.rejected, ["pulse.free_lunch"]);
  });

  it("rejects a catalog slug that has no mapped Stripe price", () => {
    const result = parseAddOnSelection("pulse", ["pulse.expert_call_30"], PRICES);
    assert.deepEqual(result.slugs, []);
    assert.deepEqual(result.rejected, ["pulse.expert_call_30"]);
  });

  it("de-duplicates repeated slugs", () => {
    const result = parseAddOnSelection("pulse", ["pulse.city_2", "pulse.city_2"], PRICES);
    assert.deepEqual(result.slugs, ["pulse.city_2"]);
    assert.deepEqual(result.rejected, []);
  });

  it("ignores non-string entries", () => {
    const result = parseAddOnSelection("pulse", [42, null, "pulse.city_2"], PRICES);
    assert.deepEqual(result.slugs, ["pulse.city_2"]);
  });

  it("treats undefined and an empty list as no add-ons", () => {
    assert.deepEqual(parseAddOnSelection("pulse", undefined, PRICES).slugs, []);
    assert.deepEqual(parseAddOnSelection("pulse", [], PRICES).slugs, []);
  });

  it("offers nothing for expert, which has no add-ons", () => {
    const result = parseAddOnSelection("expert", ["pulse.city_2"], PRICES);
    assert.deepEqual(result.slugs, []);
    assert.deepEqual(result.rejected, ["pulse.city_2"]);
  });
});

describe("selectionAmountMinor", () => {
  it("sums the plan and the selected add-ons in minor units", () => {
    // pulse 800_000 + responses_50 300_000 + city_2 400_000
    assert.equal(selectionAmountMinor("pulse", ["pulse.responses_50", "pulse.city_2"]), 1_500_000);
  });

  it("returns the bare plan amount when nothing is selected", () => {
    assert.equal(selectionAmountMinor("pulse", []), 800_000);
  });

  it("ignores a slug that is not in the catalog", () => {
    assert.equal(selectionAmountMinor("pulse", ["nope"]), 800_000);
  });
});
