import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ALL_ADD_ON_SLUGS,
  EFFECTS,
  NO_ENTITLEMENTS,
  addOnSlugsFromOrderAddOns,
  entitlementsFromOrderAddOns,
  entitlementsFromSlugs,
} from "../src/lib/addon-entitlements.ts";
import { RESEARCH_QUESTIONS } from "../src/lib/onboarding-questions.ts";

describe("entitlementsFromSlugs", () => {
  // Identity, not deep equality: consumers branch on "did this order change the
  // form at all", and the module promises the SAME frozen object for every
  // no-effect input. deepEqual here would let both early returns be deleted.
  it("returns the NO_ENTITLEMENTS constant itself for an empty list", () => {
    assert.equal(entitlementsFromSlugs([]), NO_ENTITLEMENTS);
  });

  it("returns the NO_ENTITLEMENTS constant itself when no slug is recognised", () => {
    assert.equal(entitlementsFromSlugs(["nope", "pulse.not_real"]), NO_ENTITLEMENTS);
  });

  it("keeps NO_ENTITLEMENTS deeply frozen", () => {
    assert.ok(Object.isFrozen(NO_ENTITLEMENTS));
    assert.ok(Object.isFrozen(NO_ENTITLEMENTS.notes));
    assert.ok(Object.isFrozen(NO_ENTITLEMENTS.unlocks));
    assert.ok(Object.isFrozen(NO_ENTITLEMENTS.required));
    assert.ok(Object.isFrozen(NO_ENTITLEMENTS.forced));
  });

  // The computed path must be as immutable as the constant path, or a consumer
  // mutating `ent` succeeds when add-ons are present and throws when they are not.
  it("freezes the computed result too", () => {
    const ent = entitlementsFromSlugs(["pulse.receipt_images", "pulse.city_2"]);
    assert.notEqual(ent, NO_ENTITLEMENTS);
    assert.ok(Object.isFrozen(ent));
    assert.ok(Object.isFrozen(ent.unlocks));
    assert.ok(Object.isFrozen(ent.required));
    assert.ok(Object.isFrozen(ent.forced));
    assert.ok(Object.isFrozen(ent.notes));
    assert.ok(Object.isFrozen(ent.notes.q4_locations));
  });

  it("unlocks and forces Q7 for the receipt add-ons", () => {
    for (const slug of ["pulse.receipt_images", "core.receipt_images"]) {
      const ent = entitlementsFromSlugs([slug]);
      assert.ok(ent.unlocks.includes("q7_receipts"), slug);
      assert.equal(ent.forced.q7_receipts, "yes", slug);
    }
  });

  it("unlocks and requires Q9 for the expert call add-ons", () => {
    for (const slug of ["pulse.expert_call_30", "core.expert_call_45"]) {
      const ent = entitlementsFromSlugs([slug]);
      assert.ok(ent.unlocks.includes("q9_callWindows"), slug);
      assert.ok(ent.required.includes("q9_callWindows"), slug);
    }
  });

  it("unlocks and forces Q10 for the SmartOffers pilot", () => {
    const ent = entitlementsFromSlugs(["core_plus.smartoffers_pilot"]);
    assert.ok(ent.unlocks.includes("q10_smartOffers"));
    assert.equal(ent.forced.q10_smartOffers, "yes");
  });

  it("requires Q9 and notes it for a second expert session, without unlocking", () => {
    const ent = entitlementsFromSlugs(["core_plus.expert_session_2"]);
    assert.equal(ent.unlocks.includes("q9_callWindows"), false);
    assert.ok(ent.required.includes("q9_callWindows"));
    assert.deepEqual(ent.notes.q9_callWindows, ["Add a 2nd expert session"]);
  });

  it("notes city add-ons on Q4 using the catalog label", () => {
    assert.deepEqual(entitlementsFromSlugs(["pulse.city_2"]).notes.q4_locations, [
      "Add a second city",
    ]);
    assert.deepEqual(entitlementsFromSlugs(["core.city_3"]).notes.q4_locations, [
      "Add a third city",
    ]);
    assert.deepEqual(entitlementsFromSlugs(["core_plus.city_extra"]).notes.q4_locations, [
      "Add an extra city",
    ]);
  });

  // All three competitor add-ons, each asserted on both effects it declares.
  // Covering only one left the other two entries deletable with a green suite.
  it("requires and notes Q8 for every competitor add-on", () => {
    for (const [slug, label] of [
      ["pulse.competitor_2", "Add a 2nd competitor"],
      ["core.competitors_4", "Expand to 4 competitors"],
      ["core_plus.competitors_highcap", "Expand to high-cap competitors"],
    ]) {
      const ent = entitlementsFromSlugs([slug]);
      assert.ok(ent.required.includes("q8_competitors"), slug);
      assert.deepEqual(ent.notes.q8_competitors, [label], slug);
    }
  });

  it("gives response and priority add-ons no form effect", () => {
    const inert = [
      "pulse.responses_50",
      "core.responses_100",
      "core_plus.responses_150",
      "pulse.priority_3day",
      "core.priority_3day",
      "core_plus.priority_3day",
    ];
    assert.equal(entitlementsFromSlugs(inert), NO_ENTITLEMENTS);
  });

  it("unions effects across several add-ons", () => {
    const ent = entitlementsFromSlugs([
      "pulse.receipt_images",
      "pulse.expert_call_30",
      "pulse.competitor_2",
    ]);
    assert.deepEqual([...ent.unlocks].sort(), ["q7_receipts", "q9_callWindows"]);
    assert.deepEqual([...ent.required].sort(), ["q8_competitors", "q9_callWindows"]);
    assert.equal(ent.forced.q7_receipts, "yes");
  });

  it("does not repeat a note for a duplicated slug", () => {
    const once = entitlementsFromSlugs(["pulse.city_2"]);
    const twice = entitlementsFromSlugs(["pulse.city_2", "pulse.city_2"]);
    assert.deepEqual(twice.notes.q4_locations, once.notes.q4_locations);
  });

  it("grants no extra Q6 slots for any add-on in today's catalog", () => {
    assert.equal(entitlementsFromSlugs(ALL_ADD_ON_SLUGS).extraQ6Slots, 0);
  });

  it("ignores non-string junk in the slug list", () => {
    assert.deepEqual(
      entitlementsFromSlugs([null, 42, {}, undefined, "pulse.city_2"]).notes.q4_locations,
      ["Add a second city"]
    );
  });
});

// No catalog add-on grants Q6 slots today, so the accumulator is unreachable
// through EFFECTS. The injected-table seam is how its behaviour — summation and
// duplicate handling — gets tested before an add-on depends on it being right.
describe("entitlementsFromSlugs with an injected effects table", () => {
  const SLOT_GRANTING = {
    "pulse.city_2": { extraQ6Slots: 2 },
    "core.city_3": { extraQ6Slots: 3 },
  };

  it("sums granted slots across add-ons", () => {
    assert.equal(entitlementsFromSlugs(["pulse.city_2"], SLOT_GRANTING).extraQ6Slots, 2);
    assert.equal(
      entitlementsFromSlugs(["pulse.city_2", "core.city_3"], SLOT_GRANTING).extraQ6Slots,
      5
    );
  });

  it("does not double-count a duplicated slot-granting slug", () => {
    assert.equal(
      entitlementsFromSlugs(["pulse.city_2", "pulse.city_2"], SLOT_GRANTING).extraQ6Slots,
      2
    );
  });

  it("treats slot grants as a real effect rather than a no-op", () => {
    assert.notEqual(entitlementsFromSlugs(["pulse.city_2"], SLOT_GRANTING), NO_ENTITLEMENTS);
  });

  it("skips catalog slugs the injected table does not cover", () => {
    assert.equal(
      entitlementsFromSlugs(["pulse.receipt_images"], SLOT_GRANTING),
      NO_ENTITLEMENTS
    );
  });

  it("defaults to the real EFFECTS table when no table is passed", () => {
    assert.deepEqual(
      entitlementsFromSlugs(["pulse.receipt_images"]),
      entitlementsFromSlugs(["pulse.receipt_images"], EFFECTS)
    );
  });
});

const validBlob = {
  v: 1,
  planPriceId: "price_plan",
  planAmountMinor: 800000,
  addOnsAmountMinor: 500000,
  items: [
    {
      slug: "pulse.receipt_images",
      label: "Add receipt & product images",
      priceId: "price_r",
      quantity: 1,
      unitAmountMinor: 500000,
      amountMinor: 500000,
    },
  ],
  unmapped: [],
  source: "line_items",
};

describe("addOnSlugsFromOrderAddOns", () => {
  it("extracts slugs from a valid blob", () => {
    assert.deepEqual(addOnSlugsFromOrderAddOns(validBlob), ["pulse.receipt_images"]);
  });

  it("returns [] for anything unreadable", () => {
    for (const junk of [null, undefined, {}, [], 0, "", "nope", { items: "no" }]) {
      assert.deepEqual(addOnSlugsFromOrderAddOns(junk), [], JSON.stringify(junk));
    }
  });

  it("drops items with a blank or missing slug", () => {
    const blob = {
      ...validBlob,
      items: [
        { slug: "", label: "Mystery", priceId: "p", quantity: 1, unitAmountMinor: 1, amountMinor: 1 },
        { label: "No slug key", amountMinor: 1 },
        ...validBlob.items,
      ],
    };
    assert.deepEqual(addOnSlugsFromOrderAddOns(blob), ["pulse.receipt_images"]);
  });
});

describe("entitlementsFromOrderAddOns", () => {
  it("derives entitlements from a valid blob", () => {
    const ent = entitlementsFromOrderAddOns(validBlob);
    assert.ok(ent.unlocks.includes("q7_receipts"));
    assert.equal(ent.forced.q7_receipts, "yes");
  });

  it("fails closed for a never-reconciled order (null)", () => {
    assert.equal(entitlementsFromOrderAddOns(null), NO_ENTITLEMENTS);
  });

  it("fails closed when the breakdown is unknown (amount_total_only)", () => {
    const unknown = { ...validBlob, source: "amount_total_only", items: [] };
    assert.equal(entitlementsFromOrderAddOns(unknown), NO_ENTITLEMENTS);
  });

  it("fails closed even if an amount_total_only blob somehow carries items", () => {
    const contradictory = { ...validBlob, source: "amount_total_only" };
    assert.equal(entitlementsFromOrderAddOns(contradictory), NO_ENTITLEMENTS);
  });

  it("ignores slugs that are no longer in the catalog", () => {
    const stale = {
      ...validBlob,
      items: [
        { slug: "pulse.retired_addon", label: "Retired", priceId: "p", quantity: 1, unitAmountMinor: 1, amountMinor: 1 },
        ...validBlob.items,
      ],
    };
    const ent = entitlementsFromOrderAddOns(stale);
    assert.ok(ent.unlocks.includes("q7_receipts"));
  });

  it("never throws on malformed input", () => {
    for (const junk of [null, undefined, 0, "", [], { items: null }, { items: [null, 1, "x"] }]) {
      assert.doesNotThrow(() => entitlementsFromOrderAddOns(junk), JSON.stringify(junk));
    }
  });
});

describe("catalog coverage guard", () => {
  it("gives every catalog add-on an EFFECTS entry", () => {
    for (const slug of ALL_ADD_ON_SLUGS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(EFFECTS, slug),
        `${slug} has no EFFECTS entry — decide what it does to the form`
      );
    }
  });

  it("defines no EFFECTS entry for a slug that is not in the catalog", () => {
    for (const slug of Object.keys(EFFECTS)) {
      assert.ok(ALL_ADD_ON_SLUGS.includes(slug), `${slug} is not a catalog add-on`);
    }
  });

  // EFFECTS is exported; an importer able to rewrite an entry would change the
  // form rules for every request in the process.
  it("exposes EFFECTS frozen, entries and all", () => {
    assert.ok(Object.isFrozen(EFFECTS));
    for (const [slug, effect] of Object.entries(EFFECTS)) {
      assert.ok(Object.isFrozen(effect), slug);
      for (const field of ["unlocks", "requires", "notes", "forces"]) {
        if (effect[field]) assert.ok(Object.isFrozen(effect[field]), `${slug}.${field}`);
      }
    }
  });

  it("only references question ids that exist", () => {
    const known = new Set(RESEARCH_QUESTIONS.map((q) => q.id));
    for (const [slug, effect] of Object.entries(EFFECTS)) {
      for (const id of [...(effect.unlocks ?? []), ...(effect.requires ?? []), ...(effect.notes ?? [])]) {
        assert.ok(known.has(id), `${slug} references unknown question ${id}`);
      }
    }
  });

  // A forced answer is only meaningful if the same purchase also makes the
  // question appear. Forcing without unlocking would silently lock an answer the
  // customer never sees.
  it("only forces a question the same add-on also unlocks", () => {
    for (const [slug, effect] of Object.entries(EFFECTS)) {
      for (const id of Object.keys(effect.forces ?? {})) {
        assert.ok(
          (effect.unlocks ?? []).includes(id),
          `${slug} forces ${id} without unlocking it`
        );
      }
    }
  });
});
