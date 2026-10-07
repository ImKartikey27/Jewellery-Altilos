"use client";

import { useFormStatus } from "react-dom";
import { FiLoader } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";

export function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <>
            {pending && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
                >
                    <div className="flex max-w-sm flex-col items-center rounded-lg border border-[#6f4b38]/80 bg-[#111111] px-8 py-7 text-center shadow-2xl">
                        <FiLoader className="h-8 w-8 animate-spin text-[#ff7f1a]" aria-hidden="true" />
                        <p className="mt-5 font-poppins text-lg font-semibold text-white">
                            Submitting your details
                        </p>
                        <p className="mt-2 font-inter text-sm leading-6 text-[#d8c4b8]">
                            Hang tight while we open the next page.
                        </p>
                    </div>
                </div>
            )}
            <button
                type="submit"
                disabled={pending}
                aria-disabled={pending}
                className="group mt-16 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-[#f97316] bg-[#f97316] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-black hover:text-[#f97316] focus:outline-none focus:ring-4 focus:ring-[#f97316]/30 disabled:cursor-wait"
            >
                <span className="font-inter">{pending ? "Submitting..." : "Submit"}</span>
                {pending ? (
                    <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                    <FaArrowRight className="w-4 group-hover:-rotate-45" />
                )}
            </button>
        </>
    );
}
