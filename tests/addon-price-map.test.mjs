import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  invertAddOnPriceMap,
  parseAddOnPriceMap,
} from "../src/lib/addon-price-map.ts";

const VALID = JSON.stringify({
  "pulse.responses_50": "price_AAA111",
  "pulse.city_2": "price_BBB222",
});

describe("parseAddOnPriceMap — unset", () => {
  // Unset is how the feature ships dark and how it rolls back. It must be
  // silent, not an error.
  it("treats unset, empty and whitespace as no add-ons offered", () => {
    for (const raw of [undefined, null, "", "   ", "\n\t "]) {
      const { map, errors } = parseAddOnPriceMap(raw);
      assert.equal(map.size, 0);
      assert.deepEqual(errors, []);
    }
  });
});

describe("parseAddOnPriceMap — malformed input", () => {
  it("rejects invalid JSON without throwing", () => {
    const { map, errors } = parseAddOnPriceMap("{not json");
    assert.equal(map.size, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /not valid JSON/);
  });

  it("rejects JSON that is not an object", () => {
    for (const raw of ['["price_A"]', '"price_A"', "42", "null", "true"]) {
      const { map, errors } = parseAddOnPriceMap(raw);
      assert.equal(map.size, 0, `${raw} should yield no entries`);
      assert.equal(errors.length, 1, `${raw} should report one error`);
    }
  });
});

describe("parseAddOnPriceMap — per-entry validation", () => {
  it("accepts well-formed entries", () => {
    const { map, errors } = parseAddOnPriceMap(VALID);
    assert.deepEqual(errors, []);
    assert.equal(map.size, 2);
    assert.equal(map.get("pulse.responses_50"), "price_AAA111");
    assert.equal(map.get("pulse.city_2"), "price_BBB222");
  });

  it("drops unknown slugs but keeps the valid ones", () => {
    const { map, errors } = parseAddOnPriceMap(
      JSON.stringify({
        "pulse.responses_50": "price_AAA111",
        "pulse.not_a_real_addon": "price_BBB222",
      })
    );
    assert.equal(map.size, 1);
    assert.equal(map.get("pulse.responses_50"), "price_AAA111");
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown add-on slug/);
  });

  // Deliberately stricter than resolveCheckoutPriceId: a prod_ id would cost a
  // live products.retrieve() per add-on on the checkout hot path.
  it("rejects prod_ ids with a pointed message", () => {
    const { map, errors } = parseAddOnPriceMap(
      JSON.stringify({ "pulse.responses_50": "prod_AAA111" })
    );
    assert.equal(map.size, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /must use a "price_" id/);
  });

  it("rejects malformed and non-string price ids", () => {
    const { map, errors } = parseAddOnPriceMap(
      JSON.stringify({
        "pulse.responses_50": "pri_AAA111",
        "pulse.city_2": "",
        "pulse.competitor_2": 12345,
        "pulse.priority_3day": null,
      })
    );
    assert.equal(map.size, 0);
    assert.equal(errors.length, 4);
  });

  it("trims surrounding whitespace on price ids", () => {
    const { map, errors } = parseAddOnPriceMap(
      JSON.stringify({ "pulse.responses_50": "  price_AAA111  " })
    );
    assert.deepEqual(errors, []);
    assert.equal(map.get("pulse.responses_50"), "price_AAA111");
  });

  it("accepts a partial map without complaint", () => {
    // 3 of pulse's 6 configured is a valid state, not an error.
    const { map, errors } = parseAddOnPriceMap(
      JSON.stringify({
        "pulse.responses_50": "price_A1",
        "pulse.city_2": "price_B2",
        "pulse.priority_3day": "price_C3",
      })
    );
    assert.equal(map.size, 3);
    assert.deepEqual(errors, []);
  });
});

describe("parseAddOnPriceMap — duplicate price ids", () => {
  // An ambiguous reverse map mis-attributes revenue at reconciliation, which is
  // worse than the add-on simply not being offered.
  it("drops every slug sharing a duplicated price id", () => {
    const { map, errors } = parseAddOnPriceMap(
      JSON.stringify({
        "pulse.responses_50": "price_SHARED",
        "core.responses_100": "price_SHARED",
        "pulse.city_2": "price_UNIQUE",
      })
    );
    assert.equal(map.has("pulse.responses_50"), false);
    assert.equal(map.has("core.responses_100"), false);
    assert.equal(map.get("pulse.city_2"), "price_UNIQUE");
    assert.equal(map.size, 1);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /reused by/);
  });
});

describe("invertAddOnPriceMap", () => {
  it("round-trips a valid map", () => {
    const { map } = parseAddOnPriceMap(VALID);
    const inverted = invertAddOnPriceMap(map);
    assert.equal(inverted.get("price_AAA111"), "pulse.responses_50");
    assert.equal(inverted.get("price_BBB222"), "pulse.city_2");
    assert.equal(inverted.size, map.size);
  });

  it("returns an empty map for an empty input", () => {
    assert.equal(invertAddOnPriceMap(new Map()).size, 0);
  });
});
