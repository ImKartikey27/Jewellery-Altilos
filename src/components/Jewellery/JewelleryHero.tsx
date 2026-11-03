import Image from "next/image";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

// The new portrait has pure black margins on the top and sides; only the cropped torso at the bottom needs a fade.
const PHOTO_MASK = "linear-gradient(to top, transparent 0%, transparent 2%, #000 24%)";

export function JewelleryHero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-10 lg:pb-0 lg:pt-0" aria-labelledby="hero-title">
      {/* Hero band: the photo and card are positioned against this, not the whole section, so the metrics below never stretch the photo. */}
      <div className="relative">
      {/* Copy shell: centred and capped so the split stays in line with the nav on wide displays. */}
      <div className="mx-auto max-w-[1600px] lg:flex lg:min-h-[clamp(680px,84vh,820px)] lg:items-center">
        <div className="relative z-10 px-6 text-center lg:w-[56%] lg:px-0">
          <div className="mx-auto flex max-w-[640px] flex-col items-center">
            <h1 id="hero-title" className="font-inter text-[12px] font-medium uppercase tracking-[0.2em] text-[#F39019] text-balance">
              Real-time market intelligence for Indian D2C jewellery brands
            </h1>
            <p className="mt-8 font-plusJakartaSans text-[clamp(30px,3.7vw,46px)] font-bold leading-[1.15] tracking-[-0.03em] text-balance lg:mt-10">
              Understand <span className="text-[#F39019]">changing needs</span> of the Indian consumer with{" "}
              <span className="text-[#F39019]">verified actionable insights</span>
            </p>
            <p className="mt-7 max-w-[600px] font-inter text-base leading-[1.9] text-[#e5e5e5]">
              <span className="font-bold">5 million+</span> verified category <span className="font-bold">consumers</span>.{" "}
              <span className="font-bold">Proprietary</span> AI analysis, <span className="font-bold">validated</span> by{" "}
              <span className="font-bold">industry</span> experts. <br className="hidden lg:block" />
              <span className="font-bold">Decision-ready</span> reports in <span className="font-bold">under 7 days</span>, from{" "}
              <span className="font-bold">₹8,000</span>.
            </p>
            <a href="#email-gate" className={`mt-9 ${CTA}`}>Get the free study <span className="text-base">→</span></a>
            <p className="mt-[18px] font-inter text-sm text-[#e5e5e5]">Free. No pitch. No card details.</p>
          </div>
        </div>
      </div>

      {/* Photo: in flow below the copy on mobile, anchored bottom-right on desktop and sized by height so it can
          never outgrow the band. The stat strip sits below it. */}
      <div className="relative mt-6 h-[340px] w-full overflow-hidden sm:h-[440px] lg:absolute lg:-right-[24%] lg:bottom-[7%] lg:mt-0 lg:aspect-[1826/913] lg:h-[96%] lg:w-auto">
        <Image
          src="/images/hero/jewellery-hero-v3.webp"
          alt="A smiling Indian woman touching her diamond pendant, also wearing diamond stud earrings, a ring and a tennis bracelet, lit by a warm orange glow"
          width={1826}
          height={913}
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 1440px, 100vw"
          className="absolute left-1/2 h-full w-auto max-w-none -translate-x-[52%] lg:relative lg:left-auto lg:w-full lg:translate-x-0 lg:object-cover"
          style={{ maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK }}
        />
      </div>
      </div>
    </section>
  );
}
