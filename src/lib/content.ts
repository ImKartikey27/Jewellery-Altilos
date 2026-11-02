import { formatMinor } from "./money.ts";
import type { SectionId } from "./section-anchors.ts";
import { jewelleryFaqs, jewelleryMetrics, jewellerySteps } from "./jewellery/content.ts";
import { PLAN_PRICING, type PlanKey } from "./plans.ts";

export type NavLink = {
  label: string;
  href: string;
};

export type SectionLink = {
  label: string;
  /** Checked against SECTION_IDS at compile time, so a renamed section id
   *  breaks the build rather than the link. */
  to: SectionId;
};

export type Metric = {
  value: string;
  label: string;
  body: string;
};

export type Step = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
};

// "check" = included · "star" = the headline value this tier unlocks over the
// one below · "excluded" = deliberately shown as missing, to make the gap to the
// next tier legible.
export type PricingFeatureMarker = "check" | "star" | "excluded";

export type PricingFeature = {
  label: string;
  marker: PricingFeatureMarker;
};

export type PricingPlan = {
  key: PlanKey;
  name: string;
  price: string;
  badge?: string;
  responsesNote: string;
  summary: string;
  featuresPrefix?: string;
  features: PricingFeature[];
  tagline: {
    heading: string;
    body: string;
  };
  cta: string;
};

export type Faq = {
  question: string;
  answer: string;
  cta?: {
    label: string;
    to: SectionId;
  };
};

export type FooterContact = {
  label: string;
  href: string;
  icon: "mail" | "phone" | "social";
};

export type ConfirmationCard = {
  icon: "report" | "secure" | "help";
  title: string;
  body: string;
};

export type PartnerLogo = {
  name: string;
  image: string;
};

export const navLinks: SectionLink[] = [
  { label: "How it Works", to: "how-it-works" },
  { label: "Plans", to: "plans" },
  { label: "FAQs", to: "faqs" },
];

export const metrics: Metric[] = jewelleryMetrics;

export const partnerLogos: PartnerLogo[] = [
  { name: "Airbnb", image: "/images/logos/airbnb.png" },
  { name: "BR", image: "/images/logos/br.svg" },
  { name: "inDrive", image: "/images/logos/indrive.png" },
  { name: "Nivea", image: "/images/logos/nivea.png" },
  { name: "Pampers", image: "/images/logos/pampers.png" },
  { name: "Pepsi", image: "/images/logos/pepsi.png" },
];

// The five jewellery step visuals (2000x1333, 3:2).
const STEP_IMAGES = [
  "/steps/jewellery-1.webp",
  "/steps/jewellery-2.webp",
  "/steps/jewellery-3.webp",
  "/steps/jewellery-4.webp",
  "/steps/jewellery-5.webp",
];

// Derived from the jewellery page copy so JSON-LD and llms.txt can never describe
// something other than what the page shows.
export const steps: Step[] = jewellerySteps.map((step, index) => ({
  eyebrow: `Step 0${index + 1}`,
  title: step.title,
  body: step.body,
  image: STEP_IMAGES[index],
}));

// Prices are derived from PLAN_PRICING so the cards, the JSON-LD offers and the
// amount written to the Order row can never drift apart.
function planPrice(key: PlanKey): string {
  return formatMinor(PLAN_PRICING[key].amountMinor, PLAN_PRICING[key].currency);
}

export const pricingPlans: PricingPlan[] = [
  {
    key: "pulse",
    name: "Pulse",
    price: planPrice("pulse"),
    responsesNote: "50 consumers",
    summary: "A fast read on one question before you commit spend.",
    features: [
      { label: "50 verified responses", marker: "check" },
      { label: "Single city", marker: "check" },
      { label: "Age & gender targeting", marker: "check" },
      { label: "Up to 5 questions", marker: "check" },
      { label: "1 competitor mapped", marker: "check" },
      { label: "AI 1-page summary", marker: "check" },
      { label: "Analyst report", marker: "excluded" },
      { label: "Expert call", marker: "excluded" },
      { label: "Under 7-day delivery", marker: "check" },
    ],
    tagline: {
      heading: "AI reads your consumers",
      body: "A fast, self-serve gut-check on one question.",
    },
    cta: "Start With Pulse →",
  },
  {
    key: "core",
    name: "Core",
    price: planPrice("core"),
    badge: "Most popular",
    responsesNote: "200 consumers",
    summary: "Validate a collection, claim or price point with your target buyer.",
    features: [
      { label: "200 verified responses", marker: "check" },
      { label: "Up to 2 cities", marker: "check" },
      { label: "+ income & family targeting", marker: "check" },
      { label: "Up to 7 questions", marker: "check" },
      { label: "Up to 2 competitors mapped", marker: "check" },
      { label: "Analyst-edited report", marker: "star" },
      { label: "Email Q&A with an analyst", marker: "star" },
      { label: "Under 7-day delivery", marker: "check" },
    ],
    tagline: {
      heading: "+ A human analyst",
      body: "The jump from a data point to a decision.",
    },
    cta: "Select Core →",
  },
  {
    key: "core+",
    name: "Core+",
    price: planPrice("core+"),
    badge: "Best value",
    responsesNote: "350 consumers",
    summary: "A competitive read across cities and segments.",
    featuresPrefix: "Everything in Core, plus:",
    features: [
      { label: "350 verified responses", marker: "check" },
      { label: "Advanced segmentation", marker: "check" },
      { label: "Receipts & product images", marker: "star" },
      { label: "Up to 4 competitors mapped", marker: "check" },
      { label: "Action-plan template", marker: "check" },
      { label: "45-min expert call", marker: "star" },
      { label: "Under 7-day delivery", marker: "check" },
    ],
    tagline: {
      heading: "+ Proof & a strategy call",
      body: "Real consumption evidence, turned into a plan.",
    },
    cta: "Choose Core+ →",
  },
  {
    key: "expert",
    name: "Expert",
    price: planPrice("expert"),
    badge: "Full depth",
    responsesNote: "750 consumers",
    summary: "The full landscape plus targeted offers to competitor users.",
    featuresPrefix: "Everything in Core+, plus:",
    features: [
      { label: "750 verified responses", marker: "check" },
      { label: "Up to 4 cities", marker: "check" },
      { label: "Expanded profiling", marker: "check" },
      { label: "High-cap competitor mapping", marker: "check" },
      { label: "Two 1-hour expert sessions", marker: "star" },
      { label: "SmartOffers activation", marker: "star" },
      { label: "Priority delivery", marker: "check" },
    ],
    tagline: {
      heading: "+ The power to act",
      body: "Influence behaviour with SmartOffers, at scale.",
    },
    cta: "Go Expert →",
  },
];

export const faqs: Faq[] = jewelleryFaqs.map((faq) => ({
  question: faq.question,
  answer: faq.answer,
}));

export const confirmationCards: ConfirmationCard[] = [
  {
    icon: "report",
    title: "Your Study Is Being Configured",
    body: "Once you complete your brief, we build your consumer audience and begin collecting zero-party signals from buyers in your target market.",
  },
  {
    icon: "secure",
    title: "Delivered in Under 7 Days",
    body: "Your analyst-verified report arrives within the week. Clear findings, real consumer behaviour, and recommendations you can act on immediately.",
  },
  {
    icon: "help",
    title: "A Human on the Other Side",
    body: "Every study is reviewed by a market expert before it reaches you. Questions along the way go to a real person, not a ticket queue.",
  },
];

export const footerLinks: NavLink[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Security", href: "/security" },
  { label: "Contact", href: "mailto:info@altilos.com" },
];

export const footerContacts: FooterContact[] = [
  { label: "info@altilos.com", href: "mailto:info@altilos.com", icon: "mail" },
  { label: "+1-909-243-4942", href: "tel:+19092434942", icon: "phone" },
];
