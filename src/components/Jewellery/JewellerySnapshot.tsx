"use client";

import { FormEvent, useId, useState } from "react";

import type { LeadMagnetActionState } from "@/app/_actions/submit-lead-magnet";
import { LeadMagnetModal } from "@/components/LandingPage/LeadMagnetModal";
import { isValidEmail } from "@/lib/email-validation";
import { JEWELLERY_CATEGORIES, JEWELLERY_SEGMENTS } from "@/lib/jewellery/content";

const field =
  "w-full appearance-none rounded-full border border-white/[0.18] bg-[#1a1a1a] px-[22px] py-[17px] font-inter text-[15px] text-white outline-none focus:border-[#F39019]";
const chevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23aaa' stroke-width='1.6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 22px center",
} as const;
const label = "font-inter text-[11px] uppercase tracking-[0.14em] text-[#a3a3a3]";

// Same flow as the skincare EmailGate: validate the email, then the lead-magnet
// modal collects the company name and submits through the shared server action.
export function JewellerySnapshot({ segment }: { segment?: string }) {
  const [cat, setCat] = useState<string>((segment && JEWELLERY_SEGMENTS[segment]?.cat) || "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const id = useId();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConfirmation("");
    if (!isValidEmail(email)) {
      setError("Please use your work email so we can send the study.");
      return;
    }
    setError("");
    setModalOpen(true);
  }

  function onSuccess(state: LeadMagnetActionState) {
    setModalOpen(false);
    setConfirmation(
      state.status === "already_submitted"
        ? "You\u2019ve already requested the study. Check your inbox, and your spam folder, or contact info@altilos.com."
        : `We\u2019ve emailed the study to ${email} as a PDF. Check your inbox in a few minutes, and your spam folder if it isn\u2019t there.`,
    );
  }

  return (
    <section
      id="snapshot"
      className="relative scroll-mt-24 px-6 py-[120px]"
      style={{ background: "radial-gradient(70% 60% at 50% 50%,#1a1a1a 0%,#000 75%)" }}
      aria-labelledby="snapshot-title"
    >
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-12">
        <div className="min-w-0 flex-[1_1_440px]">
          <p className="mb-[18px] font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#F39019]">Free study</p>
          <h2 id="snapshot-title" className="font-plusJakartaSans text-[clamp(30px,3.4vw,42px)] font-normal leading-[1.15] tracking-[-0.03em] text-balance">
            Get the India Jewellery Consumer Landscape Study 2026.
          </h2>
          <p className="mt-[18px] max-w-[520px] font-inter text-base leading-[1.7] text-[#e5e5e5]">
            Six pages. 2,625 buyers. Every chart, every cut by generation and age band, and the methodology behind them. Free. No pitch. No card details.
          </p>
          <div className="mt-[22px] inline-flex items-center gap-2.5 font-inter text-[13px] text-[#d4d4d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F39019]" aria-hidden="true" />
            <span><strong className="text-white">2,625</strong> verified buyers across <strong className="text-white">180</strong> cities and towns</span>
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_420px]">
          {confirmation ? (
            <div role="status" className="rounded-[28px] border border-[#F39019]/45 bg-[#F39019]/5 p-8">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F39019]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><path d="M4 9.5l3.5 3.5L14 5.5" /></svg>
              </div>
              <h3 className="mb-2 mt-[18px] font-plusJakartaSans text-2xl font-medium">The study is on its way.</h3>
              <p className="font-inter text-[15px] leading-[1.7] text-[#e5e5e5]">{confirmation}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
              <label className="flex flex-col gap-2">
                <span className={label}>Work email <span aria-hidden="true">*</span></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="name@brand.com"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? `${id}-err` : undefined}
                  className={`${field} ${error ? "!border-[#ff8a6a]" : ""}`}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={label}>Your category (optional)</span>
                <select value={cat} onChange={(e) => setCat(e.target.value)} className={field} style={chevron}>
                  <option value="">Select a category</option>
                  {JEWELLERY_CATEGORIES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              {error && <p id={`${id}-err`} role="alert" className="-mt-1 ml-[22px] font-inter text-[13px] text-[#ff8a6a]">{error}</p>}
              <button
                type="submit"
                className="mt-1.5 inline-flex items-center justify-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]"
              >
                Send me the study <span className="text-base">→</span>
              </button>
            </form>
          )}
        </div>
      </div>
      <LeadMagnetModal open={modalOpen} defaultEmail={email} category={cat} onClose={() => setModalOpen(false)} onSuccess={onSuccess} />
    </section>
  );
}
