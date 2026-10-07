import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/Legal/LegalPage";
import { termsDoc } from "@/lib/legal/terms";
import { legalMetadata } from "@/lib/seo";
import { buildLegalGraph } from "@/lib/structured-data";

// Held as a const so the search snippet and the machine-readable description
// cannot drift apart. legalMetadata takes it explicitly rather than deriving it
// from doc.subtitle, which is written for the page header, not for a SERP.
const DESCRIPTION =
  "The Altilos Platform Subscription Terms that govern business access to and use of the Altilos Platform.";

export const metadata: Metadata = legalMetadata(termsDoc, DESCRIPTION);

export default function TermsPage() {
  return (
    <>
      <JsonLd graph={buildLegalGraph(termsDoc, DESCRIPTION)} />
      <LegalPage doc={termsDoc} />
    </>
  );
}
