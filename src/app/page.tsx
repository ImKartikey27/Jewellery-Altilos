import type { Metadata } from "next";

import { EmailGate } from "@/components/LandingPage/EmailGate";
import { FAQ } from "@/components/LandingPage/FAQ";
import { Footer } from "@/components/LandingPage/Footer";
import { Pricing } from "@/components/LandingPage/Pricing";
import { LogoRow } from "@/components/LandingPage/SocialProof";
import { Steps } from "@/components/LandingPage/Steps/Steps";
import { JewelleryHero } from "@/components/Jewellery/JewelleryHero";
import { JewelleryNav } from "@/components/Jewellery/JewelleryNav";

export const metadata: Metadata = {
  title: { absolute: "India Jewellery Consumer Research Study 2026 | Altilos" },
  description:
    "Free zero-party study of 2,625 verified Indian jewellery buyers across 180 cities and towns. Custom studies for your brand in 3 to 7 days, from ₹8,000.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-black text-white">
        <JewelleryNav />
        <JewelleryHero />
        <LogoRow />
        <Steps />
        <EmailGate />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
