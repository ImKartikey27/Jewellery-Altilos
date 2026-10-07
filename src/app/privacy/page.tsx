import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/Legal/LegalPage";
import { privacyDoc } from "@/lib/legal/privacy";
import { legalMetadata } from "@/lib/seo";
import { buildLegalGraph } from "@/lib/structured-data";

// Held as a const so the search snippet and the machine-readable description
// cannot drift apart. legalMetadata takes it explicitly rather than deriving it
// from doc.subtitle, which is written for the page header, not for a SERP.
const DESCRIPTION =
  "How Altilos, Inc. collects, uses, discloses, and protects personal information across our Services.";

export const metadata: Metadata = legalMetadata(privacyDoc, DESCRIPTION);

export default function PrivacyPage() {
  return (
    <>
      <JsonLd graph={buildLegalGraph(privacyDoc, DESCRIPTION)} />
      <LegalPage doc={privacyDoc} />
    </>
  );
}
