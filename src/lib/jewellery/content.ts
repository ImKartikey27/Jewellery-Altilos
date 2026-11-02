// Copy and data for the jewellery landing page. Source: jewellery-landing-copy-v1.
// Every figure comes from the Altilos India Jewellery Consumer Landscape Study
// FY26 (zero-party, n=2,625, May 2026). Do not add numbers that are not in it.

export const JEWELLERY_CATEGORIES = [
  "Fine jewellery",
  "Silver",
  "Lab-grown",
  "Diamond",
  "Gold coins and bars",
  "Other",
] as const;

// ?seg=<key> pre-selects the category in the claim form.
export const JEWELLERY_SEGMENTS: Record<string, { cat: string }> = {
  "lab-grown": { cat: "Lab-grown" },
  silver: { cat: "Silver" },
  diamond: { cat: "Diamond" },
  "fine-jewellery": { cat: "Fine jewellery" },
};

export const jewelleryNavLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Plans", href: "#plans" },
  { label: "FAQs", href: "#faqs" },
];

export const jewelleryMetrics = [
  { label: "Verified jewellery buyers", value: "2,625", body: "Every one a real buyer, checked before they answered." },
  { label: "Behavioural signals", value: "21", body: "Per buyer, from channel to lab-grown intent." },
  { label: "Zero-party", value: "100%", body: "First-hand. None scraped or modelled." },
];

export const jewelleryLogos = [
  { name: "Pampers", image: "/images/logos/pampers.png" },
  { name: "Pepsi", image: "/images/logos/pepsi.png" },
  { name: "Airbnb", image: "/images/logos/airbnb.png" },
  { name: "Baskin Robbins", image: "/images/logos/br.svg" },
  { name: "inDrive", image: "/images/logos/indrive.png" },
  { name: "Nivea", image: "/images/logos/nivea.png" },
];

export const jewelleryHeroCard = {
  title: "Would you choose lab-grown over natural diamonds?",
  rows: [
    { label: "Maybe", value: "48%" },
    { label: "A firm yes", value: "16%" },
    { label: "Top barrier: low resale value", value: "74.6%" },
  ],
  footer: "Altilos zero-party study, n=2,625",
};

// The four findings of the free study, shown inside step 4 (patterns) and step 5 (report).
export const stepPatterns = [
  { stat: "77% · 76%", label: "Choose a jeweller on heritage and relationship, not price (35%)" },
  { stat: "50.2%", label: "Cap a single online purchase at \u20B910,000" },
  { stat: "48%", label: "Say \u201Cmaybe\u201D to lab-grown over natural; 16% a firm yes" },
  { stat: "70.9% vs 33.6%", label: "Gen Z vs older buyers preferring minimalist design" },
];

export const jewelleryProofBand = {
  headline: "Every number has an N, a scope and a source.",
  body: "2,625 verified consumers across Tier 1 (32%), Tier 2 (44%) and Tier 3 (23%) cities. Subgroup gaps tested at p<0.05. Margin of error \u00B11.9 points. Collected first-hand in May 2026. No scraped reviews. No modelled estimates.",
  note: "The sample skews female (78%) and young (48% Gen Z), so findings best represent the mass and mass-premium buyer. A commissioned study sets quotas to your exact target.",
};

export const jewellerySteps = [
  {
    eyebrow: "STEP 01",
    title: "Tell us what you need to know",
    body: "A pricing call. A lab-grown line you aren\u2019t sure about. A competitor taking share and you don\u2019t know why. Bring it in plain language.",
  },
  {
    eyebrow: "STEP 02",
    title: "We build your buyer audience",
    body: "We configure the exact audience: the right consumers, in the right cities, matched to your demographic and behavioural brief. Configuration begins within 24 hours.",
  },
  {
    eyebrow: "STEP 03",
    title: "Verified buyers answer",
    body: "Real jewellery buyers share what they actually buy, in the cities and pin-codes you target. Zero-party signals, not stale databases.",
  },
  {
    eyebrow: "STEP 04",
    title: "Experts and AI refine it",
    body: "Every signal runs through Altilos\u2019s Decision Intelligence system and is reviewed by a market expert. Patterns surface. Noise is removed.",
  },
  {
    eyebrow: "STEP 05",
    title: "You act",
    body: "Your report arrives in 3 to 7 days: analyst-edited, specific to your question, with clear recommendations.",
  },
];

export const jewelleryStepsIntro = {
  headline: "The study maps the category. Your own study maps your market.",
  body: "When the free study raises a question about your brand, your competitors or your cities, this is how we answer it.",
};

export const stepScope = [
  { k: "Respondents", v: "50 to 750" },
  { k: "Locations", v: "Your cities" },
  { k: "Category", v: "Your category" },
  { k: "Ticket size", v: "Your band" },
];
export const stepAudience = [
  { k: "Total buyers", v: "50 to 750" },
  { k: "Locations", v: "Your cities" },
  { k: "Category", v: "Your category" },
  { k: "Ticket size", v: "Your band" },
  { k: "Include competitor buyers", v: "Yes" },
];
export const stepAudFeats = [
  { t: "Verified buyers", d: "Real purchase history in the category" },
  { t: "Targeted geographies", d: "Pin-code level, Tier 1 to 3" },
  { t: "Matched profiles", d: "Demographic and buying behaviour" },
  { t: "Competitive mapping", d: "Buyers of the brands you compete with" },
];
export const stepFeed = [
  { where: "Your city \u00B7 pin-code", what: "Bought: your category \u00B7 ticket band" },
  { where: "Your city \u00B7 pin-code", what: "Considering: lab-grown over natural" },
  { where: "Your city \u00B7 pin-code", what: "Bought: your category \u00B7 gifting" },
  { where: "Your city \u00B7 pin-code", what: "Switched from: a competitor" },
];
export const stepPipeline = [
  { k: "Signals", v: "Collected", hi: false },
  { k: "Noise removed", v: "Filtered", hi: false },
  { k: "Patterns", v: "Surfaced", hi: false },
  { k: "Expert", v: "Reviewed", hi: true },
];
export const stepFindings = [
  "Jewellers are chosen on heritage and relationship, not price",
  "Half cap a single online purchase at \u20B910,000",
  "Nearly half say \u201Cmaybe\u201D to lab-grown over natural",
];
export const stepActions = [
  "Know which trust signal tipped the last purchase",
  "Back online listings with evidence, not faster delivery",
  "Win the maybe: the most winnable lab-grown buyer",
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
    key: "pulse", name: "Pulse", price: "₹8,000", resp: "50 consumers", tag: "A fast read on one question before you commit spend.",
    cta: "Start with Pulse →", footT: "AI reads your consumers", footD: "A fast, self-serve gut-check on one question.",
    feats: [F("50 verified responses"), F("Single city"), F("Age & gender targeting"), F("Up to 5 questions"), F("1 competitor mapped"), F("AI 1-page summary"), F("Analyst report", "d"), F("Expert call", "d"), F("Under 7-day delivery")],
  },
  {
    key: "core", name: "Core", price: "₹40,000", resp: "200 consumers", tag: "Validate a collection, claim or price point with your target buyer.", badge: "Most popular", hi: true,
    cta: "Select Core →", footT: "+ A human analyst", footD: "The jump from a data point to a decision.",
    feats: [F("200 verified responses"), F("Up to 2 cities"), F("+ income & family targeting"), F("Up to 7 questions"), F("Up to 2 competitors mapped"), F("Analyst-edited report", "s"), F("Email Q&A with an analyst", "s"), F("Under 7-day delivery")],
  },
  {
    key: "core+", name: "Core+", price: "₹1,00,000", resp: "350 consumers", tag: "A competitive read across cities and segments.", badge: "Best value", inc: "Everything in Core, plus:",
    cta: "Choose Core+ →", footT: "+ Proof & a strategy call", footD: "Real consumption evidence, turned into a plan.",
    feats: [F("350 verified responses"), F("Advanced segmentation"), F("Receipts & product images", "s"), F("Up to 4 competitors mapped"), F("Action-plan template"), F("45-min expert call", "s"), F("Under 7-day delivery")],
  },
  {
    key: "expert", name: "Expert", price: "₹2,00,000", resp: "750 consumers", tag: "The full landscape plus targeted offers to competitor users.", badge: "Full depth", inc: "Everything in Core+, plus:",
    cta: "Go Expert →", footT: "+ The power to act", footD: "Influence behaviour with SmartOffers, at scale.",
    feats: [F("750 verified responses"), F("Up to 4 cities"), F("Expanded profiling"), F("High-cap competitor mapping"), F("Two 1-hour expert sessions", "s"), F("SmartOffers activation", "s"), F("Priority delivery")],
  },
];

export const jewelleryFaqs: { question: string; answer: string; cta?: { label: string; href: string } }[] = [
  { question: "What is the free study?", answer: "A six-page consumer landscape study of 2,625 verified Indian jewellery buyers. It covers how they choose a jeweller, where they buy, what holds back online and lab-grown purchases, and how Gen Z and older buyers differ.", cta: { label: "Get the free study", href: "#snapshot" } },
  { question: "Who answered the survey?", answer: "2,625 verified consumers in 180 cities and towns across 32 states, in Tier 1 (32%), Tier 2 (44%) and Tier 3 (23%) India. The sample skews female (78%) and young (48% Gen Z), and towards lower and middle incomes (59% earn under \u20B950,000 a month)." },
  { question: "What does \u201Czero-party\u201D mean?", answer: "Every finding comes first-hand from the consumer who answered. Nothing is scraped, scored from reviews or modelled." },
  { question: "How reliable are the numbers?", answer: "Margin of error is \u00B11.9 points at 95% confidence for the full sample. Subgroup comparisons use two-proportion z-tests and are reported only where p<0.05." },
  { question: "Is the study right for my brand?", answer: "It best represents mass and mass-premium buyers. If you sell to affluent bridal buyers aged 25 to 35 in Tier 1 and Tier 2, a commissioned study sets quotas to exactly that group." },
  { question: "What does a custom study cost and how long does it take?", answer: "Pulse starts at \u20B98,000 for 50 consumers. Core is \u20B940,000 (200), Core+ is \u20B91,00,000 (350), Expert is \u20B92,00,000 (750). Reports arrive in 3 to 7 days.", cta: { label: "See the plans", href: "#plans" } },
  { question: "Is it really free?", answer: "Yes. No pitch, no card details. We ask for a work email so we can send it." },
  { question: "What questions can a study answer?", answer: "Which chain\u2019s or family jeweller\u2019s customers will switch to you, and what proof moves them. Whether your lightweight or lab-grown line holds up against what they wear today. What ticket size your buyer will commit online before needing a store visit, by city tier. Which brands and pieces are actually in their jewellery box, verified by photo. Which guarantee or buyback offer converts a browser into a first online purchase." },
];
