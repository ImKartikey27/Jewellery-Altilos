"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  jewelleryStepsIntro,
  jewellerySteps,
  stepActions,
  stepAudFeats,
  stepAudience,
  stepFeed,
  stepFindings,
  stepPipeline,
  stepScope,
} from "@/lib/jewellery/content";

// "static" is the server render and the reduced-motion mode: all five steps in
// flow and fully visible, so a crawler or a no-JS client never sees hidden text.
type Mode = "static" | "stacked" | "pinned";

const MARK = 96;
const STAGE = 500;
const N = jewellerySteps.length;

const pill = "rounded-full border border-[#F39019] px-[9px] py-[3px] font-inter text-[9px] uppercase tracking-[0.14em] text-[#F39019]";
const cardBase = "flex flex-col overflow-hidden rounded-[32px] border border-white/20 p-7";
const hd = "font-plusJakartaSans text-[22px] font-medium";

const WEIGHED = [
  { k: "Brand heritage", v: 77 },
  { k: "Jeweller relationship", v: 76 },
  { k: "Price and making charges", v: 35 },
  { k: "Celebrity ads", v: 12 },
];

function Card1() {
  return (
    <>
      <span className={`self-start ${pill}`}>Step 1 of 5</span>
      <h4 className={`mb-1 mt-3.5 ${hd}`}>Tell us your question</h4>
      <p className="font-inter text-xs text-[#8a8a8a]">Describe the one specific business question you need answered.</p>
      <div className="mt-5 font-inter text-[10px] uppercase tracking-[0.1em] text-[#cfcfcf]">Your business question <span className="text-[#F39019]">*</span></div>
      <div className="mt-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-3.5 font-inter text-[13px] leading-[1.6] text-[#e5e5e5]">
        Which of my buyers are open to lab-grown over natural, and at what ticket size?
        <span className="ml-0.5 inline-block h-3.5 w-px bg-[#F39019] align-[-2px]" />
      </div>
      <div className="mt-5 font-inter text-[10px] uppercase tracking-[0.1em] text-[#cfcfcf]">Project scope (optional)</div>
      <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
        {stepScope.map((f) => (
          <div key={f.k} className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <div className="font-inter text-[9px] uppercase tracking-[0.1em] text-[#F39019]">{f.k}</div>
            <div className="mt-1.5 flex justify-between font-inter text-xs text-white"><span>{f.v}</span><span className="text-[#8a8a8a]">▾</span></div>
          </div>
        ))}
      </div>
    </>
  );
}

function Card2() {
  return (
    <div className="flex h-full flex-col gap-[18px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-start gap-5">
        <div>
          <span className={pill}>Step 2 of 5</span>
          <h4 className={`mb-3.5 mt-3.5 leading-[1.2] ${hd}`}>We build your<br />buyer audience</h4>
          <div className="inline-flex items-center gap-2.5 rounded-[10px] border border-white/[0.12] bg-white/[0.03] px-3 py-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#F39019" strokeWidth="1.6" aria-hidden="true"><circle cx="10" cy="11" r="7" /><path d="M10 7v4l2.5 2M3 4l2.5-2M17 4l-2.5-2" /></svg>
            <div><div className="font-inter text-[9px] text-[#8a8a8a]">Configuration begins</div><div className="font-inter text-xs text-[#F39019]">Within 24 hours</div></div>
          </div>
          <svg viewBox="0 0 200 120" className="mt-3.5 block w-full max-w-[150px]" aria-hidden="true">
            <circle cx="100" cy="60" r="56" fill="none" stroke="rgba(255,255,255,.08)" />
            <circle cx="100" cy="60" r="38" fill="none" stroke="rgba(255,255,255,.12)" />
            <circle cx="100" cy="60" r="20" fill="none" stroke="rgba(243,144,25,.4)" />
            <circle cx="100" cy="60" r="5" fill="#F39019" />
            <circle cx="62" cy="38" r="3" fill="#F39019" opacity=".8" />
            <circle cx="148" cy="48" r="3" fill="#F39019" opacity=".8" />
            <circle cx="128" cy="96" r="3" fill="#F39019" opacity=".6" />
            <circle cx="72" cy="92" r="3" fill="#fff" opacity=".35" />
            <circle cx="44" cy="62" r="2.5" fill="#fff" opacity=".25" />
            <circle cx="156" cy="74" r="2.5" fill="#fff" opacity=".25" />
          </svg>
        </div>
        <div className="rounded-xl border border-white/[0.12] bg-[#0a0a0a]/80 p-3.5">
          <div className="mb-2 font-inter text-[11px] text-[#cfcfcf]">Audience preview</div>
          {stepAudience.map((r) => (
            <div key={r.k} className="flex justify-between gap-2.5 border-t border-white/[0.06] py-[7px] font-inter text-[11px]">
              <span className="text-[#8a8a8a]">{r.k}</span><span className="text-right text-white">{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
        {stepAudFeats.map((f) => (
          <div key={f.t} className="border-l border-white/10 pl-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#F39019]" />
            <div className="mt-2 font-inter text-[11px] text-white">{f.t}</div>
            <div className="mt-[3px] font-inter text-[10px] leading-[1.4] text-[#737373]">{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card3() {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={pill}>Step 3 of 5</span>
        <span className="inline-flex items-center gap-1.5 font-inter text-[11px] text-[#cfcfcf]"><span className="h-1.5 w-1.5 rounded-full bg-[#3fd17a]" />Live collection</span>
      </div>
      <h4 className={`mb-1 mt-3.5 ${hd}`}>Responses coming in</h4>
      <div className="mt-2.5 flex justify-between font-inter text-[11px] text-[#8a8a8a]"><span>Verified responses</span><span className="text-white">Checked as they arrive</span></div>
      <div className="mt-2 h-1 overflow-hidden rounded bg-white/[0.08]"><div className="h-full w-[62%] rounded bg-[#F39019]" /></div>
      <div className="mt-[18px] flex flex-col gap-2">
        {stepFeed.map((r, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#F39019" strokeWidth="1.4" aria-hidden="true"><path d="M7 13s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C2.5 8.8 7 13 7 13z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
            <div className="min-w-0"><div className="font-inter text-xs text-white">{r.where}</div><div className="mt-0.5 font-inter text-[10px] text-[#737373]">{r.what}</div></div>
            <span className="whitespace-nowrap rounded-full border border-[#F39019]/40 px-2 py-[3px] font-inter text-[10px] text-[#F39019]">Verified buyer</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-3.5 font-inter text-[10px] text-[#a3a3a3]">
        {["Zero-party", "Pin-code level", "Verified category buyers"].map((t) => (
          <span key={t} className="rounded-full border border-white/10 px-2.5 py-1">{t}</span>
        ))}
      </div>
    </>
  );
}

function Card4() {
  return (
    <>
      <span className={`self-start ${pill}`}>Step 4 of 5</span>
      <h4 className={`mb-4 mt-3.5 ${hd}`}>Signals become patterns</h4>
      <div className="grid grid-cols-4 items-stretch gap-1.5">
        {stepPipeline.map((p) => (
          <div key={p.k} className={`rounded-[10px] border bg-white/[0.02] p-2.5 ${p.hi ? "border-[#F39019]/50" : "border-white/10"}`}>
            <div className={`font-inter text-[9px] uppercase tracking-[0.08em] ${p.hi ? "text-[#F39019]" : "text-[#8a8a8a]"}`}>{p.k}</div>
            <div className="mt-1.5 font-inter text-xs text-white">{p.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-1 flex-col rounded-[14px] border border-white/10 bg-[#0a0a0a]/70 p-4">
        <div className="flex justify-between font-inter text-[11px]"><span className="text-[#cfcfcf]">What buyers weigh when choosing a jeweller</span><span className="text-[#737373]">Free study</span></div>
        <div className="mt-3.5 flex flex-col gap-3">
          {WEIGHED.map((w) => (
            <div key={w.k} className="grid grid-cols-[120px_1fr_36px] items-center gap-2.5 font-inter text-[11px]">
              <span className="text-[#a3a3a3]">{w.k}</span>
              <span className="h-2 rounded bg-white/[0.06]"><span className="block h-full rounded bg-[#F39019]" style={{ width: `${w.v}%` }} /></span>
              <span className="text-right text-white">{w.v}%</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-3 font-inter text-[11px] text-[#a3a3a3]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#F39019" strokeWidth="1.6" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" /></svg>
          Reviewed by a market expert
        </div>
      </div>
    </>
  );
}

function Card5() {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={pill}>Step 5 of 5</span>
        <span className="font-inter text-[11px] text-[#8a8a8a]">Delivered in 3–7 days</span>
      </div>
      <h4 className={`mb-0.5 mt-3.5 ${hd}`}>Your buyer report</h4>
      <p className="font-inter text-xs text-[#8a8a8a]">Your brand · your category · your cities</p>
      <div className="mt-[18px] grid flex-1 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <div className="rounded-[14px] border border-white/10 bg-white/[0.02] p-3.5">
          <div className="font-inter text-[10px] uppercase tracking-[0.1em] text-[#F39019]">Key findings</div>
          {stepFindings.map((t, i) => (
            <div key={i} className="mt-3 flex gap-2.5 font-inter text-xs leading-[1.5] text-[#e5e5e5]"><span className="text-[#737373]">0{i + 1}</span><span>{t}</span></div>
          ))}
        </div>
        <div className="rounded-[14px] border border-[#F39019]/35 bg-[#F39019]/[0.04] p-3.5">
          <div className="font-inter text-[10px] uppercase tracking-[0.1em] text-[#F39019]">Recommended actions</div>
          {stepActions.map((t) => (
            <div key={t} className="mt-3 flex items-start gap-2.5 font-inter text-xs leading-[1.5] text-[#e5e5e5]">
              <span className="mt-0.5 grid h-3.5 w-3.5 flex-none place-items-center rounded border border-[#F39019]">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#F39019" strokeWidth="1.5" aria-hidden="true"><path d="M1.5 4l1.8 1.8L6.5 2" /></svg>
              </span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3.5 font-inter text-[11px] text-[#a3a3a3]">Analyst-edited · Specific to your question · Ready to act on</div>
    </>
  );
}

const CARDS = [
  { C: Card1, bg: "radial-gradient(120% 90% at 85% 30%,#1c1c1c 0%,#0b0b0b 60%,#070707 100%)" },
  { C: Card2, bg: "radial-gradient(120% 90% at 60% 30%,#1c1c1c 0%,#0b0b0b 60%,#070707 100%)" },
  { C: Card3, bg: "radial-gradient(120% 90% at 20% 0%,#1c1c1c 0%,#0b0b0b 60%,#070707 100%)" },
  { C: Card4, bg: "radial-gradient(120% 90% at 80% 80%,#1c1c1c 0%,#0b0b0b 60%,#070707 100%)" },
  { C: Card5, bg: "radial-gradient(120% 90% at 50% 0%,#1c1c1c 0%,#0b0b0b 60%,#070707 100%)" },
];

export function JewelleryHowItWorks() {
  const [mode, setMode] = useState<Mode>("static");
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(N).fill(false));
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const modeRef = useRef<Mode>("static");

  // Pick the layout: pinned crossfade on large screens, stacked reveal on
  // small ones, fully static under reduced motion.
  useEffect(() => {
    const mqSmall = matchMedia("(max-width: 1099px), (max-height: 719px)");
    const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const next: Mode = mqReduce.matches ? "static" : mqSmall.matches ? "stacked" : "pinned";
      modeRef.current = next;
      setMode(next);
    };
    update();
    mqSmall.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqSmall.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (mode !== "pinned") return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = Math.max(1, el.offsetHeight - innerHeight);
      const p = Math.min(Math.max(-r.top / total, 0), 0.9999);
      setActive(Math.floor(p * N));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "stacked") return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.i);
          setRevealed((prev) => (prev[i] ? prev : prev.map((v, k) => (k === i ? true : v))));
        }),
      { threshold: 0.15 },
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [mode]);

  const jump = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    const total = el.offsetHeight - innerHeight;
    scrollTo({ top: top + (total * (i + 0.5)) / N, behavior: "smooth" });
  }, []);

  const pinned = mode === "pinned";
  const stat = mode === "static";
  const trans = pinned ? "opacity .55s ease, transform .55s ease, color .4s" : stat ? "none" : "opacity .7s ease, transform .7s ease";
  const cols = pinned ? "minmax(0,1fr) 180px minmax(0,1.45fr)" : "minmax(0,1fr)";

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative"
      style={{ height: pinned ? "500vh" : "auto" }}
      aria-labelledby="how-it-works-title"
    >
      <div
        className="flex flex-col justify-center"
        style={{
          position: pinned ? "sticky" : "relative",
          top: 0,
          height: pinned ? "100vh" : "auto",
          padding: pinned ? "72px 24px 24px" : "40px 20px 80px",
        }}
      >
        <h2 id="how-it-works-title" className="mb-10 text-center font-plusJakartaSans text-[clamp(28px,3.4vw,42px)] text-balance font-normal tracking-[-0.03em]">
          {jewelleryStepsIntro.headline}
        </h2>
        <p className="mx-auto -mt-6 mb-10 max-w-2xl text-center font-inter text-base leading-7 text-[#a3a3a3]">{jewelleryStepsIntro.body}</p>
        <div
          className="relative mx-auto flex w-full max-w-[1240px] flex-col gap-20"
          style={{ height: pinned ? STAGE : "auto" }}
        >
          {pinned && (
            <div className="pointer-events-none absolute inset-0 z-[2] grid gap-x-12" style={{ gridTemplateColumns: cols }}>
              <div />
              <div
                className="pointer-events-auto relative overflow-hidden"
                style={{ maskImage: "linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent)", WebkitMaskImage: "linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent)" }}
              >
                <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${STAGE / 2 - MARK / 2 - active * MARK}px)`, transition: trans }}>
                  {jewellerySteps.map((s, i) => {
                    const d = Math.abs(i - active);
                    return (
                      <button
                        key={s.eyebrow}
                        type="button"
                        onClick={() => jump(i)}
                        aria-label={`Go to step ${i + 1}`}
                        className="flex h-24 w-full cursor-pointer items-center justify-center border-0 bg-transparent font-poppins text-[38px] tracking-[0.08em]"
                        style={{ color: d === 0 ? "#F39019" : "#fff", opacity: d === 0 ? 1 : d === 1 ? 0.14 : 0.05, transition: trans }}
                      >
                        {s.eyebrow}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div />
            </div>
          )}

          {jewellerySteps.map((s, i) => {
            const { C, bg } = CARDS[i];
            const on = pinned ? i === active : stat || revealed[i];
            const ty = pinned ? (i - active) * 28 : on ? 0 : 36;
            return (
              <div
                key={s.eyebrow}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-i={i}
                className="grid items-center"
                style={{
                  position: pinned ? "absolute" : "relative",
                  inset: pinned ? 0 : undefined,
                  gridTemplateColumns: cols,
                  gap: pinned ? 36 : 24,
                  opacity: on ? 1 : 0,
                  transform: `translateY(${ty}px)`,
                  transition: trans,
                  pointerEvents: pinned && i !== active ? "none" : "auto",
                }}
              >
                <div className="px-2">
                  {!pinned && <div className="mb-3.5 font-poppins text-[28px] tracking-[0.08em] text-[#F39019]">{s.eyebrow}</div>}
                  <h3 className="font-plusJakartaSans text-[22px] font-normal uppercase tracking-[-0.01em]">{s.title}</h3>
                  <p className="mt-3.5 max-w-xl font-poppins text-[15px] leading-[1.9] text-[#a3a3a3] text-pretty">{s.body}</p>
                </div>
                {pinned && <div />}
                <div className={cardBase} style={{ height: pinned ? "100%" : "auto", background: bg }}>
                  <C />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
