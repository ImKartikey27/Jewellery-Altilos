import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseTeamRecipients } from "../src/lib/team-recipients.ts";

describe("parseTeamRecipients", () => {
  it("splits, trims, and drops empties", () => {
    assert.deepEqual(parseTeamRecipients("a@x.com, b@y.com ,, c@z.com"), [
      "a@x.com",
      "b@y.com",
      "c@z.com",
    ]);
  });
  it("returns [] for undefined/empty", () => {
    assert.deepEqual(parseTeamRecipients(undefined), []);
    assert.deepEqual(parseTeamRecipients("  "), []);
  });
});
