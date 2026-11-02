import Image from "next/image";

import { jewelleryHeroCard, jewelleryMetrics } from "@/lib/jewellery/content";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

const FADE =
  "bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.97)_22%,rgba(0,0,0,0.72)_52%,rgba(0,0,0,0.28)_78%,transparent_100%)]";

export function JewelleryHero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-10 lg:pb-24 lg:pt-0" aria-labelledby="hero-title">
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
          never outgrow the band. The stat card overlaps its lower edge. */}
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
        />
        <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 h-[40%] lg:hidden ${FADE}`} />
        {/* The portrait has no black margin at the top or left, so dissolve both edges into the page. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-[linear-gradient(to_bottom,#000_0%,rgba(0,0,0,0.6)_45%,transparent_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[24%] bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0.6)_45%,transparent_100%)] lg:block" />
      </div>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 hidden h-[16%] lg:block ${FADE}`} />

      <figure className="relative z-10 mx-auto mt-2 w-[calc(100%-3rem)] max-w-[420px] rounded-[24px] border border-white/20 bg-[linear-gradient(160deg,rgba(24,24,24,.94),rgba(8,8,8,.97))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-sm lg:absolute lg:bottom-5 lg:right-[2%] lg:mt-0 lg:w-[300px] lg:max-w-none">
        <figcaption className="font-plusJakartaSans text-[16px] font-medium leading-snug tracking-[-0.01em]">{jewelleryHeroCard.title}</figcaption>
        <dl className="mt-3 flex flex-col gap-2.5">
          {jewelleryHeroCard.rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-2.5 last:border-b-0 last:pb-0">
              <dt className="font-inter text-[13px] text-[#cfcfcf]">{r.label}</dt>
              <dd className="font-plusJakartaSans text-[22px] font-bold text-[#F39019]">{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2.5 font-inter text-[10px] text-[#8a8a8a]">{jewelleryHeroCard.footer}</p>
      </figure>
      </div>

      <dl className="relative mx-auto mt-16 grid max-w-[1240px] gap-10 px-6 text-center sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] lg:mt-20">
        {jewelleryMetrics.map((m) => (
          <div key={m.label}>
            <dt className="font-inter text-[11px] uppercase tracking-[0.3em] text-[#a3a3a3]">{m.label}</dt>
            <dd className="mt-2.5 font-plusJakartaSans text-[38px] font-semibold tracking-[-0.01em]">{m.value}</dd>
            <dd className="mt-3 whitespace-pre-line font-inter text-base leading-[1.75] text-[#e5e5e5]">{m.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
