// Content model for the long-form legal pages (/terms, /privacy).
//
// Body text supports two inline conventions, rendered by <Inline /> in
// components/Legal/LegalPage.tsx:
//   **term**        -> emphasised lead-in, e.g. the "Account Information." that
//                      opens each bullet in the privacy notice
//   [label](href)   -> link; http(s) hrefs open in a new tab

export type LegalBlock =
  | { kind: "p"; text: string }
  // Lettered subheading inside a numbered section, e.g. "A. Personal
  // Information You Provide to Us Directly".
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  // A grid. `head[0]` labels the row. `cells` controls the remaining columns:
  // "mark" (default) centres and accents them, for tick grids like the Annex A
  // lawful-basis table; "text" left-aligns them as ordinary prose.
  | {
      kind: "table";
      head: string[];
      rows: string[][];
      cells?: "mark" | "text";
    };

export type LegalSection = {
  /** Anchor id, also the TOC target. */
  id: string;
  /** Numbered heading as displayed, e.g. "2. Platform, Access and Use". */
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  /**
   * Canonical route. The single source for three things that used to hold
   * separate copies of the same literal: the page's `alternates.canonical`,
   * the BreadcrumbList item URL, and the sitemap entry. Adding a legal page
   * and forgetting the sitemap is not possible once it is registered in
   * legal/index.ts.
   */
  path: "/privacy" | "/terms" | "/security";
  /** Trailing breadcrumb label, e.g. "General Terms". */
  breadcrumb: string;
  /** Uppercase kicker above the title, e.g. "TERMS & CONDITIONS". */
  eyebrow: string;
  /** Title split across two weights: light lead, bold remainder. */
  titleLead: string;
  titleRest: string;
  subtitle: string;
  /** Rendered as a <time> under the subtitle. Omitted on the terms page. */
  lastUpdated?: { iso: string; label: string };
  /** Preamble shown above the first numbered section. */
  intro: LegalBlock[];
  sections: LegalSection[];
  /** "Need help?" card in the sticky sidebar. */
  help: { body: string; email: string };
  related: { label: string; href: string }[];
};
