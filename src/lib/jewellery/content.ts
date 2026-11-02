// Copy and data for the jewellery landing page. Source: jewellery-landing-copy-v1.
// Every figure comes from the Altilos India Jewellery Consumer Landscape Study
// FY26 (zero-party, n=2,625, May 2026). Do not add numbers that are not in it.

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
