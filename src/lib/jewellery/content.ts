// Copy and data for the jewellery landing page (/jewellery). Deliberately a
// separate module from lib/content.ts so the skincare page is untouched.
// Bracketed values like [N] and [cities] are placeholders from the design
// until verified numbers are supplied.

export const JEWELLERY_CATEGORIES = ["Lab-grown & fine", "Demi-fine", "Silver & fashion"] as const;
export const JEWELLERY_BANDS = [
  "Under ₹5,000",
  "₹5,000 – ₹25,000",
  "₹25,000 – ₹1,00,000",
  "Above ₹1,00,000",
] as const;

export const JEWELLERY_SEGMENTS: Record<string, { cat: string; line: string }> = {
  "lab-grown": {
    cat: "Lab-grown & fine",
    line: "See which buyers are weighing lab-grown against natural this Dhanteras, by city and ticket size.",
  },
  "demi-fine": {
    cat: "Demi-fine",
    line: "See who is buying demi-fine for Dhanteras gifting, and what they will pay for it.",
  },
  silver: {
    cat: "Silver & fashion",
    line: "See where silver and fashion jewellery buyers shop for Dhanteras, and what moves them up a ticket band.",
  },
};

export const DEFAULT_SEGMENT_LINE =
  "Know who is switching, what they will pay and where they will buy, before Dhanteras.";

export const jewelleryNavLinks = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Plans", href: "#plans" },
  { label: "FAQs", href: "#faqs" },
];

export const jewelleryMetrics = [
  { label: "Decision velocity", value: "6× Faster", body: "Decisions that used to take months\nenabled in days." },
  { label: "Research spend", value: "90% Savings", body: "Versus traditional research agencies." },
  { label: "Intelligence", value: "100% Actionable", body: "No data dumps.\nOnly intelligence that moves the needle." },
];

export const jewelleryLogos = [
  { name: "Pampers", image: "/images/logos/pampers.png" },
  { name: "Pepsi", image: "/images/logos/pepsi.png" },
  { name: "Airbnb", image: "/images/logos/airbnb.png" },
  { name: "Baskin Robbins", image: "/images/logos/br.svg" },
  { name: "inDrive", image: "/images/logos/indrive.png" },
  { name: "Nivea", image: "/images/logos/nivea.png" },
];

export const jewelleryTiers = ["Metro", "Tier 2", "Tier 3"];

export const jewellerySteps = [
  {
    eyebrow: "STEP 01",
    title: "Tell us what you need to know",
    body: "A pricing decision before Dhanteras. A lab-grown line you are not sure about. A competitor eating into your share and you do not know why. Whatever the business challenge, you bring it to us in plain language.",
  },
  {
    eyebrow: "STEP 02",
    title: "We build your consumer audience",
    body: "We take your challenge and configure the exact audience to answer it. The right consumers, in the right cities, matched to the right demographic and behavioural profile.",
  },
  {
    eyebrow: "STEP 03",
    title: "Consumption behaviour collected exclusively",
    body: "Verified jewellery buyers share actual purchase behaviour in real time, across the exact cities and pin-codes you target. Zero-party signals from people who actually buy your category. No stale databases. No assumptions dressed up as data.",
  },
  {
    eyebrow: "STEP 04",
    title: "Industry experience & proprietary AI do the rest",
    body: "Every signal runs through Altilos's Decision Intelligence system and is reviewed by a market expert before it reaches you. Patterns surface. Noise is removed.",
  },
  {
    eyebrow: "STEP 05",
    title: "You execute",
    body: "Your report arrives in 3 to 7 days. Analyst-edited, specific to your challenge, with clear recommendations you can act on immediately. The decisions you were unsure about, you now make with conviction.",
  },
];

export const stepScope = [
  { k: "Respondents", v: "[N]" },
  { k: "Locations", v: "[cities]" },
  { k: "Category", v: "[category]" },
  { k: "Ticket size", v: "[band]" },
];
export const stepAudience = [
  { k: "Total buyers", v: "[N]" },
  { k: "Locations", v: "[cities]" },
  { k: "Category", v: "[category]" },
  { k: "Ticket size", v: "[band]" },
  { k: "Purchase window", v: "Dhanteras 2026" },
  { k: "Include competitor buyers", v: "Yes" },
];
export const stepAudFeats = [
  { t: "Verified buyers", d: "Real purchase history in the category" },
  { t: "Targeted geographies", d: "Pin-code level, Tier 1 to 3" },
  { t: "Matched profiles", d: "Demographic and buying behaviour" },
  { t: "Competitive mapping", d: "Buyers of the brands you compete with" },
];
export const stepFeed = [
  { where: "[city] · [pin-code]", what: "Bought: [category] · [band]" },
  { where: "[city] · [pin-code]", what: "Considering: lab-grown for Dhanteras" },
  { where: "[city] · [pin-code]", what: "Bought: [category] · gifting" },
  { where: "[city] · [pin-code]", what: "Switched from: [brand]" },
];
export const stepPipeline = [
  { k: "Signals", v: "[N]", hi: false },
  { k: "Noise removed", v: "Filtered", hi: false },
  { k: "Patterns", v: "[n] found", hi: false },
  { k: "Expert", v: "Reviewed", hi: true },
];
export const stepFindings = [
  "[Finding on who is switching to lab-grown]",
  "[Finding on the ticket band they buy at]",
  "[Finding on where they plan to buy]",
];
export const stepActions = [
  "Price [category] at [band] in [city]",
  "Lead festive creative on [trigger]",
  "Stock [SKU] in [cities] by [date]",
];

type Mark = "c" | "s" | "d"; // check · star (headline value) · dash (excluded)
const F = (label: string, k: Mark = "c") => ({ label, k });

export type JewelleryPlan = {
  key: "pulse" | "core" | "core+" | "expert";
  name: string;
  price: string;
  resp: string;
  tag: string;
  badge?: string;
  hi?: boolean;
  inc?: string;
  cta: string;
  footT: string;
  footD: string;
  feats: { label: string; k: Mark }[];
};

export const jewelleryPlans: JewelleryPlan[] = [
  {
    key: "pulse", name: "Pulse", price: "₹8,000", resp: "50 responses · self-serve", tag: "Rapid validation. Self-serve.",
    cta: "Start with Pulse →", footT: "AI reads your consumers", footD: "A fast, self-serve gut-check on one question.",
    feats: [F("50 verified responses"), F("Single city"), F("Age & gender targeting"), F("Up to 5 questions"), F("1 competitor mapped"), F("AI 1-page summary"), F("Analyst report", "d"), F("Expert call", "d"), F("Under 7-day delivery")],
  },
  {
    key: "core", name: "Core", price: "₹40,000", resp: "200 responses", tag: "Decision-grade", badge: "Most popular", hi: true,
    cta: "Select Core →", footT: "+ A human analyst", footD: "The jump from a data point to a decision.",
    feats: [F("200 verified responses"), F("Up to 2 cities"), F("+ income & family targeting"), F("Up to 7 questions"), F("Up to 2 competitors mapped"), F("Analyst-edited report", "s"), F("Email Q&A with an analyst", "s"), F("Under 7-day delivery")],
  },
  {
    key: "core+", name: "Core+", price: "₹1,00,000", resp: "350 responses", tag: "Strategic clarity", badge: "Best value", inc: "Everything in Core, plus:",
    cta: "Choose Core+ →", footT: "+ Proof & a strategy call", footD: "Real consumption evidence, turned into a plan.",
    feats: [F("350 verified responses"), F("Advanced segmentation"), F("Receipts & product images", "s"), F("Up to 4 competitors mapped"), F("Action-plan template"), F("45-min expert call", "s"), F("Under 7-day delivery")],
  },
  {
    key: "expert", name: "Expert", price: "₹2,00,000", resp: "750 responses · priority", tag: "The power to act", badge: "Full depth", inc: "Everything in Core+, plus:",
    cta: "Go Expert →", footT: "+ The power to act", footD: "Influence behaviour with SmartOffers, at scale.",
    feats: [F("750 verified responses"), F("Up to 4 cities"), F("Expanded profiling"), F("High-cap competitor mapping"), F("Two 1-hour expert sessions", "s"), F("SmartOffers activation", "s"), F("Priority delivery")],
  },
];

export const jewelleryFaqs: { question: string; answer: string }[] = [
  { question: "Do you cover Indian jewellery specifically, including lab-grown, demi-fine and silver?", answer: "Yes. Your questions can be targeted to buyers of a specific jewellery sub-category, material or ticket-size band, so you hear from the people who actually buy what you sell." },
  { question: "Can I get research for Tier 2 and Tier 3 Indian cities, not just Metro?", answer: "Yes, and this is where Altilos is most differentiated. Consumer behaviour in Jaipur, Lucknow, and Coimbatore is materially different from Mumbai and Bangalore. Our panel covers Tier 1, Tier 2, and Tier 3 cities, and every finding can be cut by location (at the pin-code level) so you are not making national decisions on Metro data." },
  { question: "How is Altilos different from Nielsen, Kantar, or any other traditional research agency?", answer: "Traditional agencies take 6 to 12 weeks and price for enterprise budgets. Altilos delivers in 3 to 7 days. The data is zero-party, collected directly from verified consumers, not recycled panels or third-party surveys. You get direct consumer signals, not aggregated category reports that were written for someone else's question." },
  { question: "What does zero-party data mean and why does it matter?", answer: "Zero-party data is information consumers share directly and intentionally. No inference, no tracking, no synthetic proxies. When an Altilos respondent answers your question, they are doing so as a real person in your target market who chose to participate. It is the most accurate signal available, and it cannot be replicated from desk research or platform analytics." },
  { question: "What does the report actually look like?", answer: "An analyst-edited PDF with clear findings, supporting data, charts, and specific recommendations. Not a data dump. Pulse delivers a 1-page AI-generated summary. Core and above deliver a 5-page analyst-edited report with Q&A access." },
  { question: "How quickly can you start once I brief you?", answer: "Configuration begins within 24 hours of receiving your brief and targeting approval. Data collection typically runs 2 to 4 days. Report delivery follows within 1 to 2 days of collection completion. Total turnaround is 3 to 7 days from brief." },
  { question: "Is this relevant if we are early stage or pre-Series A?", answer: "Yes. Pulse is designed for exactly this. Up to five questions, 50 real consumers, one city, delivered in days. It is the validation study you run before spending commitments, not after." },
];
