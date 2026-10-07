import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/Legal/LegalPage";
import { securityDoc } from "@/lib/legal/security";
import { legalMetadata } from "@/lib/seo";
import { buildLegalGraph } from "@/lib/structured-data";

// Held as a const so the search snippet and the machine-readable description
// cannot drift apart. legalMetadata takes it explicitly rather than deriving it
// from doc.subtitle, which is written for the page header, not for a SERP.
const DESCRIPTION =
  "How Altilos protects your data and payments: Stripe-handled card details, encrypted storage, hardened application defences, and how to report a vulnerability.";

export const metadata: Metadata = legalMetadata(securityDoc, DESCRIPTION);

export default function SecurityPage() {
  return (
    <>
      <JsonLd graph={buildLegalGraph(securityDoc, DESCRIPTION)} />
      <LegalPage doc={securityDoc} />
    </>
  );
}
