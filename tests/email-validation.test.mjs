import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { isValidEmail } = await jiti.import("../src/lib/email-validation.ts");

describe("isValidEmail", () => {
  it("accepts ordinary business email addresses", () => {
    assert.equal(isValidEmail("analyst@enterprise.com"), true);
    assert.equal(isValidEmail("first.last+team@company.co"), true);
  });

  it("rejects empty, malformed, and whitespace-padded values", () => {
    assert.equal(isValidEmail(""), false);
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidEmail("person@example"), false);
    assert.equal(isValidEmail(" person@example.com "), false);
  });
});
