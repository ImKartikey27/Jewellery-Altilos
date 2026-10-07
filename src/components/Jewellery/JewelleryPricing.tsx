"use client";

import { markReturnToPlans } from "@/lib/return-to-plans";
import { jewelleryPlans } from "@/lib/jewellery/content";

export function JewelleryPricing() {
  return (
    <section id="plans" className="scroll-mt-24 px-6 pb-20 pt-[120px]" aria-labelledby="plans-title">
      <div className="mx-auto max-w-[1280px]">
        <h2 id="plans-title" className="max-w-[960px] font-plusJakartaSans text-[clamp(30px,3.4vw,44px)] font-normal leading-[1.2] tracking-[-0.03em] text-balance">
          Get a <strong className="font-bold">free snapshot</strong> of <strong className="font-bold">real buyer behaviour</strong> in{" "}
          <strong className="font-bold">your category</strong>. No pitch. No card details
        </h2>
        <p className="mt-7 max-w-[640px] font-poppins text-base leading-normal text-[#a3a3a3]">
          Start with a rapid report, then scale into deeper market coverage as your team moves from curiosity to conviction.
        </p>
        <a href="#snapshot" className="mt-10 inline-flex items-center gap-3.5 rounded-full bg-[#F39019] px-[30px] py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]">
          Get it before Dhanteras <span className="text-base">→</span>
        </a>

        <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-start gap-7">
          {jewelleryPlans.map((p) => (
            <article key={p.key} className="flex flex-col gap-5" aria-labelledby={`jplan-${p.key.replace("+", "plus")}`}>
              <div
                className={`flex min-h-[620px] flex-col rounded-[20px] border p-8 ${
                  p.hi
                    ? "border-[#F39019] bg-[linear-gradient(180deg,rgba(243,144,25,.10),rgba(243,144,25,.02)_60%,#0a0a0a)] shadow-[0_0_40px_rgba(243,144,25,0.25)]"
                    : "border-white/[0.22] bg-[#0a0a0a]"
                }`}
              >
                <div className="h-[26px]">
                  {p.badge && <span className="inline-block rounded-full border border-[#F39019]/70 px-2.5 py-1 font-inter text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F39019]">{p.badge}</span>}
                </div>
                <h3 id={`jplan-${p.key.replace("+", "plus")}`} className={`mt-[22px] font-inter text-[13px] font-normal uppercase tracking-[0.12em] ${p.hi ? "text-[#F39019]" : "text-[#a3a3a3]"}`}>{p.name}</h3>
                <div className="mt-1.5 font-plusJakartaSans text-[34px] font-bold">{p.price}</div>
                <div className="mt-1 font-inter text-[13px] text-[#737373]">{p.resp}</div>
                <div className="mt-[22px] font-inter text-base text-[#a3a3a3]">{p.tag}</div>
                <div className="mt-7 min-h-5 font-inter text-sm italic text-[#F39019]">{p.inc}</div>
                <ul className="mt-3 flex flex-col gap-[11px]">
                  {p.feats.map((f) => (
                    <li key={f.label} className={`flex gap-2.5 font-inter text-sm ${f.k === "d" ? "text-[#5a5a5a]" : "text-[#cfcfcf]"}`}>
                      <span aria-hidden="true" className={`w-3 flex-none ${f.k === "d" ? "text-[#5a5a5a]" : "text-[#F39019]"}`}>{f.k === "d" ? "–" : f.k === "s" ? "★" : "✓"}</span>
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
                {/* A plain <a>: checkout is a full page load, same as skincare. */}
                <a
                  href={`/checkout?plan=${encodeURIComponent(p.key)}`}
                  onClick={markReturnToPlans}
                  className="mt-auto block rounded-full bg-[#F39019] px-4 py-[13px] text-center font-inter text-sm font-bold uppercase tracking-[0.04em] text-white hover:bg-[#FFA033]"
                >
                  {p.cta}
                </a>
              </div>
              <div className="px-1">
                <div className="font-inter text-sm font-semibold text-white">{p.footT}</div>
                <div className="mt-1.5 font-inter text-sm leading-normal text-[#8a8a8a]">{p.footD}</div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 font-inter text-sm text-[#8a8a8a]"><span className="text-[#F39019]">★</span> marks the headline value each tier unlocks over the one below.</p>
      </div>
    </section>
  );
}
