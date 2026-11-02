const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

export function JewelleryClosing() {
  return (
    <section className="px-6 pb-[120px] pt-10 text-center" aria-labelledby="closing-title">
      <div className="mx-auto max-w-[760px]">
        <h2 id="closing-title" className="font-plusJakartaSans text-[clamp(28px,3.4vw,42px)] font-normal leading-[1.2] tracking-[-0.02em] text-balance">
          See what 2,625 jewellery buyers told us.
        </h2>
        <p className="mt-5 font-inter text-base leading-[1.75] text-[#a3a3a3]">
          Start with the free study. When it raises your next question, we&rsquo;ll answer it for your brand.
        </p>
        <a href="#snapshot" className={`mt-8 ${CTA}`}>Get the free study <span className="text-base">→</span></a>
        <p className="mt-4 font-inter text-sm text-[#e5e5e5]">Free. No pitch. No card details.</p>
      </div>
    </section>
  );
}
