import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { reconcileSessionAmounts } from "../src/lib/addon-reconcile.ts";
import { entitlementsFromOrderAddOns } from "../src/lib/addon-entitlements.ts";

const PLAN_PRICE = "price_PLAN_PULSE";

const REVERSE = new Map([
  ["price_RESP50", "pulse.responses_50"],
  ["price_CITY2", "pulse.city_2"],
]);

function reconcile(overrides) {
  return reconcileSessionAmounts({
    amountTotal: null,
    currency: "inr",
    planPriceId: PLAN_PRICE,
    lineItems: null,
    reverseMap: REVERSE,
    fallbackAmountMinor: 800000,
    fallbackCurrency: "inr",
    ...overrides,
  });
}

// The books must balance on every single fixture.
function assertInvariant(result) {
  const { planAmountMinor, addOnsAmountMinor, unmapped } = result.addOns;
  const unmappedTotal = unmapped.reduce((sum, item) => sum + item.amountMinor, 0);
  assert.equal(
    planAmountMinor + addOnsAmountMinor + unmappedTotal,
    result.amountCents,
    "plan + add-ons + unmapped must equal the charged total"
  );
}

describe("reconcileSessionAmounts — plan only", () => {
  it("records the plan amount and no add-ons", () => {
    const result = reconcile({
      amountTotal: 800000,
      lineItems: [{ priceId: PLAN_PRICE, quantity: 1, amountMinor: 800000 }],
    });

    assert.equal(result.amountCents, 800000);
    assert.equal(result.currency, "inr");
    assert.deepEqual(result.addOns.items, []);
    assert.deepEqual(result.addOns.unmapped, []);
    assert.equal(result.addOns.planAmountMinor, 800000);
    assert.equal(result.addOns.addOnsAmountMinor, 0);
    assert.equal(result.addOns.source, "line_items");
    assertInvariant(result);
  });
});

describe("reconcileSessionAmounts — with add-ons", () => {
  it("attributes each add-on and lifts the charged total", () => {
    const result = reconcile({
      amountTotal: 1500000, // ₹8,000 + ₹3,000 + ₹4,000
      lineItems: [
        { priceId: PLAN_PRICE, quantity: 1, amountMinor: 800000 },
        { priceId: "price_RESP50", quantity: 1, amountMinor: 300000 },
        { priceId: "price_CITY2", quantity: 1, amountMinor: 400000 },
      ],
    });

    assert.equal(result.amountCents, 1500000);
    assert.equal(result.addOns.planAmountMinor, 800000);
    assert.equal(result.addOns.addOnsAmountMinor, 700000);
    assert.equal(result.addOns.items.length, 2);
    assert.deepEqual(
      result.addOns.items.map((item) => item.slug),
      ["pulse.responses_50", "pulse.city_2"]
    );
    assertInvariant(result);
  });

  it("snapshots the catalog label so repricing cannot rewrite history", () => {
    const result = reconcile({
      amountTotal: 1100000,
      lineItems: [
        { priceId: PLAN_PRICE, quantity: 1, amountMinor: 800000 },
        { priceId: "price_RESP50", quantity: 1, amountMinor: 300000 },
      ],
    });

    assert.equal(result.addOns.items[0].label, "Add 50 responses");
    assert.equal(result.addOns.items[0].priceId, "price_RESP50");
  });

  it("splits unit price from line total when quantity is above one", () => {
    const result = reconcile({
      amountTotal: 1400000,
      lineItems: [
        { priceId: PLAN_PRICE, quantity: 1, amountMinor: 800000 },
        { priceId: "price_RESP50", quantity: 2, amountMinor: 600000 },
      ],
    });

    const item = result.addOns.items[0];
    assert.equal(item.quantity, 2);
    assert.equal(item.amountMinor, 600000);
    assert.equal(item.unitAmountMinor, 300000);
    assertInvariant(result);
  });
});

describe("reconcileSessionAmounts — unrecognised line items", () => {
  // Dropping the remainder would silently lose money on the books.
  it("records an unknown price id as unmapped rather than discarding it", () => {
    const result = reconcile({
      amountTotal: 1300000,
      lineItems: [
        { priceId: PLAN_PRICE, quantity: 1, amountMinor: 800000 },
        { priceId: "price_MYSTERY", quantity: 1, amountMinor: 500000 },
      ],
    });

    assert.deepEqual(result.addOns.items, []);
    assert.equal(result.addOns.unmapped.length, 1);
    assert.equal(result.addOns.unmapped[0].priceId, "price_MYSTERY");
    assert.equal(result.addOns.unmapped[0].amountMinor, 500000);
    assertInvariant(result);
  });
});

describe("reconcileSessionAmounts — degraded inputs", () => {
  it("keeps the total but marks the breakdown unknown when line items are unavailable", () => {
    const result = reconcile({ amountTotal: 1500000, lineItems: null });

    assert.equal(result.amountCents, 1500000);
    assert.equal(result.addOns.source, "amount_total_only");
    assert.deepEqual(result.addOns.items, []);
    assertInvariant(result);
  });

  it("falls back to the existing order amount when the session has no total", () => {
    const result = reconcile({ amountTotal: null, lineItems: null });
    assert.equal(result.amountCents, 800000);
  });

  it("falls back to the existing currency when the session has none", () => {
    const result = reconcile({ amountTotal: 800000, currency: null, lineItems: null });
    assert.equal(result.currency, "inr");
  });

  it("lowercases the currency", () => {
    const result = reconcile({ amountTotal: 800000, currency: "INR", lineItems: null });
    assert.equal(result.currency, "inr");
  });

  // Sessions created before planPriceId was added to metadata.
  it("infers the plan line item when the plan price id is unknown", () => {
    const result = reconcile({
      amountTotal: 1100000,
      planPriceId: null,
      lineItems: [
        { priceId: "price_LEGACY_PLAN", quantity: 1, amountMinor: 800000 },
        { priceId: "price_RESP50", quantity: 1, amountMinor: 300000 },
      ],
    });

    assert.equal(result.addOns.planAmountMinor, 800000);
    assert.equal(result.addOns.addOnsAmountMinor, 300000);
    assert.deepEqual(result.addOns.unmapped, []);
    assertInvariant(result);
  });

  it("tolerates null quantities and amounts", () => {
    const result = reconcile({
      amountTotal: 800000,
      lineItems: [
        { priceId: PLAN_PRICE, quantity: null, amountMinor: 800000 },
        { priceId: "price_RESP50", quantity: null, amountMinor: null },
      ],
    });

    assert.equal(result.addOns.items[0].quantity, 1);
    assert.equal(result.addOns.items[0].amountMinor, 0);
    assertInvariant(result);
  });
});

describe("reconcileSessionAmounts — idempotence", () => {
  // Webhook retries, repeated /confirmPage loads and webhook-vs-confirm-page
  // races must all write byte-identical values.
  it("produces identical output when run twice on the same session", () => {
    const input = {
      amountTotal: 1500000,
      lineItems: [
        { priceId: PLAN_PRICE, quantity: 1, amountMinor: 800000 },
        { priceId: "price_RESP50", quantity: 1, amountMinor: 300000 },
        { priceId: "price_CITY2", quantity: 1, amountMinor: 400000 },
      ],
    };

    assert.deepEqual(reconcile(input), reconcile(input));
  });
});

// The failure this guards against: fetchSessionLineItems reports a transient
// Stripe outage by RETURNING NULL rather than throwing, so the "reconciliation
// failed" guard in finalizePaidCheckoutSession never fires and a fabricated
// "bought nothing" row is persisted as observed truth. Nothing revisits it —
// Stripe does not retry a webhook that returned 200, and resolveConfirmationState
// skips finalization for an order that is already PAID — so every entitlement the
// customer paid for is silently and permanently lost.
//
// The selection recorded in session metadata arrives inside the webhook payload,
// so it survives an outage that takes the line items away.
describe("reconcileSessionAmounts — line items unavailable, selection in metadata", () => {
  const SELECTION = ["pulse.responses_50", "pulse.city_2"];
  // 800000 plan + 300000 responses_50 + 400000 city_2
  const CHARGED = 1_500_000;

  it("records the purchased add-ons instead of an empty list", () => {
    const result = reconcile({
      amountTotal: CHARGED,
      lineItems: null,
      selectedSlugs: SELECTION,
    });

    assert.deepEqual(
      result.addOns.items.map((item) => item.slug),
      SELECTION
    );
  });

  it("prices the recovered add-ons from the catalog", () => {
    const result = reconcile({
      amountTotal: CHARGED,
      lineItems: null,
      selectedSlugs: SELECTION,
    });

    assert.equal(result.addOns.addOnsAmountMinor, 700_000);
    assert.equal(result.addOns.planAmountMinor, 800_000);
    assertInvariant(result);
  });

  it("marks the row as recovered so it is not mistaken for an observed breakdown", () => {
    const result = reconcile({
      amountTotal: CHARGED,
      lineItems: null,
      selectedSlugs: SELECTION,
    });

    assert.equal(result.addOns.source, "metadata_fallback");
  });

  it("still reports plan-only when the session carries no selection", () => {
    const result = reconcile({ amountTotal: 800_000, lineItems: null, selectedSlugs: [] });

    assert.equal(result.addOns.source, "amount_total_only");
    assert.deepEqual(result.addOns.items, []);
    assert.equal(result.addOns.planAmountMinor, 800_000);
    assertInvariant(result);
  });

  // Defensive: if the catalog has been repriced upward since the session was
  // created, the derived amounts would overdraw the real total. Keep the slugs
  // (entitlements are the point) but refuse to invent a breakdown that does not
  // balance — the money all belongs to the plan until a human says otherwise.
  it("keeps the slugs but claims no amounts when the catalog exceeds the charge", () => {
    const result = reconcile({
      amountTotal: 500_000,
      lineItems: null,
      selectedSlugs: SELECTION,
    });

    assert.deepEqual(
      result.addOns.items.map((item) => item.slug),
      SELECTION
    );
    assert.equal(result.addOns.addOnsAmountMinor, 0);
    assert.equal(result.addOns.planAmountMinor, 500_000);
    assertInvariant(result);
  });

  it("ignores a metadata selection when the line items did arrive", () => {
    const result = reconcile({
      amountTotal: 1_100_000,
      lineItems: [
        { priceId: PLAN_PRICE, quantity: 1, amountMinor: 800_000 },
        { priceId: "price_RESP50", quantity: 1, amountMinor: 300_000 },
      ],
      selectedSlugs: ["pulse.city_2"],
    });

    assert.equal(result.addOns.source, "line_items");
    assert.deepEqual(
      result.addOns.items.map((item) => item.slug),
      ["pulse.responses_50"]
    );
  });

  // The whole point, end to end: a degraded row must still unlock the form.
  it("preserves the onboarding entitlements the customer paid for", () => {
    const result = reconcile({
      amountTotal: 12_800_000,
      lineItems: null,
      selectedSlugs: ["core_plus.smartoffers_pilot"],
    });

    const entitlements = entitlementsFromOrderAddOns(result.addOns);
    assert.ok(
      entitlements.unlocks.includes("q10_smartOffers"),
      "SmartOffers question must still be unlocked"
    );
    assert.equal(entitlements.forced.q10_smartOffers, "yes");
  });
});
