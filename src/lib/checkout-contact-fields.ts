import type Stripe from "stripe";

export const checkoutContactFieldKeys = {
  companyName: "companyName",
  mobileNumber: "mobileNumber",
} as const;

export type CheckoutContactFields = {
  companyName?: string;
  mobileNumber?: string;
};

type CompletedCustomField = {
  key: string;
  text?: {
    value?: string | null;
  } | null;
};

type SessionWithCustomFields = {
  custom_fields?: CompletedCustomField[] | null;
};

export function buildCheckoutContactCustomFields(): Stripe.Checkout.SessionCreateParams.CustomField[] {
  return [
    {
      key: checkoutContactFieldKeys.companyName,
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
      key: checkoutContactFieldKeys.mobileNumber,
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
  ];
}

export function extractCheckoutContactFields(
  session: SessionWithCustomFields
): CheckoutContactFields {
  const contactFields: CheckoutContactFields = {
    companyName: undefined,
    mobileNumber: undefined,
  };

  for (const field of session.custom_fields ?? []) {
    if (
      field.key !== checkoutContactFieldKeys.companyName &&
      field.key !== checkoutContactFieldKeys.mobileNumber
    ) {
      continue;
    }

    const value = field.text?.value?.trim();

    if (!value) {
      continue;
    }

    contactFields[field.key] = value;
  }

  return contactFields;
}
