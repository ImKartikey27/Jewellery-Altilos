import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { faqs, navLinks } from "../src/lib/content.ts";
import { SECTION_IDS, isSectionId, sectionHref } from "../src/lib/section-anchors.ts";

const LANDING_DIR = "src/components/LandingPage";

/** Every .tsx under the landing page tree, read as source text. */
function landingSources(dir = LANDING_DIR, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) landingSources(path, out);
    else if (entry.name.endsWith(".tsx")) out.push(readFileSync(path, "utf8"));
  }
  return out;
}

const sources = landingSources().join("\n");

/** Source with comments removed: these guards are about code, not the prose
 *  explaining why the code looks this way. */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}


describe("sectionHref", () => {
  it('keeps "top" as the plain home URL', () => {
    // "/#top" would be a second URL for the same position.
    assert.equal(sectionHref("top"), "/");
  });

  it("emits a crawlable fragment for every other section", () => {
    assert.equal(sectionHref("faqs"), "/#faqs");
    assert.equal(sectionHref("plans"), "/#plans");
  });
});

describe("anchor targets exist", () => {
  // A renamed section id would otherwise fail silently: the link still renders,
  // it just scrolls nowhere.
  it("has a matching id attribute rendered for every section", () => {
    for (const id of SECTION_IDS) {
      assert.ok(sources.includes(`id="${id}"`), `no element renders id="${id}"`);
    }
  });

  it("only links to declared sections", () => {
    for (const link of navLinks) assert.ok(isSectionId(link.to), link.to);
    for (const faq of faqs) {
      if (faq.cta) assert.ok(isSectionId(faq.cta.to), faq.cta.to);
    }
  });
});

describe("ScrollLink emits real hrefs", () => {
  const scrollLink = stripComments(
    readFileSync(`${LANDING_DIR}/ui/ScrollLink.tsx`, "utf8"),
  );

  // The exact regression guard for the bug this replaced: every in-page link
  // rendered href="/", so eight self-links carried eight different anchor texts
  // and none of the section anchors was discoverable.
  it('does not hardcode href="/"', () => {
    assert.ok(!scrollLink.includes('href="/"'));
    assert.ok(scrollLink.includes("sectionHref(to)"));
  });
});
