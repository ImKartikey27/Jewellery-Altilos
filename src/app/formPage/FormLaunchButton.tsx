"use client";

import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

export function FormLaunchButton() {
    const [isLoading, setIsLoading] = useState(false);

    function handleClick() {
        setIsLoading(true);

        window.setTimeout(() => {
            scrollToForm();
            setIsLoading(false);
        }, 450);
    }

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                aria-busy={isLoading}
                className={`group inline-flex h-14 items-center justify-center gap-3 rounded-full border-2 border-[#f97316] bg-[#f97316] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#f97316]/30 ${isLoading ? "cursor-wait opacity-80" : ""}`}
            >
                <span className="font-inter">
                    {isLoading ? "Loading Form" : "Get Free Market report"}
                </span>
                <FaArrowRight className="w-4 group-hover:-rotate-45" />
            </button>

            {isLoading && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm">
                    <div className="rounded-lg border border-[#6f4b38]/80 bg-black/85 px-8 py-6 text-center shadow-2xl">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#6f4b38] border-t-[#f97316]" />
                        <p className="mt-4 font-inter text-sm uppercase tracking-[0.12em] text-[#d8c4b8]">
                            Loading form
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

function scrollToForm() {
    const form = document.getElementById("onboarding-form");
    if (!form) return false;

    form.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
    return true;
}
