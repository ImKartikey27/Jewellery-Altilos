import type { Metadata } from "next";

import { JewelleryFaq } from "@/components/Jewellery/JewelleryFaq";
import { JewelleryFooter } from "@/components/Jewellery/JewelleryFooter";
import { JewelleryHero } from "@/components/Jewellery/JewelleryHero";
import { JewelleryClosing } from "@/components/Jewellery/JewelleryClosing";
import { JewelleryProof } from "@/components/Jewellery/JewelleryProof";
import { JewelleryHowItWorks } from "@/components/Jewellery/JewelleryHowItWorks";
import { JewelleryLogos } from "@/components/Jewellery/JewelleryLogos";
import { JewelleryNav } from "@/components/Jewellery/JewelleryNav";
import { JewelleryPricing } from "@/components/Jewellery/JewelleryPricing";
import { JewellerySnapshot } from "@/components/Jewellery/JewellerySnapshot";

export const metadata: Metadata = {
  title: { absolute: "India Jewellery Consumer Research Study 2026 | Altilos" },
  description:
    "Free zero-party study of 2,625 verified Indian jewellery buyers across 180 cities and towns. Custom studies for your brand in 3 to 7 days, from ₹8,000.",
  // No `title.absolute`: the layout's default/template do not reach a page in
  // the same segment, so this bare title is the one that renders.
  alternates: { canonical: "/" },
};

type Props = { searchParams: Promise<{ seg?: string; segment?: string }> };

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  // ?seg=lab-grown | silver | diamond | fine-jewellery pre-selects the form category.
  const segment = sp.seg ?? sp.segment;
  return (
    <>
      <main className="min-h-screen bg-black text-white">
        <JewelleryNav />
        <JewelleryHero />
        <JewelleryLogos />
        <JewelleryProof />
        <JewelleryHowItWorks />
        <JewellerySnapshot segment={segment} />
        <JewelleryPricing />
        <JewelleryFaq />
        <JewelleryClosing />
      </main>
      <JewelleryFooter />
    </>
  );
}
