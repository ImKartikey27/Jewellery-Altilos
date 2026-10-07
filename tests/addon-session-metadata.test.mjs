import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADDON_SLUGS_METADATA_KEY,
  formatAddOnSlugMetadata,
  parseAddOnSlugMetadata,
  buildCheckoutSessionMetadata,
} from "../src/lib/addon-session-metadata.ts";
import { reconcileSessionAmounts } from "../src/lib/addon-reconcile.ts";
import { entitlementsFromOrderAddOns } from "../src/lib/addon-entitlements.ts";

describe("formatAddOnSlugMetadata", () => {
  it("returns undefined when nothing was selected", () => {
    assert.equal(formatAddOnSlugMetadata([]), undefined);
  });

  it("joins the selected slugs in the order given", () => {
    assert.equal(
      formatAddOnSlugMetadata(["pulse.responses_50", "pulse.city_2"]),
      "pulse.responses_50,pulse.city_2"
    );
  });

  // Stripe rejects the whole session if a metadata value exceeds 500
  // characters, and a rejected session means the customer cannot pay at all.
  // Dropping the overflow keeps most entitlements recoverable; failing the
  // session to preserve all of them would be a far worse trade.
  it("stops before exceeding Stripe's 500-character metadata limit", () => {
    const long = Array.from({ length: 40 }, (_, i) => `plan.add_on_number_${i}`);
    const value = formatAddOnSlugMetadata(long);

    assert.ok(value.length <= 500, `value was ${value.length} characters`);
    assert.ok(value.startsWith("plan.add_on_number_0,"));
    assert.ok(!value.endsWith(","), "must not leave a trailing separator");
    // Every entry that survived must be whole, never a truncated fragment.
    for (const slug of value.split(",")) {
      assert.ok(long.includes(slug), `"${slug}" is not a complete slug`);
    }
  });

  it("names the metadata key it writes under", () => {
    assert.equal(ADDON_SLUGS_METADATA_KEY, "addOnSlugs");
  });
});

describe("parseAddOnSlugMetadata", () => {
  it("returns nothing when the session carries no selection", () => {
    assert.deepEqual(parseAddOnSlugMetadata(undefined), []);
    assert.deepEqual(parseAddOnSlugMetadata(""), []);
    assert.deepEqual(parseAddOnSlugMetadata("   "), []);
  });

  it("returns nothing when the value is not a string", () => {
    assert.deepEqual(parseAddOnSlugMetadata(42), []);
    assert.deepEqual(parseAddOnSlugMetadata(["pulse.city_2"]), []);
    assert.deepEqual(parseAddOnSlugMetadata(null), []);
  });

  it("recovers the selection from a formatted value", () => {
    assert.deepEqual(parseAddOnSlugMetadata("pulse.responses_50,pulse.city_2"), [
      "pulse.responses_50",
      "pulse.city_2",
    ]);
  });

  // The value is read back off a Stripe object that may predate a catalog
  // change. A stray entry must never invent an entitlement nobody paid for.
  it("drops entries that are not catalog add-on slugs", () => {
    assert.deepEqual(
      parseAddOnSlugMetadata("pulse.responses_50,retired.add_on,,pulse.city_2"),
      ["pulse.responses_50", "pulse.city_2"]
    );
  });

  it("does not let a repeated slug be counted twice", () => {
    assert.deepEqual(
      parseAddOnSlugMetadata("pulse.city_2,pulse.city_2"),
      ["pulse.city_2"]
    );
  });

  it("round-trips a real selection", () => {
    const selection = ["core_plus.smartoffers_pilot", "core_plus.city_extra"];
    assert.deepEqual(parseAddOnSlugMetadata(formatAddOnSlugMetadata(selection)), selection);
  });
});

describe("buildCheckoutSessionMetadata", () => {
  const BASE = { plan: "pulse", planPriceId: "price_PLAN", addOnSlugs: [] };

  it("always carries the plan and its price id", () => {
    const metadata = buildCheckoutSessionMetadata(BASE);
    assert.equal(metadata.plan, "pulse");
    assert.equal(metadata.planPriceId, "price_PLAN");
  });

  it("carries the order id when there is one", () => {
    const metadata = buildCheckoutSessionMetadata({ ...BASE, orderId: "order_1" });
    assert.equal(metadata.orderId, "order_1");
  });

  it("omits the order id rather than writing an empty one", () => {
    assert.ok(!("orderId" in buildCheckoutSessionMetadata(BASE)));
  });

  it("carries the accepted add-on selection", () => {
    const metadata = buildCheckoutSessionMetadata({
      ...BASE,
      addOnSlugs: ["pulse.responses_50", "pulse.city_2"],
    });
    assert.equal(metadata[ADDON_SLUGS_METADATA_KEY], "pulse.responses_50,pulse.city_2");
  });

  it("omits the selection key when no add-ons were bought", () => {
    assert.ok(!(ADDON_SLUGS_METADATA_KEY in buildCheckoutSessionMetadata(BASE)));
  });

  // Every value Stripe stores must be a string; a stray undefined is rejected.
  it("emits only string values", () => {
    const metadata = buildCheckoutSessionMetadata({
      ...BASE,
      orderId: "order_1",
      addOnSlugs: ["pulse.city_2"],
    });
    for (const [key, value] of Object.entries(metadata)) {
      assert.equal(typeof value, "string", `${key} must be a string`);
    }
  });
});

// The two ends of this feature live in different modules and are wired together
// by a string key. A mismatch there would compile, pass every unit test above,
// and silently restore the original bug — so exercise the whole round trip:
// checkout writes the selection, then finalization reads it back on the path
// where the line items never arrived.
describe("checkout to finalization round trip", () => {
  it("still unlocks the purchased questions when line items are unavailable", () => {
    const selection = ["core_plus.smartoffers_pilot", "core_plus.city_extra"];

    // What createHostedSession attaches to the Checkout Session.
    const metadata = buildCheckoutSessionMetadata({
      plan: "core+",
      planPriceId: "price_PLAN_CORE_PLUS",
      orderId: "order_1",
      addOnSlugs: selection,
    });

    // What safeReconcile pulls off the session it receives from the webhook.
    const recovered = parseAddOnSlugMetadata(metadata[ADDON_SLUGS_METADATA_KEY]);

    const result = reconcileSessionAmounts({
      amountTotal: 13_800_000,
      currency: "inr",
      planPriceId: "price_PLAN_CORE_PLUS",
      lineItems: null, // the outage
      reverseMap: new Map(),
      selectedSlugs: recovered,
      fallbackAmountMinor: 10_000_000,
      fallbackCurrency: "inr",
    });

    assert.deepEqual(
      result.addOns.items.map((item) => item.slug),
      selection
    );
    assert.equal(result.addOns.source, "metadata_fallback");
    assert.equal(result.addOns.planAmountMinor, 10_000_000);

    const entitlements = entitlementsFromOrderAddOns(result.addOns);
    assert.ok(entitlements.unlocks.includes("q10_smartOffers"));
    assert.equal(entitlements.forced.q10_smartOffers, "yes");
  });
});
