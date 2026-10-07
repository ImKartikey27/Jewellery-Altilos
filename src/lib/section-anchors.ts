// The canonical id of every in-page scroll target on the landing page, and the
// href a ScrollLink must emit for it.
//
// The constraint that keeps this honest: every id here must exist as an `id="…"`
// attribute on a landing-page section, and no ScrollLink may point at an id that
// is not here. tests/section-anchors.test.mjs enforces both by reading the
// component sources, because a renamed section id would otherwise fail silently
// — the link would still render, just scroll nowhere.
//
// Pure data — no `server-only`, no `@/` aliases.

export const SECTION_IDS = [
  "top",
  "how-it-works",
  "email-gate",
  "plans",
  "faqs",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === "string" && (SECTION_IDS as readonly string[]).includes(value);
}

/**
 * The href for a section link.
 *
 * "top" is the document start, i.e. the home page itself — minting "/#top"
 * would create a second URL for the same position, so the brand links stay a
 * plain "/".
 */
export function sectionHref(to: SectionId): string {
  return to === "top" ? "/" : `/#${to}`;
}
