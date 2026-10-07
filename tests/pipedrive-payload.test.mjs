import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPersonCustomFields } from "../src/lib/pipedrive-payload.ts";

describe("buildPersonCustomFields", () => {
  it("includes job title and website only when keys are present", () => {
    const withKeys = buildPersonCustomFields({
      leadSourceKey: "LS",
      secondaryLeadSourceKey: undefined,
      jobTitleKey: "JT",
      websiteKey: "WS",
      jobTitle: "Head of Insights",
      website: "https://acme.com",
    });
    assert.equal(withKeys.LS, "Jewellery Altilos");
    assert.equal(withKeys.JT, "Head of Insights");
    assert.equal(withKeys.WS, "https://acme.com");

    const noKeys = buildPersonCustomFields({
      leadSourceKey: undefined,
      secondaryLeadSourceKey: undefined,
      jobTitleKey: undefined,
      websiteKey: undefined,
      jobTitle: "Head",
      website: "https://acme.com",
    });
    assert.deepEqual(noKeys, {});
  });

  it("omits website field when website is empty even if key present", () => {
    const out = buildPersonCustomFields({
      leadSourceKey: undefined,
      secondaryLeadSourceKey: undefined,
      jobTitleKey: "JT",
      websiteKey: "WS",
      jobTitle: "Head",
      website: "",
    });
    assert.equal(out.WS, undefined);
    assert.equal(out.JT, "Head");
  });
});
