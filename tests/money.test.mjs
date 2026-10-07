import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatMinor, minorToMajor } from "../src/lib/money.ts";

describe("formatMinor", () => {
  // Indian digit grouping is the thing that is easy to get wrong: ₹1,00,000,
  // not ₹100,000. The team email previously used toLocaleString("en-US").
  it("uses Indian lakh grouping for INR", () => {
    assert.equal(formatMinor(10000000, "inr"), "₹1,00,000");
    assert.equal(formatMinor(20000000, "inr"), "₹2,00,000");
  });

  it("formats the plan amounts as shown on the pricing cards", () => {
    assert.equal(formatMinor(800000, "inr"), "₹8,000");
    assert.equal(formatMinor(4000000, "inr"), "₹40,000");
  });

  it("formats add-on amounts", () => {
    assert.equal(formatMinor(250000, "inr"), "₹2,500");
    assert.equal(formatMinor(2800000, "inr"), "₹28,000");
  });

  it("omits fractional paise", () => {
    assert.ok(!formatMinor(800000, "inr").includes("."));
  });

  it("accepts the currency case-insensitively", () => {
    assert.equal(formatMinor(800000, "INR"), formatMinor(800000, "inr"));
  });

  // Historical orders predate the INR migration and keep currency "usd".
  it("still formats legacy USD orders", () => {
    assert.equal(formatMinor(50000, "usd"), "$500");
    assert.equal(formatMinor(200000, "USD"), "$2,000");
  });
});

describe("minorToMajor", () => {
  it("converts paise to rupees", () => {
    assert.equal(minorToMajor(800000), 8000);
    assert.equal(minorToMajor(0), 0);
  });
});
