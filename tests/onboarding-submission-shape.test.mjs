import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sanitizeSubmissionPayload } from "../src/lib/onboarding-payload.ts";

describe("sanitizeSubmissionPayload", () => {
  it("nulls empty optional contact fields and preserves the brief", () => {
    const out = sanitizeSubmissionPayload({
      fullName: "Jane",
      workEmail: "j@x.com",
      jobTitle: "Head",
      companyName: "Acme",
      companyWebsite: "",
      phoneNumber: "  ",
      termsAccepted: true,
      researchBrief: { q1_challenge: "x" },
    });
    assert.equal(out.companyWebsite, null);
    assert.equal(out.phoneNumber, null);
    assert.equal(out.researchBrief.q1_challenge, "x");
  });
});
