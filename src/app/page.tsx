import type { Metadata } from "next";

import { JewelleryFaq } from "@/components/Jewellery/JewelleryFaq";
import { JewelleryFooter } from "@/components/Jewellery/JewelleryFooter";
import { JewelleryHero } from "@/components/Jewellery/JewelleryHero";
import { JewelleryHowItWorks } from "@/components/Jewellery/JewelleryHowItWorks";
import { JewelleryLogos } from "@/components/Jewellery/JewelleryLogos";
import { JewelleryNav } from "@/components/Jewellery/JewelleryNav";
import { JewelleryPricing } from "@/components/Jewellery/JewelleryPricing";
import { JewellerySnapshot } from "@/components/Jewellery/JewellerySnapshot";

export const metadata: Metadata = {
  title: { absolute: "Indian Jewellery Consumer Research in 7 Days | Altilos" },
  description:
    "Personalised snapshots built on your question and answered by verified Indian jewellery buyers. Lab-grown, demi-fine and silver, by city and ticket size.",
  // No `title.absolute`: the layout's default/template do not reach a page in
  // the same segment, so this bare title is the one that renders.
  alternates: { canonical: "/" },
};

type Props = { searchParams: Promise<{ seg?: string; segment?: string }> };

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  // ?seg=lab-grown | demi-fine | silver tailors the hero line and the form default.
  const segment = sp.seg ?? sp.segment;
  return (
    <>
      <main className="min-h-screen bg-black text-white">
        <JewelleryNav />
        <JewelleryHero segment={segment} />
        <JewelleryLogos />
        <JewelleryHowItWorks />
        <JewellerySnapshot segment={segment} />
        <JewelleryPricing />
        <JewelleryFaq />
      </main>
      <JewelleryFooter />
    </>
  );
}
