import Link from "next/link";

import { LogoMark } from "@/components/LandingPage/ui/LogoMark";

import { COPYRIGHT_YEAR } from "@/lib/site";

export function JewelleryFooter() {
  return (
    <footer className="bg-[linear-gradient(180deg,#000_0%,#2a1204_60%,#6b2e08_100%)] px-6 pb-8 pt-16 text-center">
      <div className="inline-flex items-center gap-2.5">
        <LogoMark size="lg" />
        <span className="font-plusJakartaSans text-4xl font-medium">altilos<span className="text-[#F39019]">.</span></span>
      </div>
      <nav aria-label="Footer navigation" className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-4 font-inter text-[15px]">
        <Link href="/terms" className="text-white hover:text-[#F39019]">Terms</Link>
        <Link href="/privacy" className="text-white hover:text-[#F39019]">Privacy</Link>
        <Link href="/security" className="text-white hover:text-[#F39019]">Security</Link>
        <a href="mailto:info@altilos.com" className="text-white hover:text-[#F39019]">Contact</a>
      </nav>
      <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3 font-inter text-[15px] text-[#e5e5e5]">
        <a href="mailto:info@altilos.com" className="hover:text-[#F39019]">info@altilos.com</a>
        <a href="tel:+19092434942" className="hover:text-[#F39019]">+1-909-243-4942</a>
      </div>
      <p className="mt-6 font-inter text-[13px] text-[#cfcfcf]">© <time dateTime={String(COPYRIGHT_YEAR)}>{COPYRIGHT_YEAR}</time> Altilos. All rights reserved.</p>
    </footer>
  );
}
