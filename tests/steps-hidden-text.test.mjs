import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { steps } from "../src/lib/content.ts";

const STEPS_DIR = "src/components/LandingPage/Steps";

function sourcesUnder(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sourcesUnder(path, out);
    else if (/\.tsx?$/.test(entry.name)) out.push([path, readFileSync(path, "utf8")]);
  }
  return out;
}

/** Source with comments removed: these guards are about code, not the prose
 *  explaining why the code looks this way. */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

describe("step content is never hidden text", () => {
  // GSAP's autoAlpha also writes visibility:hidden, which removes the node from
  // the accessibility tree — what Chrome's text extraction and a growing share
  // of rendering crawlers read. This is the regression guard.
  it("uses no autoAlpha anywhere in the components", () => {
    for (const [path, source] of sourcesUnder("src/components")) {
      assert.ok(
        !stripComments(source).includes("autoAlpha"),
        `${path} reintroduced autoAlpha`,
      );
    }
  });

  // An inline style would beat the baseline CSS override, stranding steps 2-5
  // at opacity:0 for reduced-motion and no-JS clients all over again.
  it("declares no inline styles in the Steps components", () => {
    for (const [path, source] of sourcesUnder(STEPS_DIR)) {
      assert.ok(
        !stripComments(source).includes("style={{"),
        `${path} has an inline style`,
      );
    }
  });

  // The two halves of the mechanism must not be deletable independently: the
  // CSS without the flag hides nothing, the flag without the CSS does nothing.
  it("keeps the data-steps-animated flag and its stylesheet in sync", () => {
    assert.match(readFileSync("src/app/globals.css", "utf8"), /data-steps-animated/);
    assert.match(readFileSync("src/app/layout.tsx", "utf8"), /data-steps-animated/);
  });
});

describe("step copy", () => {
  it("still carries the five steps in full", () => {
    assert.equal(steps.length, 5);
    for (const step of steps) {
      assert.ok(step.title.trim().length > 0);
      assert.ok(step.body.trim().length > 0);
    }
  });

  // The phrases that make this section worth extracting at all.
  it("keeps the differentiating language", () => {
    const prose = steps.map((step) => step.body).join(" ");
    for (const phrase of [
      "Zero-party",
      "pin-codes",
      "3 to 7 days",
      "Decision Intelligence",
    ]) {
      assert.ok(prose.includes(phrase), `steps no longer mention "${phrase}"`);
    }
  });
});
