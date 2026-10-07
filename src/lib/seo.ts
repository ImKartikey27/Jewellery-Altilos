// Metadata fragments shared across route segments.
//
// The constraint that makes this module necessary: segment metadata merges
// SHALLOWLY. A page that defines `openGraph` REPLACES the parent's entire
// openGraph object rather than extending it, so a child setting only
// `openGraph.title` silently drops the site's description, locale and siteName.
// Every page that touches openGraph/twitter must therefore spread these
// fragments rather than rely on inheritance.
//
// Pure data. `import type` from "next" is fully erasable, so this stays
// importable from `tests/*.test.mjs` under `node --experimental-strip-types`.

import type { Metadata } from "next";

import type { LegalDoc } from "./legal/types.ts";
import { SITE_LOCALE, SITE_NAME } from "./site.ts";

export const OG_BASE = {
  siteName: SITE_NAME,
  type: "website",
  locale: SITE_LOCALE,
  // No `images` on purpose. File-based metadata takes priority over the
  // metadata object, so app/opengraph-image.tsx supplies og:image for every
  // route — including ones that replace `openGraph` wholesale. Setting it here
  // would only create a second place for it to go stale.
} as const satisfies Metadata["openGraph"];

export const TWITTER_BASE = {
  card: "summary_large_image",
  // No `site`/`creator`: there is no verified handle in the repo, and a guessed
  // one attributes the page to an account that may belong to someone else.
} as const satisfies Metadata["twitter"];

/**
 * Funnel pages that must never appear in search results.
 *
 * Only effective because robots.ts allows these paths to be CRAWLED — a
 * disallowed page is never fetched, so its noindex is never read, and a
 * disallowed-but-linked URL can still be indexed URL-only. /checkout is linked
 * from a real anchor in PlanCheckoutButton, so the crawl-and-noindex pairing is
 * the only combination that actually keeps it out of the index.
 */
export const NO_INDEX: Metadata = {
  robots: {
    // `noindex`/`nofollow` are typed `never` in this version of Next — the
    // supported spelling is index/follow booleans.
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  // Without this, the root layout's canonical is inherited and these pages
  // declare themselves to be the homepage.
  alternates: { canonical: null },
};

/**
 * Metadata for a legal page.
 *
 * `description` is passed in rather than derived from `doc.subtitle`: the
 * hand-written descriptions on the three legal pages are tuned for search
 * snippets, and deriving them would silently regress all three.
 */
export function legalMetadata(doc: LegalDoc, description: string): Metadata {
  const title = `${doc.titleLead} ${doc.titleRest}`;

  return {
    // Resolves through the root layout's template to "<title> | Altilos".
    title,
    description,
    alternates: { canonical: doc.path },
    openGraph: { ...OG_BASE, title, description, url: doc.path },
    twitter: { ...TWITTER_BASE, title, description },
  };
}
