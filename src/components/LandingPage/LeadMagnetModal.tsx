"use client";

import { useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { FaArrowRight } from "react-icons/fa";
import { FiX } from "react-icons/fi";

import { LEAD_CATEGORIES } from "@/lib/lead-magnet-validation";
import {
  submitLeadMagnetAction,
  type LeadMagnetActionState,
} from "@/app/_actions/submit-lead-magnet";

type LeadMagnetModalProps = {
  open: boolean;
  defaultEmail: string;
  onClose: () => void;
  onSuccess?: (state: LeadMagnetActionState) => void;
};

const initialState: LeadMagnetActionState = { status: "idle" };

export function LeadMagnetModal({
  open,
  defaultEmail,
  onClose,
  onSuccess,
}: LeadMagnetModalProps) {
  const [state, formAction] = useActionState(submitLeadMagnetAction, initialState);

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (state.status === "submitted" || state.status === "already_submitted") {
      onSuccess?.(state);
    }
  }, [state, onSuccess]);

  if (!open || typeof document === "undefined") return null;

  const errorMessage =
    state.status === "invalid_email" ||
    state.status === "missing_company" ||
    state.status === "error"
      ? state.message ?? "Something went wrong. Please try again."
      : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-magnet-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-lg border border-[#57423680] bg-[#0E0E0E] shadow-[0_0_40px_-10px_rgba(255,133,27,0.15)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-[#574236CC] px-6 py-6">
          <div>
            <h2
              id="lead-magnet-title"
              className="font-hankenGrotesk text-2xl leading-none text-[#E2E2E2]"
            >
              Get the free study
            </h2>
            <p className="mt-2 font-poppins text-sm tracking-[0.08em] text-[#DEC1B0]">
              India Jewellery Consumer Landscape Study 2026
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center rounded-full text-[#DEC1B0] transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/40"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>

        <form action={formAction} className="px-6 pb-0 pt-6">
          {errorMessage && (
            <p
              className="mb-6 text-sm text-[#fb861c]"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <div className="space-y-6">
            <label className="block">
              <span className="font-poppins text-sm font-medium tracking-wide text-[#DEC1B0]">
                Work email <span aria-hidden="true">*</span>
              </span>
              <input
                type="email"
                name="email"
                required
                defaultValue={defaultEmail}
                placeholder="name@brand.com"
                className="mt-3 h-[49px] w-full rounded-lg border border-[#574236CC] bg-[#1F1F1F] px-4 font-inter text-base text-white outline-none transition placeholder:text-[#3C3C3C] focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              />
            </label>

            <label className="block">
              <span className="font-poppins text-sm font-medium tracking-wide text-[#DEC1B0]">
                Brand or company <span aria-hidden="true">*</span>
              </span>
              <input
                type="text"
                name="companyName"
                required
                pattern=".*\S.*"
                title="Company name cannot be empty."
                placeholder="Your brand"
                className="mt-3 h-[49px] w-full rounded-lg border border-[#574236CC] bg-[#1F1F1F] px-4 font-inter text-base text-white outline-none transition placeholder:text-[#3C3C3C] focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              />
            </label>

            <label className="block">
              <span className="font-poppins text-sm font-medium tracking-wide text-[#DEC1B0]">
                Your category (optional)
              </span>
              <select
                name="category"
                defaultValue=""
                className="mt-3 h-[49px] w-full rounded-lg border border-[#574236CC] bg-[#1F1F1F] px-4 font-inter text-base text-white outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              >
                <option value="">Select a category</option>
                {LEAD_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="-mx-6 mt-12 flex justify-center border-t border-[#574236CC] bg-[#1B1B1B] px-6 py-6">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex h-[55px] w-[263px] items-center justify-center gap-3 rounded-full bg-[#f97316] text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_4px_10px_0_rgba(249,115,22,0.25)] transition-colors duration-200 hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#f97316]/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="font-inter">
        {pending ? "Sending…" : "Send me the study"}
      </span>
      {!pending && (
        <FaArrowRight className="w-4 transition-transform group-hover:-rotate-45" />
      )}
    </button>
  );
}
