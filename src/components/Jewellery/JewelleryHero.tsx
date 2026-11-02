import Image from "next/image";

import { jewelleryHeroCard, jewelleryMetrics } from "@/lib/jewellery/content";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

// The portrait has no black margin, so an elliptical mask dissolves every edge into the page at once.
// Unlike overlay gradients it never washes out the face; the ellipse is centred on her head and shoulders.
const PHOTO_MASK = "radial-gradient(ellipse 62% 52% at 56% 46%, #000 58%, transparent 100%)";

export function JewelleryHero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 lg:pb-20 lg:pt-0" aria-labelledby="hero-title">
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
      <div className="relative mt-6 h-[340px] w-full overflow-hidden sm:h-[440px] lg:absolute lg:-right-10 lg:bottom-0 lg:mt-0 lg:aspect-[1344/672] lg:h-[80%] lg:w-auto">
        <Image
          src="/images/hero/jewellery-hero-v2.webp"
          alt="A smiling Indian woman touching her diamond pendant, also wearing diamond stud earrings, a ring and a tennis bracelet, lit by a warm orange glow"
          width={1344}
          height={672}
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 1440px, 100vw"
          className="absolute left-1/2 h-full w-auto max-w-none -translate-x-[58%] lg:relative lg:left-auto lg:w-full lg:translate-x-0 lg:object-cover"
          style={{ maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK }}
        />
      </div>
      </div>

      {/* One stat panel below the photo, never over it: the lab-grown question and its three numbers, then the study's headline metrics. */}
      <figure className="relative z-10 mx-auto mt-8 w-[calc(100%-3rem)] max-w-[1040px] overflow-hidden rounded-[24px] border border-white/20 bg-[linear-gradient(160deg,rgba(24,24,24,.94),rgba(8,8,8,.97))] shadow-[0_20px_60px_rgba(0,0,0,0.5)] lg:-mt-4">
        <div className="p-6 lg:flex lg:items-center lg:gap-10 lg:px-9 lg:py-7">
          <figcaption className="font-plusJakartaSans text-[20px] font-medium leading-snug tracking-[-0.01em] lg:w-[260px] lg:flex-none">
            {jewelleryHeroCard.title}
            <span className="mt-2 block font-inter text-[11px] font-normal tracking-normal text-[#8a8a8a]">{jewelleryHeroCard.footer}</span>
          </figcaption>
          <dl className="mt-5 grid gap-5 sm:grid-cols-3 lg:mt-0 lg:flex-1">
            {jewelleryHeroCard.rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-white/[0.08] pb-4 last:border-b-0 last:pb-0 sm:flex-col sm:items-start sm:gap-1 sm:border-b-0 sm:border-l sm:pb-0 sm:pl-6 sm:first:border-l-0 sm:first:pl-0 lg:first:border-l lg:first:pl-6">
                <dd className="order-2 font-plusJakartaSans text-[32px] font-bold leading-none text-[#F39019] sm:order-1">{r.value}</dd>
                <dt className="order-1 font-inter text-[13px] leading-snug text-[#cfcfcf] sm:order-2">{r.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <dl className="grid divide-y divide-white/[0.08] border-t border-white/[0.08] bg-white/[0.02] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {jewelleryMetrics.map((m) => (
            <div key={m.label} className="px-6 py-5 text-center lg:px-9">
              <dd className="font-plusJakartaSans text-[26px] font-semibold leading-none">{m.value}</dd>
              <dt className="mt-2 font-inter text-[10px] uppercase tracking-[0.24em] text-[#a3a3a3]">{m.label}</dt>
              <dd className="mt-2 font-inter text-[13px] leading-snug text-[#cfcfcf]">{m.body}</dd>
            </div>
          ))}
        </dl>
      </figure>
    </section>
  );
}
