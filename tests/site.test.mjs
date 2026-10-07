import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { footerContacts } from "../src/lib/content.ts";
import {
  absoluteUrl,
  CANONICAL_ORIGIN,
  COPYRIGHT_YEAR,
  ORG_EMAIL,
  ORG_PHONE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "../src/lib/site.ts";

describe("canonical origin", () => {
  // The guard that would have caught the live bug this pass fixed: the deployed
  // NEXT_PUBLIC_BASE_URL pointed at a *.vercel.app preview domain, so every
  // canonical, og:url and sitemap entry disowned the real site.
  it("is the production domain, not a preview host", () => {
    assert.equal(CANONICAL_ORIGIN, "https://jewellery.altilos.com");
    assert.ok(!CANONICAL_ORIGIN.includes("vercel.app"));
  });

  it("resolves to a bare origin with no trailing slash", () => {
    assert.doesNotThrow(() => new URL(SITE_URL));
    assert.ok(!SITE_URL.endsWith("/"), SITE_URL);
    assert.equal(new URL(SITE_URL).origin, SITE_URL);
  });
});

describe("absoluteUrl", () => {
  const origin = "https://example.test";

  it("keeps exactly one trailing slash on the root", () => {
    assert.equal(absoluteUrl("/", origin), "https://example.test/");
  });

  it("does not add a trailing slash to a path", () => {
    assert.equal(absoluteUrl("/privacy", origin), "https://example.test/privacy");
  });

  // A stray slash would fork every JSON-LD @id across deploys.
  it("collapses a trailing slash on the origin", () => {
    assert.equal(absoluteUrl("/privacy", "https://example.test/"), "https://example.test/privacy");
  });
});

describe("organisation contact details", () => {
  // Drift guard in the same spirit as content-pricing.test.mjs: the structured
  // data must state what the footer actually shows.
  it("match the footer contacts", () => {
    const hrefs = footerContacts.map((contact) => contact.href);
    assert.ok(hrefs.includes(`mailto:${ORG_EMAIL}`), hrefs.join(", "));
    assert.ok(
      hrefs.includes(`tel:${ORG_PHONE.replace(/[^+\d]/g, "")}`),
      hrefs.join(", "),
    );
  });
});

describe("search copy", () => {
  it("keeps the title inside what Google renders", () => {
    assert.ok(SITE_TITLE.length <= 60, `${SITE_TITLE.length} chars`);
  });

  it("keeps the description in the snippet window", () => {
    assert.ok(
      SITE_DESCRIPTION.length >= 120 && SITE_DESCRIPTION.length <= 165,
      `${SITE_DESCRIPTION.length} chars`,
    );
  });

  // The two head terms have to actually be present, or the whole exercise is
  // decoration.
  it("names the category and the market", () => {
    for (const text of [SITE_TITLE, SITE_DESCRIPTION]) {
      assert.match(text, /jewellery/i);
      assert.match(text, /indian?/i);
    }
  });
});

describe("copyright year", () => {
  // Fails the January after a year without a rebuild, which is the reminder.
  it("is the current year", () => {
    assert.equal(COPYRIGHT_YEAR, new Date().getFullYear());
    assert.ok(COPYRIGHT_YEAR >= 2026);
  });
});
