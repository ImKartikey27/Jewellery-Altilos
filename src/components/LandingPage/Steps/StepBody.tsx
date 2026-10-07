"use client";

import type { MutableRefObject } from "react";
import type { Step } from "@/lib/content";

type Props = {
  steps: Step[];
  bodyRefs: MutableRefObject<Array<HTMLDivElement | null>>;
};

export function StepBody({ steps, bodyRefs }: Props) {
  return (
    <div className="order-3 flex w-full flex-col gap-4 md:order-none">
      <div className="steps-stage relative min-h-45 w-full pt-2 sm:min-h-45 md:min-h-45 md:pt-0">
        {steps.map((step, index) => (
          <div
            key={step.eyebrow}
            ref={(el) => {
              bodyRefs.current[index] = el;
            }}
            className="steps-panel absolute inset-0 flex h-full flex-col justify-center text-center md:text-left"
          >
            <h3 className="text-[18px] font-plusJakartaSans uppercase leading-tight text-white sm:text-[20px]">
              {step.title}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 font-poppins text-[#a1a1a1] md:mx-0">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
