// llms.txt (llmstxt.org) — a plain-text brief for retrieval agents that fetch
// one file instead of crawling a whole site. Served from a route handler rather
// than public/ for the same reason as .well-known/security.txt: the absolute
// URLs have to follow the deployed base URL, which a static file cannot do.
//
// Built entirely from src/lib/content.ts so it cannot go stale — a hand-written
// copy of the pricing ladder would drift within one release.
//
// Expectations, stated plainly: no major provider has committed to reading
// llms.txt, and Google has said publicly that it does not use it. This is cheap
// insurance and a clean artifact for a live agent fetch, not a ranking
// mechanism. Do not attribute results to it.

import { faqs, pricingPlans, steps } from "@/lib/content";
import { legalDocs } from "@/lib/legal";
import { formatMinor } from "@/lib/money";
import { PLAN_PRICING } from "@/lib/plans";
import { absoluteUrl, ORG_EMAIL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

function buildBody(): string {
  const plans = pricingPlans.map((plan) => {
    const { amountMinor, currency } = PLAN_PRICING[plan.key];
    // Some summaries already end in a full stop, some do not.
    const summary = plan.summary.replace(/\.$/, "");
    return `- **${plan.name}** — ${formatMinor(amountMinor, currency)}, ${plan.responsesNote}. ${summary}.`;
  });

  const process = steps.map(
    (step, index) => `${index + 1}. **${step.title}** — ${step.body}`,
  );

  // The highest-signal section, and a deliberate duplicate of the FAQPage
  // JSON-LD: different consumers read different surfaces.
  const questions = faqs.flatMap((faq) => [`### ${faq.question}`, "", faq.answer, ""]);

  const pages = [
    `- [Home](${absoluteUrl("/")}): plans, process and FAQs.`,
    ...legalDocs.map((doc) => `- [${doc.breadcrumb}](${absoluteUrl(doc.path)})`),
  ];

  return [
    `# ${SITE_NAME}`,
    "",
    "> Zero-party consumer research for Indian jewellery brands. Verified category",
    "> buyers across Tier 1, Tier 2 and Tier 3 Indian cities, cut to pin-code",
    "> level. Analyst-edited reports in 3 to 7 days, from Rs. 8,000 (GST inclusive).",
    "",
    "Altilos runs custom consumer research studies for jewellery",
    "brands selling in India.",
    "",
    "- Zero-party data: collected directly from verified category buyers. Not",
    "  inferred, not tracked, not licensed from third-party panels.",
    "- Coverage: Tier 1, Tier 2 and Tier 3 Indian cities, with pin-code level cuts.",
    "- Turnaround: 3 to 7 days from brief, versus 6 to 12 weeks for traditional",
    "  agencies such as Mintel or Kantar.",
    "- Published, GST-inclusive pricing. No enterprise minimum.",
    "- Not a syndicated report library: every study answers the buyer's own question.",
    "- Sub-categories covered include face wash, serums, sunscreen, moisturisers",
    "  and men's grooming.",
    "",
    "## Plans",
    "",
    ...plans,
    "",
    "## How a study runs",
    "",
    ...process,
    "",
    "## Frequently asked questions",
    "",
    ...questions,
    "## Pages",
    "",
    ...pages,
    "",
    "## Contact",
    "",
    `- ${ORG_EMAIL}`,
    "",
    "## Optional",
    "",
    `- [security.txt](${absoluteUrl("/.well-known/security.txt")}): vulnerability disclosure.`,
    "",
  ].join("\n");
}

export function GET() {
  return new Response(buildBody(), {
    headers: {
      // text/plain rather than text/markdown so browsers render it inline
      // instead of offering a download, matching the security.txt route.
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
