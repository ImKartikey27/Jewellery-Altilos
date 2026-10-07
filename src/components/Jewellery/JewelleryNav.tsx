import { LogoMark } from "@/components/LandingPage/ui/LogoMark";
import { jewelleryNavLinks } from "@/lib/jewellery/content";

export function JewelleryNav() {
  return (
    <header className="sticky top-0 z-50 flex justify-center px-4 pt-5 pointer-events-none" id="top">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex w-full max-w-[1010px] items-center justify-between gap-4 rounded-full bg-white py-2 pl-5 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      >
        <a href="#top" className="flex items-center gap-2 text-[#111]" aria-label="Altilos home">
          <LogoMark />
          <span className="font-plusJakartaSans text-xl font-medium tracking-[-0.01em]">
            altilos<span className="text-[#F39019]">.</span>
          </span>
        </a>
        <div className="hidden gap-10 text-sm md:flex">
          {jewelleryNavLinks.map((l) => (
            <a key={l.href} href={l.href} className="font-inter text-[#111] hover:text-[#F39019]">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#snapshot"
          className="whitespace-nowrap rounded-full bg-[#F39019] px-5 py-2.5 font-inter text-sm font-medium text-white hover:bg-[#FFA033]"
        >
          Get free snapshot
        </a>
      </nav>
    </header>
  );
}
