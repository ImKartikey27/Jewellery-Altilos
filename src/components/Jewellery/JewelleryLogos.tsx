import Image from "next/image";

import { jewelleryLogos } from "@/lib/jewellery/content";

const COPIES = 4;

// Reuses the .logo-marquee-track keyframes from globals.css.
export function JewelleryLogos() {
  const loop = Array.from({ length: COPIES }, () => jewelleryLogos).flat();
  return (
    <section className="overflow-hidden py-10 pb-[120px]" aria-label="Partner logos">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-black to-transparent" />
        <div className="logo-marquee-track flex w-max items-center">
          {loop.map((logo, i) => {
            const dup = i >= jewelleryLogos.length;
            return (
              <div key={`${logo.image}-${i}`} className="relative mr-12 h-20 w-30 shrink-0" aria-hidden={dup ? "true" : undefined}>
                <Image src={logo.image} alt={dup ? "" : logo.name} fill sizes="120px" className="object-contain" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
