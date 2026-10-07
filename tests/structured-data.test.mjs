import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { faqs, pricingPlans, steps } from "../src/lib/content.ts";
import { privacyDoc } from "../src/lib/legal/privacy.ts";
import { termsDoc } from "../src/lib/legal/terms.ts";
import { minorToMajor } from "../src/lib/money.ts";
import { PLAN_KEYS, PLAN_PRICING } from "../src/lib/plans.ts";
import {
  buildHomeGraph,
  buildLegalGraph,
  planSlug,
} from "../src/lib/structured-data.ts";

const home = buildHomeGraph();
const byType = (graph, type) => graph.find((node) => node["@type"] === type);

/** Every `{"@id": x}` reference in the graph, however deeply nested. */
function collectRefs(value, refs = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, refs);
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === "@id") {
      refs.add(value["@id"]);
    }
    for (const nested of Object.values(value)) collectRefs(nested, refs);
  }
  return refs;
}

function collectIds(value, ids = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids);
  } else if (value && typeof value === "object") {
    if (typeof value["@id"] === "string" && Object.keys(value).length > 1) {
      ids.add(value["@id"]);
    }
    for (const nested of Object.values(value)) collectIds(nested, ids);
  }
  return ids;
}

describe("entity graph integrity", () => {
  // The test that actually protects "one legible entity". A dangling reference
  // silently degrades the whole graph and nothing else catches it.
  for (const [name, graph] of [
    ["home", home],
    ["privacy", buildLegalGraph(privacyDoc, "d")],
    ["terms", buildLegalGraph(termsDoc, "d")],
  ]) {
    it(`resolves every @id reference in the ${name} graph`, () => {
      const dangling = [...collectRefs(graph)].filter((id) => !collectIds(graph).has(id));
      assert.deepEqual(dangling, []);
    });
  }

  it("defines each top-level @id exactly once", () => {
    const ids = home.map((node) => node["@id"]);
    assert.equal(new Set(ids).size, ids.length, ids.join(", "));
  });

  it("carries the nodes an answer engine needs", () => {
    assert.deepEqual(home.map((node) => node["@type"]), [
      "Organization",
      "WebSite",
      "WebPage",
      "Service",
      "AggregateOffer",
      "ItemList",
      "FAQPage",
    ]);
  });

  it("escapes cleanly into an inline script tag", () => {
    const serialized = JSON.stringify(home).replace(/</g, "\\u003c");
    assert.ok(!serialized.includes("<"));
  });
});

describe("Organization", () => {
  const org = byType(home, "Organization");

  it("declares topical authority", () => {
    assert.ok(org.knowsAbout.length >= 5);
  });

  // An empty sameAs is a claim to have no presence anywhere; absence is silence.
  it("omits sameAs rather than emitting an empty array", () => {
    assert.ok(!("sameAs" in org) || org.sameAs.length > 0);
  });

  // sameAs is the property that resolves the entity, so a relative or
  // malformed URL there is worse than no URL at all.
  it("lists only absolute https profile URLs", () => {
    for (const profile of org.sameAs ?? []) {
      assert.doesNotThrow(() => new URL(profile), profile);
      assert.ok(profile.startsWith("https://"), profile);
    }
    assert.equal(new Set(org.sameAs ?? []).size, (org.sameAs ?? []).length);
  });

  // LocalBusiness and its subtypes want a verifiable address, and there is none.
  it("is not typed as a LocalBusiness", () => {
    assert.equal(org["@type"], "Organization");
  });
});

describe("offers", () => {
  const aggregate = byType(home, "AggregateOffer");

  it("derives every price from the pricing catalog", () => {
    for (const offer of aggregate.offers) {
      const plan = pricingPlans.find((p) => p.name === offer.name);
      const { amountMinor, currency } = PLAN_PRICING[plan.key];
      assert.equal(offer.price, minorToMajor(amountMinor));
      assert.equal(offer.priceCurrency, currency.toUpperCase());
      assert.equal(offer.priceSpecification.valueAddedTaxIncluded, true);
    }
  });

  it("spans the real price ladder", () => {
    assert.equal(aggregate.lowPrice, 8000);
    assert.equal(aggregate.highPrice, 200000);
    assert.equal(aggregate.offerCount, pricingPlans.length);
  });

  it("gives every plan a unique, escaping-safe slug", () => {
    const slugs = PLAN_KEYS.map(planSlug);
    assert.equal(planSlug("core+"), "core-plus");
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) assert.match(slug, /^[a-z-]+$/);
  });
});

describe("FAQPage", () => {
  const faq = byType(home, "FAQPage");

  it("mirrors every visible question and answer exactly", () => {
    assert.equal(faq.mainEntity.length, faqs.length);
    faq.mainEntity.forEach((question, index) => {
      assert.equal(question.name, faqs[index].question);
      // Never the CTA label appended to the answer: Answer.text must match the
      // prose a visitor reads.
      assert.equal(question.acceptedAnswer.text, faqs[index].answer);
    });
  });
});

describe("process list", () => {
  it("mirrors the five steps in order", () => {
    const list = byType(home, "ItemList");
    assert.equal(list.numberOfItems, steps.length);
    assert.deepEqual(
      list.itemListElement.map((item) => item.name),
      steps.map((step) => step.title),
    );
  });
});

describe("unverifiable claims", () => {
  // A standing guard, not a one-off check. Zero reviews have been collected,
  // and fabricated ratings are a manual-action category rather than a grey area.
  it("asserts no ratings or reviews anywhere in the graph", () => {
    const serialized = JSON.stringify(home);
    for (const banned of [
      "aggregateRating",
      "ratingValue",
      "reviewCount",
      '"@type":"Review"',
    ]) {
      assert.ok(!serialized.includes(banned), `graph contains ${banned}`);
    }
  });

  // The logo row is real, but claiming named brands as clients in machine-
  // readable form is a decision to take deliberately, not by accident.
  it("claims no partner brands as clients", () => {
    const serialized = JSON.stringify(home);
    for (const brand of ["Nivea", "Pepsi", "Airbnb", "Pampers", "inDrive"]) {
      assert.ok(!serialized.includes(brand), `graph names ${brand}`);
    }
  });
});

describe("legal graphs", () => {
  it("builds a two-level breadcrumb", () => {
    const graph = buildLegalGraph(privacyDoc, "d");
    const crumbs = byType(graph, "BreadcrumbList").itemListElement;
    assert.deepEqual(crumbs.map((c) => c.position), [1, 2]);
    assert.equal(crumbs[1].name, privacyDoc.breadcrumb);
  });

  it("sends dateModified only where a real date exists", () => {
    assert.equal(
      byType(buildLegalGraph(privacyDoc, "d"), "WebPage").dateModified,
      privacyDoc.lastUpdated.iso,
    );
    // /terms deliberately carries no lastUpdated.
    assert.ok(!("dateModified" in byType(buildLegalGraph(termsDoc, "d"), "WebPage")));
  });
});
