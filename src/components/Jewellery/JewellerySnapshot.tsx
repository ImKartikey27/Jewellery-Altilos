"use client";

import { FormEvent, useId, useState } from "react";

import type { LeadMagnetActionState } from "@/app/_actions/submit-lead-magnet";
import { LeadMagnetModal } from "@/components/LandingPage/LeadMagnetModal";
import { isValidEmail } from "@/lib/email-validation";
import { JEWELLERY_BANDS, JEWELLERY_CATEGORIES, JEWELLERY_SEGMENTS } from "@/lib/jewellery/content";

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
export function JewellerySnapshot({ segment, deadline }: { segment?: string; deadline?: string }) {
  const [cat, setCat] = useState<string>((segment && JEWELLERY_SEGMENTS[segment]?.cat) || JEWELLERY_CATEGORIES[0]);
  const [band, setBand] = useState<string>(JEWELLERY_BANDS[1]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const id = useId();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConfirmation("");
    if (!isValidEmail(email)) {
      setError("Enter a valid work email.");
      return;
    }
    setError("");
    setModalOpen(true);
  }

  function onSuccess(state: LeadMagnetActionState) {
    setModalOpen(false);
    setConfirmation(
      state.status === "already_submitted"
        ? "You've already requested this snapshot. Check your inbox or contact support."
        : `${cat} · ${band}. We'll email ${email} when it's ready.`,
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
          <p className="mb-[18px] font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#F39019]">Free personalised snapshot</p>
          <h2 id="snapshot-title" className="font-plusJakartaSans text-[clamp(30px,3.4vw,42px)] font-normal leading-[1.15] tracking-[-0.03em] text-balance">
            Natural or lab-grown: who&apos;s switching before Dhanteras?
          </h2>
          <p className="mt-[18px] max-w-[520px] font-inter text-base leading-[1.7] text-[#e5e5e5]">
            Pick your category and ticket size. We&apos;ll build a snapshot from verified jewellery buyers in your market. No pitch. No card details.
          </p>
          <div className="mt-[22px] inline-flex items-center gap-2.5 font-inter text-[13px] text-[#d4d4d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F39019]" aria-hidden="true" />
            <span><strong className="text-white">[N]</strong> verified jewellery buyers across <strong className="text-white">[cities]</strong></span>
          </div>
          {deadline && <p className="mt-4 font-inter text-sm text-[#F7B262]">Claim by {deadline} to have it before Dhanteras (6 Nov)</p>}
        </div>

        <div className="min-w-0 flex-[1_1_420px]">
          {confirmation ? (
            <div role="status" className="rounded-[28px] border border-[#F39019]/45 bg-[#F39019]/5 p-8">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F39019]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><path d="M4 9.5l3.5 3.5L14 5.5" /></svg>
              </div>
              <h3 className="mb-2 mt-[18px] font-plusJakartaSans text-2xl font-medium">Your snapshot request is in.</h3>
              <p className="font-inter text-[15px] leading-[1.7] text-[#e5e5e5]">{confirmation}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
              <label className="flex flex-col gap-2">
                <span className={label}>Category</span>
                <select value={cat} onChange={(e) => setCat(e.target.value)} className={field} style={chevron}>
                  {JEWELLERY_CATEGORIES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className={label}>Typical ticket size</span>
                <select value={band} onChange={(e) => setBand(e.target.value)} className={field} style={chevron}>
                  {JEWELLERY_BANDS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className={label}>Work email</span>
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
              {error && <p id={`${id}-err`} role="alert" className="-mt-1 ml-[22px] font-inter text-[13px] text-[#ff8a6a]">{error}</p>}
              <button
                type="submit"
                className="mt-1.5 inline-flex items-center justify-center gap-3.5 rounded-full bg-[#F39019] px-8 py-[19px] font-inter text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#FFA033]"
              >
                Get it before Dhanteras <span className="text-base">→</span>
              </button>
            </form>
          )}
        </div>
      </div>
      <LeadMagnetModal open={modalOpen} defaultEmail={email} onClose={() => setModalOpen(false)} onSuccess={onSuccess} />
    </section>
  );
}
