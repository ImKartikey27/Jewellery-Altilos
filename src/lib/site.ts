// Canonical site identity. Pure data — no `server-only`, no `@/` aliases, no
// non-erasable TS, so `tests/*.test.mjs` can import this under
// `node --experimental-strip-types`. Keep it that way.
//
// Two base-URL policies coexist in this repo and both are right. The metadata
// routes (layout, robots, sitemap, security.txt) fall back to a literal because
// a missing env var must never fail a build — robots.txt and sitemap.xml are
// evaluated at build time and a throw there takes the whole deploy down.
// src/lib/env.ts throws instead, because a post-payment onboarding link sent to
// the wrong origin is a silent, unrecoverable data bug. So the policies stay
// split, and this module owns the only copy of the literal in the repo.

export const CANONICAL_ORIGIN = "https://jewellery.altilos.com";

function resolveOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!raw) return CANONICAL_ORIGIN;

  // Normalised through `.origin` rather than used raw: a trailing slash would
  // produce "//sitemap.xml" once concatenated, and SITE_URL is also embedded in
  // JSON-LD @ids, where a stray slash silently forks the entity identity across
  // deploys. An unparseable value falls back rather than poisoning every URL.
  try {
    return new URL(raw).origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
}

export const SITE_URL: string = resolveOrigin();

/**
 * Absolute URL for a root-relative path. `absoluteUrl("/")` keeps the trailing
 * slash so sitemap entries match byte-for-byte what `metadataBase` resolves
 * `alternates.canonical: "/"` to.
 *
 * `origin` is a parameter so tests can assert the slash handling without
 * depending on ambient env.
 */
export function absoluteUrl(path: string, origin: string = SITE_URL): string {
  return new URL(path, origin).toString();
}

export const SITE_NAME = "Altilos";
export const LEGAL_ENTITY_NAME = "Altilos, Inc.";
export const SITE_LOCALE = "en_IN"; // openGraph.locale
export const CONTENT_LANGUAGE = "en-IN"; // schema.org inLanguage

// Kept here rather than parsed out of content.ts `footerContacts`, which stores
// "mailto:"/"tel:" hrefs. tests/site.test.mjs asserts these still match the
// footer — the same drift guard content-pricing.test.mjs uses for prices.
export const ORG_EMAIL = "info@altilos.com";
export const ORG_PHONE = "+1-909-243-4942";

// Profiles that let an answer engine resolve "Altilos" from an unknown string
// into a verifiable company. This is the property that does the resolving, so
// only URLs that actually exist belong here — an unverified sameAs is a broken
// link inside a machine-readable claim, and the graph omits the property
// entirely rather than emitting [].
export const SOCIAL_PROFILES: readonly string[] = [
  "https://www.linkedin.com/products/rwazi-altilos-a-product",
  "https://www.instagram.com/altilos/",
];

// Env-gated so an unset value never renders an empty <meta>. DNS TXT
// verification in Search Console is preferable — it survives redeploys and
// covers the whole domain — so this is the fallback path, not the default.
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

// Front-loads both head terms inside the first 45 characters, where the click
// weight is. 54 chars total, under the ~60 Google renders.
export const SITE_TITLE = "Consumer Research for Indian Jewellery Brands | Altilos";
export const TITLE_TEMPLATE = "%s | Altilos";

// Four hard, quotable specifics — "zero-party", "Tier 1-3", "3-7 days",
// "₹8,000" — so an answer engine can lift this verbatim instead of paraphrasing
// it away. ASCII hyphens so nothing depends on font glyph coverage.
export const SITE_DESCRIPTION =
  "Zero-party consumer research for Indian jewellery brands. Verified buyers across Tier 1-3 cities, analyst-edited reports in 3-7 days, from ₹8,000.";

// Read at module evaluation, which on a prerendered page means build time. The
// honest trade: it cannot go stale within a deploy, and goes stale only if the
// site is not rebuilt across a New Year — which tests/site.test.mjs catches.
export const COPYRIGHT_YEAR = new Date().getFullYear();
