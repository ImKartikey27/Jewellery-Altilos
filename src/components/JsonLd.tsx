// The single place JSON-LD reaches the DOM.
//
// Inline <script> rather than an external file or a nonce: next.config.ts
// explains why 'unsafe-inline' is in script-src and why a nonce was rejected
// (it would have to be applied per-request from middleware, opting every page
// out of static rendering). The `<` escape is the documented XSS guard for
// JSON passed through dangerouslySetInnerHTML.
//
// One @graph per page, never a node in isolation: every {"@id": ...} reference
// then resolves inside a single JSON value, so a scraper that reads only the
// first ld+json block still gets a complete entity rather than dangling refs.

import type { JsonLdNode } from "@/lib/structured-data";

export function JsonLd({ graph }: { graph: readonly JsonLdNode[] }) {
  const payload = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
