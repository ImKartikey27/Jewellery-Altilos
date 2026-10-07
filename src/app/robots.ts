import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_URL } from "@/lib/site";

// robots.txt groups do NOT inherit: the most specific matching User-agent group
// wins outright. A group naming OAI-SearchBot with only "Allow: /" would hand
// that bot every path the "*" group disallows. Every group therefore has to
// repeat the disallow list, which is why these are built rather than written
// out by hand — it is the single most common bug in AI-bot robots.txt files.
const DISALLOWED = ["/api/"];

// Deliberately NOT disallowed: /checkout, /formPage and /confirmPage. Those
// carry `robots: { index: false }` (see lib/seo.ts NO_INDEX), and a noindex is
// only read if the page is fetched. Disallowing them would leave /checkout —
// which is linked from a real anchor in PlanCheckoutButton — eligible for
// URL-only indexing with no way to suppress it.

// Retrieval crawlers: the ones that decide whether ChatGPT, Perplexity, Claude
// and Copilot can quote this site AND LINK BACK TO IT. Allowing these is the
// whole answer-engine play — blocking one forfeits the citation, not merely the
// training.
const AI_RETRIEVAL_AGENTS = [
  "OAI-SearchBot", // OpenAI's search index — the ChatGPT citation path
  "ChatGPT-User", // live fetch during a ChatGPT conversation
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Applebot", // Siri and Spotlight
  "meta-externalagent",
];

// Training-only tokens: no citation path exists for any of these. Allowed on
// purpose — the content IS the marketing, so a model that has read it is the
// point. Note Google-Extended is not a crawler at all, just a Gemini
// training/grounding switch; disallowing it would NOT remove this site from AI
// Overviews, which are served from the ordinary Googlebot crawl.
const AI_TRAINING_AGENTS = [
  "GPTBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

function group(userAgent: string | string[]) {
  return { userAgent, allow: "/", disallow: DISALLOWED };
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      group("*"),
      group(["Googlebot", "Bingbot"]),
      group(AI_RETRIEVAL_AGENTS),
      group(AI_TRAINING_AGENTS),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    // Non-standard and ignored by Google, but it records the canonical origin
    // inside the first file most crawlers fetch.
    host: SITE_URL,
  };
}
