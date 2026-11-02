import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { validateLeadMagnetSubmissionInput } = await jiti.import(
  "../src/lib/lead-magnet-validation.ts"
);

describe("lead magnet validation", () => {
  it("normalizes valid email and company input", () => {
    assert.deepEqual(
      validateLeadMagnetSubmissionInput({
        email: "  ANALYST@Enterprise.com  ",
        companyName: "  Altilos Labs  ",
      }),
      {
        status: "valid",
        email: "analyst@enterprise.com",
        companyName: "Altilos Labs",
        category: null,
        source: "email-gate",
      }
    );
  });

  it("rejects missing company input", () => {
    assert.deepEqual(
      validateLeadMagnetSubmissionInput({
        email: "analyst@enterprise.com",
        companyName: "   ",
      }),
      { status: "missing_company" }
    );
  });

  it("rejects blank and malformed email input", () => {
    assert.deepEqual(
      validateLeadMagnetSubmissionInput({
        email: "",
        companyName: "Altilos Labs",
      }),
      { status: "invalid_email" }
    );
    assert.deepEqual(
      validateLeadMagnetSubmissionInput({
        email: "not-an-email",
        companyName: "Altilos Labs",
      }),
      { status: "invalid_email" }
    );
  });
});
