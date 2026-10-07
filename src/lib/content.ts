import { formatMinor } from "./money.ts";
import type { SectionId } from "./section-anchors.ts";
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

export const metrics: Metric[] = [
  {
    value: "6x Faster",
    label: "Decision Velocity",
    body: "Decisions that used to take months\nenabled in days.",
  },
  {
    value: "90% Savings",
    label: "Research Spend",
    body: "Versus traditional research agencies.",
  },
  {
    value: "100% Actionable",
    label: "Intelligence",
    body: "No data dumps.\nOnly intelligence that moves the needle.",
  },
];

export const partnerLogos: PartnerLogo[] = [
  { name: "Airbnb", image: "/images/logos/airbnb.png" },
  { name: "BR", image: "/images/logos/br.svg" },
  { name: "inDrive", image: "/images/logos/indrive.png" },
  { name: "Nivea", image: "/images/logos/nivea.png" },
  { name: "Pampers", image: "/images/logos/pampers.png" },
  { name: "Pepsi", image: "/images/logos/pepsi.png" },
];

export const steps: Step[] = [
  {
    eyebrow: "Step 01",
    title: "Tell us what you need to know",
    body: "A pricing decision before you scale. A new market you are not sure about. A competitor eating into your share and you do not know why. Whatever the business challenge, you bring it to us in plain language.",
    image: "/steps/1.png",
  },
  {
    eyebrow: "Step 02",
    title: "We build your consumer audience",
    body: "We take your challenge and configure the exact audience to answer it. The right consumers, in the right cities, matched to the right demographic and behavioural profile.",
    image: "/steps/2.png",
  },
  {
    eyebrow: "Step 03",
    title: "Consumption behaviour collected exclusively",
    body: "Verified category buyers share actual consumption behaviour in real time, across the exact cities and pin-codes you target. Zero-party signals from people who actually buy your products. No stale databases. No assumptions dressed up as data.",
    image: "/steps/3.png",
  },
  {
    eyebrow: "Step 04",
    title: "Industry experience & proprietary AI do the rest",
    body: "Every signal runs through Altilos's Decision Intelligence system and is reviewed by a market expert before it reaches you. Patterns surface. Noise is removed.",
    image: "/steps/4.png",
  },
  {
    eyebrow: "Step 05",
    title: "You execute",
    body: "Your report arrives in 3 to 7 days. Analyst-edited, specific to your challenge, with clear recommendations you can act on immediately. The decisions you were unsure about, you now make with conviction.",
    image: "/steps/5.png",
  },
];

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
    responsesNote: "50 responses · self-serve",
    summary: "Rapid validation. Self-serve.",
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
    responsesNote: "200 responses",
    summary: "Decision-grade",
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
    responsesNote: "350 responses",
    summary: "Strategic clarity",
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
    responsesNote: "750 responses · priority",
    summary: "The power to act",
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

export const faqs: Faq[] = [
  {
    question:
      "Do you cover Indian skincare specifically, including sub-categories like serums, sunscreen, and men's grooming?",
    answer:
      "Yes. Altilos has active consumer coverage across skincare sub-categories including face wash, serums, sunscreen, moisturisers, men's grooming, and more. Your questions can be targeted to buyers of any specific sub-category or SKU type.",
  },
  {
    question:
      "Can I get research for Tier 2 and Tier 3 Indian cities, not just Metro?",
    answer:
      "Yes, and this is where Altilos is most differentiated. Consumer behaviour in Jaipur, Lucknow, and Coimbatore is materially different from Mumbai and Bangalore. Our panel covers Tier 1, Tier 2, and Tier 3 cities, and every finding can be cut by location (at the pin-code level) so you are not making national decisions on Metro data.",
  },
  {
    question:
      "How is Altilos different from Mintel, Kantar, or any other traditional research agency?",
    answer:
      "Traditional agencies take 6 to 12 weeks and price for enterprise budgets. Altilos delivers in 3 to 7 days from as low as ₹8,000. The data is zero-party, collected directly from verified consumers, not recycled panels or third-party surveys. You get direct consumer signals, not aggregated category reports that were written for someone else's question.",
  },
  {
    question: "What does zero-party data mean and why does it matter?",
    answer:
      "Zero-party data is information consumers share directly and intentionally. No inference, no tracking, no synthetic proxies. When an Altilos respondent answers your question, they are doing so as a real person in your target market who chose to participate. It is the most accurate signal available, and it cannot be replicated from desk research or platform analytics. Zero template fluff, and zero bias.",
  },
  {
    question: "What does the report actually look like?",
    answer:
      "An analyst-edited PDF with clear findings, supporting data, charts, and specific recommendations. Not a data dump. Pulse delivers a 1-page AI-generated summary. Core and above deliver a 5-page analyst-edited report with Q&A access.",
    cta: {
      label: "See a real sample report",
      to: "email-gate",
    },
  },
  {
    question: "How quickly can you start once I brief you?",
    answer:
      "Configuration begins within 24 hours of receiving your brief and targeting approval. Data collection typically runs 2 to 4 days. Report delivery follows within 1 to 2 days of collection completion. Total turnaround is 3 to 7 days from brief.",
  },
  {
    question: "Is this relevant if we are early stage or pre-Series A?",
    answer:
      "Yes. Pulse at ₹8,000 is designed for exactly this. Up to five questions, 50 real consumers, one city, delivered in days. It is the validation study you run before spending commitments, not after. Brands at Seed and Series A use it to de-risk pricing decisions, channel choices, and new SKU launches.",
  },
];

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
