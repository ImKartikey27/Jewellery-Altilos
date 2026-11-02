import { jewelleryTrustStrip } from "@/lib/jewellery/content";

const COPIES = 4;

// Reuses the .logo-marquee-track keyframes from globals.css.
export function JewelleryLogos() {
  const loop = Array.from({ length: COPIES }, () => jewelleryTrustStrip).flat();
  return (
    <section className="overflow-hidden py-10 pb-[100px]" aria-label="What backs the study">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-black to-transparent" />
        <div className="logo-marquee-track flex w-max items-center">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="mr-12 flex shrink-0 items-center gap-12 font-inter text-sm uppercase tracking-[0.2em] text-[#a3a3a3]"
              aria-hidden={i >= jewelleryTrustStrip.length ? "true" : undefined}
            >
              {item}
              <span aria-hidden="true" className="text-[#F39019]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
