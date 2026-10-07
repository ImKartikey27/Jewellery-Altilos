import { DEFAULT_SEGMENT_LINE, JEWELLERY_SEGMENTS, jewelleryMetrics, jewelleryTiers } from "@/lib/jewellery/content";

const CTA =
  "inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]";

export function JewelleryHero({ segment }: { segment?: string }) {
  const line = (segment && JEWELLERY_SEGMENTS[segment]?.line) || DEFAULT_SEGMENT_LINE;
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
            Real-time intelligence for Indian D2C jewellery brands
          </h1>
          <p className="font-plusJakartaSans text-[clamp(36px,4.6vw,56px)] font-bold leading-[1.12] tracking-[-0.03em] text-balance">
            <span className="text-[#F39019]">Your Buyers</span>, <span className="text-[#F39019]">Personalised</span>. In{" "}
            <span className="text-[#F39019]">7 Days</span>, Not 12 Weeks
          </p>
          <p className="mt-8 max-w-[620px] font-inter text-base leading-[1.75] text-[#e5e5e5]">
            A <strong className="text-white">personalised snapshot</strong> built on <strong className="text-white">your question</strong>, answered by{" "}
            <strong className="text-white">verified jewellery buyers</strong>. Not a syndicated report written for someone else&apos;s.
          </p>
          <p className="mt-2.5 max-w-[620px] font-inter text-base leading-[1.75] text-[#e5e5e5]">{line}</p>
          <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 font-inter text-[13px] text-[#d4d4d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F39019]" aria-hidden="true" />
            <span><strong className="text-white">[N]</strong> verified jewellery buyers across <strong className="text-white">[cities]</strong></span>
          </div>
          <a href="#snapshot" className={`mt-9 ${CTA}`}>Get it before Dhanteras <span className="text-base">→</span></a>
          <p className="mt-[18px] font-inter text-sm text-[#e5e5e5]">No contracts. No lock-ins. No assumptions dressed up as data.</p>
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] justify-center">
          <div className="w-full max-w-[420px] rounded-[28px] border border-white/20 bg-[linear-gradient(160deg,rgba(24,24,24,.92),rgba(8,8,8,.96))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-[#F39019] px-2.5 py-1 font-inter text-[10px] uppercase tracking-[0.14em] text-[#F39019]">Your snapshot</span>
              <span className="font-inter text-[11px] text-[#8a8a8a]">Dhanteras · 6 Nov</span>
            </div>
            <h3 className="mb-1 mt-[18px] font-plusJakartaSans text-[22px] font-medium tracking-[-0.01em]">Natural or lab-grown?</h3>
            <p className="font-inter text-xs text-[#8a8a8a]">[category] buyers · [band] · [cities]</p>
            <div className="mt-[22px] grid grid-cols-2 gap-2.5">
              <div className="rounded-[14px] border border-white/10 p-3.5">
                <div className="font-inter text-[11px] text-[#8a8a8a]">Staying natural</div>
                <div className="mt-1.5 font-plusJakartaSans text-[26px] font-semibold">[x]%</div>
              </div>
              <div className="rounded-[14px] border border-[#F39019]/50 bg-[#F39019]/[0.06] p-3.5">
                <div className="font-inter text-[11px] text-[#F7B262]">Switching to lab-grown</div>
                <div className="mt-1.5 font-plusJakartaSans text-[26px] font-semibold text-[#F39019]">[x]%</div>
              </div>
            </div>
            <div className="mt-5 font-inter text-[11px] uppercase tracking-[0.08em] text-[#8a8a8a]">Switch intent by city tier</div>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {jewelleryTiers.map((t) => (
                <div key={t} className="grid grid-cols-[56px_1fr_40px] items-center gap-2.5 font-inter text-xs">
                  <span className="text-[#cfcfcf]">{t}</span>
                  <span className="h-1.5 rounded bg-[repeating-linear-gradient(90deg,rgba(243,144,25,.55)_0_6px,rgba(243,144,25,.15)_6px_10px)]" />
                  <span className="text-right text-white">[x]%</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between border-t border-white/[0.08] pt-4 font-inter text-[11px] text-[#8a8a8a]">
              <span>Top switch trigger: <span className="text-white">[trigger]</span></span>
              <span>Layout preview</span>
            </div>
          </div>
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
