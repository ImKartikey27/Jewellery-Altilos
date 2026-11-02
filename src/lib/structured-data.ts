// The JSON-LD entity graph.
//
// Search engines rank pages; answer engines resolve ENTITIES. The difference is
// why this file exists: a bag of unlinked schema.org objects tells an LLM
// nothing, while a graph whose nodes reference each other by @id resolves to
// one company with one service, one price ladder and one set of answers.
//
// Two rules keep it honest:
//
//   1. Every node is DERIVED from content.ts / plans.ts. Nothing here restates
//      a price, an answer or a step that is rendered elsewhere, so the machine-
//      readable claims cannot drift from the visible ones.
//   2. Nothing is asserted that cannot be verified from this repo. No
//      aggregateRating (zero reviews have been collected), no LocalBusiness
//      (no verifiable address), no SearchAction (no site search), no client
//      list. tests/structured-data.test.mjs enforces the first of those as a
//      standing guard.
//
// Pure data — no `server-only`, no `@/` aliases, relative `.ts` imports — so
// `tests/*.test.mjs` can import it under `node --experimental-strip-types`.

import { faqs, pricingPlans, steps, type PricingPlan } from "./content.ts";
import type { LegalDoc } from "./legal/types.ts";
import { minorToMajor } from "./money.ts";
import { PLAN_PRICING, type PlanKey } from "./plans.ts";
import {
  absoluteUrl,
  CONTENT_LANGUAGE,
  LEGAL_ENTITY_NAME,
  ORG_EMAIL,
  ORG_PHONE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_PROFILES,
} from "./site.ts";

/**
 * A schema.org node. Deliberately loose: schema-dts's `Thing` union fights
 * @graph + @id-reference shapes under `strict`, producing errors that obscure
 * more than they catch. The dangling-@id test in
 * tests/structured-data.test.mjs is the check that actually protects this file.
 */
export type JsonLdNode = Record<string, unknown>;

// --- Identity -------------------------------------------------------------
//
// URI fragments on the canonical origin — the scheme every schema parser and
// every model trained on the open web has seen millions of times. Stable across
// deploys, which is what lets an engine merge today's crawl with last month's.

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_ID = `${SITE_URL}/#logo`;
const HOME_PAGE_ID = `${SITE_URL}/#webpage`;
const SERVICE_ID = `${SITE_URL}/#service`;
const OFFERS_ID = `${SITE_URL}/#offers`;
const FAQ_ID = `${SITE_URL}/#faq`;
const PROCESS_ID = `${SITE_URL}/#process`;

/**
 * A plan key as a URI fragment. "core+" is legal in a fragment but escapes
 * ambiguously, and a collision here would silently merge two Offers — hence a
 * named function with a test rather than an inline replace.
 */
export function planSlug(key: PlanKey): string {
  return key.replace("+", "-plus");
}

function offerId(key: PlanKey): string {
  return `${SITE_URL}/#offer-${planSlug(key)}`;
}

const ref = (id: string) => ({ "@id": id });

// --- Shared nodes ---------------------------------------------------------

// The only schema.org property that lets a company DECLARE topical authority
// in machine-readable form, and precisely what an answer engine reads when it
// builds an entity card. Every entry is a claim the site actually substantiates.
const ORG_KNOWS_ABOUT = [
  "Consumer research for Indian jewellery brands",
  "Zero-party consumer data",
  "Tier 2 and Tier 3 city consumer behaviour in India",
  "Pin-code level consumer insight in India",
  "Lab-grown diamond consumer research in India",
  "Competitor benchmarking for jewellery brands",
  "Custom consumer panel studies in India",
];

// Organization, not LocalBusiness or ProfessionalService: those subtypes want a
// verifiable postal address and geo, and there is none in this repo. Claiming
// one to chase a local pack would be a fabrication with a real downside.
function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: LEGAL_ENTITY_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: absoluteUrl("/brand/altilos-logo.png"),
      contentUrl: absoluteUrl("/brand/altilos-logo.png"),
      width: 1380,
      height: 360,
      caption: SITE_NAME,
    },
    image: ref(LOGO_ID),
    email: ORG_EMAIL,
    telephone: ORG_PHONE,
    areaServed: { "@type": "Country", name: "India" },
    knowsAbout: ORG_KNOWS_ABOUT,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: ORG_EMAIL,
        telephone: ORG_PHONE,
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    ],
    // Omitted rather than emitted empty: an absent property is silence, an
    // empty array is a claim to have no presence anywhere.
    ...(SOCIAL_PROFILES.length > 0 && { sameAs: [...SOCIAL_PROFILES] }),
  };
}

function webSiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: ref(ORG_ID),
    inLanguage: CONTENT_LANGUAGE,
    // No potentialAction/SearchAction: there is no site search, and pointing a
    // sitelinks searchbox at a route that 404s is a fabrication.
  };
}

// --- Home page nodes ------------------------------------------------------

function offerNode(plan: PricingPlan): JsonLdNode {
  const { amountMinor, currency } = PLAN_PRICING[plan.key];
  const price = minorToMajor(amountMinor);
  const priceCurrency = currency.toUpperCase();

  return {
    "@type": "Offer",
    "@id": offerId(plan.key),
    name: plan.name,
    description: plan.summary,
    price,
    priceCurrency,
    availability: "https://schema.org/InStock",
    // The anchor, not /checkout: #plans is indexable content that actually
    // shows this price, which is where a citation should land.
    url: absoluteUrl("/#plans"),
    itemOffered: ref(SERVICE_ID),
    seller: ref(ORG_ID),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency,
      // Displayed amounts are GST-inclusive (see plans.ts). A real, verifiable
      // differentiator against agencies that quote "+ GST".
      valueAddedTaxIncluded: true,
    },
    deliveryLeadTime: {
      "@type": "QuantitativeValue",
      minValue: 3,
      maxValue: 7,
      unitCode: "DAY",
    },
  };
}

function aggregateOfferNode(): JsonLdNode {
  const amounts = pricingPlans.map((plan) =>
    minorToMajor(PLAN_PRICING[plan.key].amountMinor),
  );

  return {
    "@type": "AggregateOffer",
    "@id": OFFERS_ID,
    priceCurrency: "INR",
    lowPrice: Math.min(...amounts),
    highPrice: Math.max(...amounts),
    offerCount: pricingPlans.length,
    offers: pricingPlans.map(offerNode),
    seller: ref(ORG_ID),
  };
}

// Service + AggregateOffer rather than Product: Product guidelines target
// retail, and a Product without reviews earns no merchant rich result anyway.
// These are professional services, and saying so is both valid and honest.
function serviceNode(): JsonLdNode {
  return {
    "@type": "Service",
    "@id": SERVICE_ID,
    name: "Consumer Research and Market Intelligence Reports for Indian Jewellery Brands",
    serviceType: "Consumer research",
    category: "Market research",
    description: SITE_DESCRIPTION,
    provider: ref(ORG_ID),
    areaServed: { "@type": "Country", name: "India" },
    audience: {
      "@type": "BusinessAudience",
      name: "Jewellery brands selling in India",
    },
    termsOfService: absoluteUrl("/terms"),
    mainEntityOfPage: ref(HOME_PAGE_ID),
    offers: ref(OFFERS_ID),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Altilos research plans",
      itemListElement: pricingPlans.map((plan, index) => ({
        "@type": "Offer",
        position: index + 1,
        ...ref(offerId(plan.key)),
      })),
    },
  };
}

// The highest-value node in this file. Seven pre-cleaned question -> answer
// pairs carrying "₹8,000", "3 to 7 days", "Tier 1, Tier 2, and Tier 3",
// "zero-party" and the two competitor names — the exact payload an answer
// engine quotes. Note that Google restricted FAQ RICH RESULTS to government and
// health sites in 2023, so this will never show in a SERP; its value is AEO,
// and measuring it by rich-result impressions will read as failure.
function faqNode(): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": FAQ_ID,
    url: absoluteUrl("/#faqs"),
    isPartOf: ref(WEBSITE_ID),
    about: ref(SERVICE_ID),
    inLanguage: CONTENT_LANGUAGE,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        // faq.answer alone — never the CTA label appended to it. Answer.text
        // must mirror the answer a visitor reads, and a link label is not prose.
        text: faq.answer,
      },
    })),
  };
}

// ItemList, not HowTo: Google deprecated HowTo rich results in 2023, and these
// steps describe how Altilos delivers a study, not a procedure the reader
// performs — using HowTo would be a schema-type misuse.
function processNode(): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": PROCESS_ID,
    name: "How an Altilos study runs",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: steps.length,
    itemListElement: steps.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.title,
      description: step.body,
    })),
  };
}

function homeWebPageNode(): JsonLdNode {
  return {
    "@type": "WebPage",
    "@id": HOME_PAGE_ID,
    url: absoluteUrl("/"),
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    isPartOf: ref(WEBSITE_ID),
    about: ref(ORG_ID),
    primaryImageOfPage: ref(LOGO_ID),
    inLanguage: CONTENT_LANGUAGE,
    mainEntity: ref(SERVICE_ID),
    hasPart: [ref(PROCESS_ID), ref(FAQ_ID)],
  };
}

/**
 * The home page graph.
 *
 * Organization and WebSite are included by construction rather than left to the
 * layout, so it is impossible to ship a page carrying page-level nodes without
 * the entity context they reference.
 */
export function buildHomeGraph(): JsonLdNode[] {
  return [
    organizationNode(),
    webSiteNode(),
    homeWebPageNode(),
    serviceNode(),
    aggregateOfferNode(),
    processNode(),
    faqNode(),
  ];
}

// --- Legal pages ----------------------------------------------------------

export function buildLegalGraph(doc: LegalDoc, description: string): JsonLdNode[] {
  const pageId = `${absoluteUrl(doc.path)}#webpage`;
  const breadcrumbId = `${absoluteUrl(doc.path)}#breadcrumb`;

  return [
    organizationNode(),
    webSiteNode(),
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: doc.breadcrumb,
          item: absoluteUrl(doc.path),
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": pageId,
      url: absoluteUrl(doc.path),
      name: `${doc.titleLead} ${doc.titleRest}`,
      description,
      isPartOf: ref(WEBSITE_ID),
      about: ref(ORG_ID),
      breadcrumb: ref(breadcrumbId),
      inLanguage: CONTENT_LANGUAGE,
      // Omitted on /terms, which deliberately carries no lastUpdated.
      ...(doc.lastUpdated && { dateModified: doc.lastUpdated.iso }),
    },
  ];
}
