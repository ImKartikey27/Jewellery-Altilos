// One-shot (idempotent) provisioner for the INR catalog in Stripe.
//
//   npm run setup:stripe          # dry run — shows what it would do
//   npm run setup:stripe -- --apply
//
// Plans: adds an INR Price to each EXISTING plan product and makes it the
// product's default price. The product identity (and its dashboard history) is
// preserved; only the price changes. A Price's currency is immutable, so the
// USD prices cannot be converted and are left active for in-flight sessions.
//
// Add-ons: one Product per catalog entry, each with a single INR Price, per the
// agreed structure. Every add-on gets its own distinct Price so the reverse
// price-id -> slug lookup used at reconciliation stays injective.
//
// Idempotent: objects are tagged with metadata.altilos_slug and matched on it,
// so re-running adopts what already exists instead of duplicating.

import "dotenv/config";

import { ADD_ONS } from "../src/lib/addon-catalog.ts";
import { formatMinor } from "../src/lib/money.ts";
import { PLAN_KEYS, PLAN_PRICING } from "../src/lib/plans.ts";

const APPLY = process.argv.includes("--apply");
const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is not set.");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

async function stripe(path, { method = "GET", form } = {}) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: auth,
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const body = await response.json();
  if (body.error) throw new Error(`${path}: ${body.error.message}`);
  return body;
}

async function listAll(path) {
  const out = [];
  let startingAfter;
  for (;;) {
    const query = new URLSearchParams({ limit: "100" });
    if (startingAfter) query.set("starting_after", startingAfter);
    const page = await stripe(`${path}?${query}`);
    out.push(...page.data);
    if (!page.has_more) return out;
    startingAfter = page.data[page.data.length - 1].id;
  }
}

const PLAN_ENV_VAR = {
  pulse: "STRIPE_PRODUCT_ID_PULSE",
  core: "STRIPE_PRODUCT_ID_CORE",
  "core+": "STRIPE_PRODUCT_ID_CORE_PLUS",
  expert: "STRIPE_PRODUCT_ID_EXPERT",
};

const account = await stripe("/account");
console.log(
  `Account: ${account.settings?.dashboard?.display_name ?? account.id} (${account.id}, ${account.country})`
);
console.log(`Mode:    ${secretKey.includes("_test_") ? "TEST" : "LIVE"}`);
console.log(`Action:  ${APPLY ? "APPLY — objects will be created" : "DRY RUN — nothing will be created"}\n`);

const allPrices = await listAll("/prices");
const allProducts = await listAll("/products");

function findPriceBySlug(slug) {
  return allPrices.find((p) => p.active && p.metadata?.altilos_slug === slug);
}

// ---------------------------------------------------------------- plans -----
console.log("Plans");
const planPriceIds = {};

for (const plan of PLAN_KEYS) {
  const { amountMinor, currency } = PLAN_PRICING[plan];
  const slug = `plan.${plan}`;

  const existing = findPriceBySlug(slug);
  if (existing) {
    planPriceIds[plan] = existing.id;
    console.log(`  = ${plan.padEnd(6)} already provisioned  ${existing.id}`);
    continue;
  }

  // Reuse the product behind the currently-configured USD price.
  const configured = process.env[PLAN_ENV_VAR[plan]];
  let productId = null;

  if (configured?.startsWith("price_")) {
    const current = allPrices.find((p) => p.id === configured);
    productId = typeof current?.product === "string" ? current.product : null;
  } else if (configured?.startsWith("prod_")) {
    productId = configured;
  }

  if (!APPLY) {
    console.log(
      `  + ${plan.padEnd(6)} would add ${formatMinor(amountMinor, currency)} INR price` +
        (productId ? ` to product ${productId}` : " to a NEW product")
    );
    continue;
  }

  const price = await stripe("/prices", {
    method: "POST",
    form: {
      currency,
      unit_amount: String(amountMinor),
      "metadata[altilos_slug]": slug,
      ...(productId
        ? { product: productId }
        : { "product_data[name]": `Altilos ${plan}` }),
    },
  });

  const targetProduct = productId ?? price.product;
  await stripe(`/products/${targetProduct}`, {
    method: "POST",
    form: { default_price: price.id },
  });

  planPriceIds[plan] = price.id;
  console.log(
    `  + ${plan.padEnd(6)} ${price.id}  ${formatMinor(amountMinor, currency)}  (default price on ${targetProduct})`
  );
}

// -------------------------------------------------------------- add-ons -----
console.log("\nAdd-ons");
const addOnPriceIds = {};

for (const addOn of ADD_ONS) {
  const existing = findPriceBySlug(addOn.slug);
  if (existing) {
    addOnPriceIds[addOn.slug] = existing.id;
    console.log(`  = ${addOn.slug.padEnd(30)} already provisioned  ${existing.id}`);
    continue;
  }

  if (!APPLY) {
    console.log(
      `  + ${addOn.slug.padEnd(30)} would create "${addOn.label}" @ ${formatMinor(addOn.amountMinor, addOn.currency)}`
    );
    continue;
  }

  const reusableProduct = allProducts.find(
    (p) => p.active && p.metadata?.altilos_slug === addOn.slug
  );

  const price = await stripe("/prices", {
    method: "POST",
    form: {
      currency: addOn.currency,
      unit_amount: String(addOn.amountMinor),
      "metadata[altilos_slug]": addOn.slug,
      ...(reusableProduct
        ? { product: reusableProduct.id }
        : {
            "product_data[name]": addOn.label,
            "product_data[metadata][altilos_slug]": addOn.slug,
          }),
    },
  });

  addOnPriceIds[addOn.slug] = price.id;
  console.log(
    `  + ${addOn.slug.padEnd(30)} ${price.id}  ${formatMinor(addOn.amountMinor, addOn.currency)}`
  );
}

// ------------------------------------------------------------- env output ---
if (!APPLY) {
  console.log("\nDry run complete. Re-run with --apply to create these objects.");
  process.exit(0);
}

console.log("\n\nPaste these into .env\n");
for (const plan of PLAN_KEYS) {
  if (planPriceIds[plan]) {
    console.log(`${PLAN_ENV_VAR[plan]}="${planPriceIds[plan]}"`);
  }
}
console.log(`STRIPE_ADDON_PRICE_IDS='${JSON.stringify(addOnPriceIds)}'`);
