import type { MetadataRoute } from "next";

import { legalDocs } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";

// `lastModified` is only worth sending when it is TRUE. The previous
// `new Date()` made all four pages claim to have changed on every deploy, and
// Google uses lastmod only where it has learned the value is accurate — an
// always-today value trains it to discount the field permanently. So the legal
// pages send their real `lastUpdated.iso`, /terms deliberately has none and
// omits it, and the home page has no honest content date so it omits it too.
//
// Iterating legalDocs rather than restating three URLs means adding a legal
// page and forgetting the sitemap is no longer possible.
//
// Not listed: /.well-known/security.txt and /llms.txt. A sitemap enumerates
// indexable HTML with search intent; plain-text utility files dilute it.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // absoluteUrl("/") keeps the trailing slash, so this is byte-identical to
      // what metadataBase resolves the home page's canonical to. The old entry
      // used the bare origin and disagreed with the canonical it pointed at.
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...legalDocs.map((doc) => ({
      url: absoluteUrl(doc.path),
      ...(doc.lastUpdated && { lastModified: doc.lastUpdated.iso }),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
