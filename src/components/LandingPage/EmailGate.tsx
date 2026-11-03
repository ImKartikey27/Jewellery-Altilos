"use client";

import Image from "next/image";
import { FormEvent, useId, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

import { isValidEmail } from "@/lib/email-validation";
import { LeadMagnetModal } from "@/components/LandingPage/LeadMagnetModal";
import type { LeadMagnetActionState } from "@/app/_actions/submit-lead-magnet";

export function EmailGate() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation("");

    if (!isValidEmail(email)) {
      setError("Please use your work email so we can send the study.");
      return;
    }

    setError("");
    setModalOpen(true);
  }

  function handleModalSuccess(state: LeadMagnetActionState) {
    setModalOpen(false);
    if (state.status === "already_submitted") {
      setConfirmation(
        "You\u2019ve already requested the study. Check your inbox, and your spam folder, or contact info@altilos.com."
      );
    } else {
      setConfirmation(
        `The study is on its way. We\u2019ve emailed the study to ${email} as a PDF. Check your inbox in a few minutes, and your spam folder if it isn\u2019t there.`
      );
    }
  }

  return (
    <section
      id="email-gate"
      className="relative isolate overflow-hidden bg-black px-5 py-20 mb-5 scroll-mt-24 sm:px-8 lg:px-16"
      aria-labelledby="email-gate-title"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover object-center opacity-40"
        fill
        sizes="100vw"
        src="/images/pricing/mesh.jpeg"
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[600px_1fr] sm:gap-16">
        <div>
          <h2
            id="email-gate-title"
            className="text-3xl sm:text-4xl  font-plusJakartaSans leading-[39px] text-white"
          >
           Want the study cut to your brand, your competitors and your cities?
          </h2>
          <p className="mt-4 max-w-[456px]  font-inter text-base leading-[26px] text-white">
            Enter your preferred email to begin the onboarding process.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor={inputId}>
                Preferred email
              </label>
              <input
                id={inputId}
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                  if (confirmation) setConfirmation("");
                }}
                placeholder="name@brand.com"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={
                  error || confirmation ? `${inputId}-message` : undefined
                }
                className="h-[55px] w-full rounded-full border border-[#444748] bg-[#353434] px-[17px] text-base text-white outline-none transition placeholder:text-[#6b727f] focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              />
            </div>
            <button
              type="submit"
              className="group inline-flex h-[55px] items-center justify-center gap-3 rounded-full bg-[#f97316] border-2 border-[#f97316] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#f97316]/30"
            >
              <span className="font-inter">Submit</span>
              <FaArrowRight className="group-hover:-rotate-45 w-4 " />
            </button>
          </div>

          {(error || confirmation) && (
            <p
              id={`${inputId}-message`}
              className={`mt-3 text-sm ${
                error ? "text-[#fb861c]" : "text-[#c4c7c8]"
              }`}
              role={error ? "alert" : "status"}
            >
              {error || confirmation}
            </p>
          )}
        </form>
      </div>

      <LeadMagnetModal
        open={modalOpen}
        defaultEmail={email}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </section>
  );
}
