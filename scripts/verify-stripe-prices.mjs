// Read-only preflight for the Stripe price configuration.
//
//   npm run verify:stripe
//
// Checks every configured plan price and add-on price against the local
// catalog: right currency, right amount, active, one-time. Nothing is created
// or modified.
//
// This preflight matters MORE now than it did under optional_items. Add-ons are
// ordinary line_items, so there is no per-add-on fallback left: an archived,
// mispriced, non-INR or wrong-account add-on price fails the whole Checkout
// Session, plan included. Run it after any Stripe dashboard change and before
// deploying.

import "dotenv/config";

import { ADD_ONS } from "../src/lib/addon-catalog.ts";
import { parseAddOnPriceMap } from "../src/lib/addon-price-map.ts";
import { formatMinor } from "../src/lib/money.ts";
import { PLAN_KEYS, PLAN_PRICING } from "../src/lib/plans.ts";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is not set.");
  process.exit(1);
}

const mode = secretKey.includes("_test_") ? "TEST" : "LIVE";

const PLAN_ENV_VAR = {
  pulse: "STRIPE_PRODUCT_ID_PULSE",
  core: "STRIPE_PRODUCT_ID_CORE",
  "core+": "STRIPE_PRODUCT_ID_CORE_PLUS",
  expert: "STRIPE_PRODUCT_ID_EXPERT",
};

async function retrievePrice(id) {
  const response = await fetch(`https://api.stripe.com/v1/prices/${id}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}` },
  });
  const body = await response.json();
  if (body.error) throw new Error(body.error.message);
  return body;
}

const problems = [];
const notes = [];

function check(label, price, expected) {
  const issues = [];
  if (price.currency !== expected.currency) {
    issues.push(`currency is ${price.currency}, expected ${expected.currency}`);
  }
  if (price.unit_amount !== expected.amountMinor) {
    issues.push(
      `amount is ${price.unit_amount} (${formatMinor(price.unit_amount ?? 0, price.currency)}), expected ${expected.amountMinor} (${formatMinor(expected.amountMinor, expected.currency)})`
    );
  }
  if (price.active !== true) issues.push("price is archived");
  if (price.type !== "one_time") issues.push(`type is ${price.type}, expected one_time`);

  if (issues.length > 0) {
    problems.push(`${label}: ${issues.join("; ")}`);
    return false;
  }
  return true;
}

console.log(`Verifying Stripe prices in ${mode} mode.\n`);

console.log("Plans");
for (const plan of PLAN_KEYS) {
  const envVar = PLAN_ENV_VAR[plan];
  const id = process.env[envVar];

  if (!id) {
    problems.push(`${plan}: ${envVar} is not set`);
    console.log(`  ✗ ${plan.padEnd(6)} ${envVar} is not set`);
    continue;
  }

  if (id.startsWith("prod_")) {
    notes.push(
      `${plan}: ${envVar} is a product id. Point it at a price id to drop a live products.retrieve() from every checkout.`
    );
    console.log(`  ~ ${plan.padEnd(6)} product id, skipped (see notes)`);
    continue;
  }

  try {
    const price = await retrievePrice(id);
    const ok = check(plan, price, PLAN_PRICING[plan]);
    console.log(
      `  ${ok ? "✓" : "✗"} ${plan.padEnd(6)} ${price.currency} ${price.unit_amount}`
    );
  } catch (error) {
    problems.push(`${plan}: ${error.message}`);
    console.log(`  ✗ ${plan.padEnd(6)} ${error.message}`);
  }
}

console.log("\nAdd-ons");
const { map, errors } = parseAddOnPriceMap(process.env.STRIPE_ADDON_PRICE_IDS);
for (const error of errors) problems.push(error);

if (map.size === 0) {
  console.log("  (none configured — checkout will offer no add-ons)");
} else {
  for (const addOn of ADD_ONS) {
    const id = map.get(addOn.slug);
    if (!id) {
      notes.push(`${addOn.slug}: not configured, so it will not be offered`);
      continue;
    }
    try {
      const price = await retrievePrice(id);
      const ok = check(addOn.slug, price, addOn);
      console.log(
        `  ${ok ? "✓" : "✗"} ${addOn.slug.padEnd(30)} ${price.currency} ${price.unit_amount}`
      );
    } catch (error) {
      problems.push(`${addOn.slug}: ${error.message}`);
      console.log(`  ✗ ${addOn.slug.padEnd(30)} ${error.message}`);
    }
  }
}

const configured = ADD_ONS.filter((addOn) => map.has(addOn.slug)).length;
console.log(`\n${configured} of ${ADD_ONS.length} add-ons configured.`);

if (notes.length > 0) {
  console.log("\nNotes");
  for (const note of notes) console.log(`  - ${note}`);
}

if (problems.length > 0) {
  console.log("\nProblems");
  for (const problem of problems) console.log(`  - ${problem}`);
  console.log(`\n${problems.length} problem(s) found.`);
  process.exit(1);
}

console.log("\nAll configured prices look correct.");
