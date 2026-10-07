"use client";

import type { MutableRefObject, RefObject } from "react";
import type { Step } from "@/lib/content";

type Props = {
  steps: Step[];
  indicatorRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  listRef: RefObject<HTMLDivElement | null>;
};

export function StepIndicator({ steps, indicatorRefs, listRef }: Props) {
  return (
    <div className="steps-rail order-2 relative mx-auto h-40 w-full max-w-56 overflow-hidden md:order-none md:h-72 md:w-52 md:max-w-none">
      <div className="steps-rail-fade pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-linear-to-b from-black via-black/80 to-transparent sm:h-16 md:h-24" />
      <div className="steps-rail-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-linear-to-t from-black via-black/80 to-transparent sm:h-16 md:h-24" />

      <div className="steps-rail-track absolute left-0 right-0 top-1/2 -translate-y-[9px] sm:-translate-y-[12px] md:-translate-y-[18px]">
        <div
          ref={listRef}
          className="flex flex-col items-center gap-8 sm:gap-10 md:gap-15"
        >
          {steps.map((step, index) => (
            <div
              key={step.eyebrow}
              ref={(el) => {
                indicatorRefs.current[index] = el;
              }}
              className="steps-eyebrow text-lg font-poppins uppercase leading-none tracking-[0.22em] text-center text-[#404040] first:text-[#f97316] sm:text-2xl md:text-4xl md:tracking-wider"
            >
              {step.eyebrow}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
