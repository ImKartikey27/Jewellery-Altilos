import Image from "next/image";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

// The portrait has no black margin, so mask its edges into the page. The top ramp is kept short so her hair
// is not darkened; the sides and bottom carry the longer fades. The layers are intersected.
const PHOTO_MASK = [
  "linear-gradient(to bottom, transparent 0%, #000 9%)",
  "linear-gradient(to top, transparent 0%, transparent 2%, #000 26%)",
  "linear-gradient(to right, transparent 0%, #000 22%, #000 90%, transparent 100%)",
].join(", ");

export function JewelleryHero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-10 lg:pb-0 lg:pt-0" aria-labelledby="hero-title">
      {/* Hero band: the photo and card are positioned against this, not the whole section, so the metrics below never stretch the photo. */}
      <div className="relative">
      {/* Copy shell: centred and capped so the split stays in line with the nav on wide displays. */}
      <div className="mx-auto max-w-[1600px] lg:flex lg:min-h-[clamp(680px,84vh,820px)] lg:items-center">
        <div className="relative z-10 px-6 text-center lg:w-[56%] lg:px-0">
          <div className="mx-auto flex max-w-[640px] flex-col items-center">
            <h1 id="hero-title" className="font-inter text-[13px] font-medium uppercase tracking-[0.32em] text-[#F39019]">
              India jewellery consumer landscape study 2026
            </h1>
            <p className="mt-8 font-plusJakartaSans text-[clamp(34px,4.4vw,54px)] font-bold leading-[1.12] tracking-[-0.03em] text-balance lg:mt-10">
              Jewellery is bought on <span className="text-[#F39019]">trust</span>. We asked 2,625 buyers what earns it.
            </p>
            <p className="mt-7 max-w-[600px] font-inter text-base leading-[1.75] text-[#e5e5e5]">
              The free study for Indian jewellery brands. First-hand evidence from verified buyers in 180 cities and towns: why the family jeweller still wins,
              what holds back online and lab-grown, and what Gen Z actually wants on the counter.
            </p>
            <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 font-inter text-[13px] text-[#d4d4d4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F39019]" aria-hidden="true" />
              <span><strong className="text-white">2,625</strong> verified buyers · <strong className="text-white">180</strong> cities and towns · <strong className="text-white">32</strong> states</span>
            </div>
            <a href="#email-gate" className={`mt-9 ${CTA}`}>Get the free study <span className="text-base">→</span></a>
            <p className="mt-[18px] font-inter text-sm text-[#e5e5e5]">Free. No pitch. No card details.</p>
          </div>
        </div>
      </div>

      {/* Photo: in flow below the copy on mobile, anchored bottom-right on desktop and sized by height so it can
          never outgrow the band. The stat strip sits below it. */}
      <div className="relative mt-6 h-[340px] w-full overflow-hidden sm:h-[440px] lg:absolute lg:-right-32 lg:bottom-0 lg:mt-0 lg:aspect-[1344/672] lg:h-[84%] lg:w-auto">
        <Image
          src="/images/hero/jewellery-hero-v2.webp"
          alt="A smiling Indian woman touching her diamond pendant, also wearing diamond stud earrings, a ring and a tennis bracelet, lit by a warm orange glow"
          width={1344}
          height={672}
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 1440px, 100vw"
          className="absolute left-1/2 h-full w-auto max-w-none -translate-x-[58%] lg:relative lg:left-auto lg:w-full lg:translate-x-0 lg:object-cover"
          style={{ maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
        />
      </div>
      </div>
    </section>
  );
}
