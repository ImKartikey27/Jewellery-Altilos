import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  RETURN_TO_PLANS_KEY,
  consumeReturnToPlans,
} from "../src/lib/return-to-plans.ts";

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    holds: (key) => map.has(key),
  };
}

const MARKED = () => fakeStorage({ [RETURN_TO_PLANS_KEY]: "1" });

describe("consumeReturnToPlans", () => {
  it("does not re-anchor when nothing was marked", () => {
    const storage = fakeStorage();
    assert.equal(
      consumeReturnToPlans({ navigationType: "back_forward", storage }),
      false
    );
  });

  it("re-anchors on the plans grid when the visitor came back", () => {
    assert.equal(
      consumeReturnToPlans({ navigationType: "back_forward", storage: MARKED() }),
      true
    );
  });

  // The marker means "the visitor pressed Back out of checkout", not "the
  // visitor reached the home page somehow". Clicking the Altilos brand link on
  // the checkout page is a request for the top of the home page, and honouring
  // the marker there sends them to the plans grid instead.
  it("leaves a fresh navigation alone even when the marker is set", () => {
    assert.equal(
      consumeReturnToPlans({ navigationType: "navigate", storage: MARKED() }),
      false
    );
  });

  it("leaves a reload alone even when the marker is set", () => {
    assert.equal(
      consumeReturnToPlans({ navigationType: "reload", storage: MARKED() }),
      false
    );
  });

  // Clearing unconditionally is the whole reason this is "consume" and not
  // "read": a marker left behind by a modifier-click, or by a visitor who
  // finished paying, would otherwise fire on some unrelated later visit.
  it("clears the marker even when it is not honoured", () => {
    const storage = MARKED();
    consumeReturnToPlans({ navigationType: "navigate", storage });
    assert.equal(storage.holds(RETURN_TO_PLANS_KEY), false);
  });

  it("clears the marker when it is honoured", () => {
    const storage = MARKED();
    consumeReturnToPlans({ navigationType: "back_forward", storage });
    assert.equal(storage.holds(RETURN_TO_PLANS_KEY), false);
  });

  it("treats an unknown navigation type as not a back navigation", () => {
    assert.equal(
      consumeReturnToPlans({ navigationType: undefined, storage: MARKED() }),
      false
    );
  });

  it("degrades quietly when storage is unavailable", () => {
    const hostile = {
      getItem() {
        throw new Error("storage disabled");
      },
      removeItem() {},
    };
    assert.equal(
      consumeReturnToPlans({ navigationType: "back_forward", storage: hostile }),
      false
    );
  });
});
