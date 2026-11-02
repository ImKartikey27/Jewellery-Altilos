import { jewelleryHeroCard, jewelleryMetrics } from "@/lib/jewellery/content";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

export function JewelleryHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 lg:pt-[120px]" aria-labelledby="hero-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[760px] w-[760px] rounded-full"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(243,144,25,.85) 0%, rgba(232,96,12,.55) 32%, rgba(120,40,0,.25) 55%, rgba(0,0,0,0) 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[120px] top-[120px] hidden h-[520px] w-[520px] rounded-full border border-[rgba(255,170,80,0.25)] lg:block"
      />
      <div className="relative mx-auto flex max-w-[1240px] flex-wrap items-center gap-14">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col items-center text-center">
          <h1 id="hero-title" className="mb-10 font-inter text-[13px] font-medium uppercase tracking-[0.32em] text-[#F39019]">
            India jewellery consumer landscape study 2026
          </h1>
          <p className="font-plusJakartaSans text-[clamp(34px,4.4vw,54px)] font-bold leading-[1.12] tracking-[-0.03em] text-balance">
            Jewellery is bought on <span className="text-[#F39019]">trust</span>. We asked 2,625 buyers what earns it.
          </p>
          <p className="mt-8 max-w-[620px] font-inter text-base leading-[1.75] text-[#e5e5e5]">
            The free study for Indian jewellery brands. First-hand evidence from verified buyers in 180 cities and towns: why the family jeweller still wins,
            what holds back online and lab-grown, and what Gen Z actually wants on the counter.
          </p>
          <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 font-inter text-[13px] text-[#d4d4d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F39019]" aria-hidden="true" />
            <span><strong className="text-white">2,625</strong> verified buyers · <strong className="text-white">180</strong> cities and towns · <strong className="text-white">32</strong> states</span>
          </div>
          <a href="#snapshot" className={`mt-9 ${CTA}`}>Get the free study <span className="text-base">→</span></a>
          <p className="mt-[18px] font-inter text-sm text-[#e5e5e5]">Free. No pitch. No card details.</p>
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] justify-center">
          <figure className="w-full max-w-[420px] rounded-[28px] border border-white/20 bg-[linear-gradient(160deg,rgba(24,24,24,.92),rgba(8,8,8,.96))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-sm">
            <figcaption className="font-plusJakartaSans text-[22px] font-medium leading-snug tracking-[-0.01em]">{jewelleryHeroCard.title}</figcaption>
            <dl className="mt-6 flex flex-col gap-4">
              {jewelleryHeroCard.rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-4 last:border-b-0 last:pb-0">
                  <dt className="font-inter text-sm text-[#cfcfcf]">{r.label}</dt>
                  <dd className="font-plusJakartaSans text-[32px] font-bold text-[#F39019]">{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 font-inter text-[11px] text-[#8a8a8a]">{jewelleryHeroCard.footer}</p>
          </figure>
        </div>
      </div>

      <dl className="relative mx-auto mt-[110px] grid max-w-[1240px] gap-10 text-center sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
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
