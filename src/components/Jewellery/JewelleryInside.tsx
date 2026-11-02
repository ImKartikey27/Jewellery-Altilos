import { jewelleryInsights } from "@/lib/jewellery/content";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

export function JewelleryInside() {
  return (
    <section id="whats-inside" className="scroll-mt-24 px-6 pb-[100px]" aria-labelledby="whats-inside-title">
      <div className="mx-auto max-w-[1240px]">
        <p className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#F39019]">What&rsquo;s inside</p>
        <h2 id="whats-inside-title" className="mt-4 font-plusJakartaSans text-[clamp(30px,3.6vw,46px)] font-normal leading-[1.15] tracking-[-0.03em] text-balance">
          Four things 2,625 buyers made clear.
        </h2>
        <p className="mt-4 max-w-[620px] font-inter text-base leading-[1.75] text-[#a3a3a3]">Not opinions on the market. What real buyers said they do.</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {jewelleryInsights.map((c) => (
            <article key={c.eyebrow} className="flex flex-col rounded-[24px] border border-white/20 bg-[#0a0a0a] p-8 transition-colors hover:border-[#F39019]">
              <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[#a3a3a3]">{c.eyebrow}</p>
              <p className="mt-3 font-plusJakartaSans text-[clamp(34px,4vw,48px)] font-bold leading-none tracking-[-0.02em] text-[#F39019]">{c.stat}</p>
              <h3 className="mt-5 font-plusJakartaSans text-xl font-semibold leading-snug">{c.headline}</h3>
              <p className="mt-3 font-inter text-[15px] leading-7 text-[#cfcfcf]">{c.body}</p>
              <p className="mt-5 border-t border-white/10 pt-5 font-inter text-[15px] leading-7 text-white">
                <span className="font-semibold text-[#F39019]">For your brand: </span>
                {c.forYourBrand}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a href="#snapshot" className={CTA}>Get all four, with every chart and cut <span className="text-base">→</span></a>
        </div>
      </div>
    </section>
  );
}
