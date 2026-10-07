import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCheckoutContactCustomFields,
  extractCheckoutContactFields,
} from "../src/lib/checkout-contact-fields.ts";

describe("checkout contact custom fields", () => {
  it("builds required Stripe text custom fields for company and mobile", () => {
    assert.deepEqual(buildCheckoutContactCustomFields(), [
      {
        key: "companyName",
        label: {
          custom: "Company name",
          type: "custom",
        },
        optional: false,
        text: {
          maximum_length: 120,
          minimum_length: 1,
        },
        type: "text",
      },
      {
        key: "mobileNumber",
        label: {
          custom: "Mobile number",
          type: "custom",
        },
        optional: false,
        text: {
          maximum_length: 40,
          minimum_length: 1,
        },
        type: "text",
      },
    ]);
  });

  it("extracts and trims completed checkout contact fields", () => {
    const session = {
      custom_fields: [
        {
          key: "companyName",
          text: {
            value: "  Altilos Labs  ",
          },
          type: "text",
        },
        {
          key: "mobileNumber",
          text: {
            value: "  +1 555 0100  ",
          },
          type: "text",
        },
      ],
    };

    assert.deepEqual(extractCheckoutContactFields(session), {
      companyName: "Altilos Labs",
      mobileNumber: "+1 555 0100",
    });
  });

  it("returns undefined values for legacy sessions without contact fields", () => {
    assert.deepEqual(extractCheckoutContactFields({ custom_fields: [] }), {
      companyName: undefined,
      mobileNumber: undefined,
    });
  });
});
