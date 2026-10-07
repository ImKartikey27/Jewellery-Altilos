"use client";

import { useRef } from "react";
import { steps } from "@/lib/content";
import { StepBody } from "@/components/LandingPage/Steps/StepBody";
import { StepImage } from "@/components/LandingPage/Steps/StepImage";
import { StepIndicator } from "@/components/LandingPage/Steps/StepIndicator";
import { useStepsScroll } from "@/components/LandingPage/Steps/useStepsScroll";

export function Steps() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinTargetRef = useRef<HTMLDivElement | null>(null);
  const bodyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const indicatorRefs = useRef<Array<HTMLDivElement | null>>([]);
  const indicatorListRef = useRef<HTMLDivElement | null>(null);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useStepsScroll({
    sectionRef,
    pinTargetRef,
    bodyRefs,
    indicatorRefs,
    indicatorListRef,
    imageRefs,
    stepCount: steps.length,
  });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="steps-section scroll-mt-24 bg-black px-5 py-10 sm:px-8 sm:py-12 lg:px-16 lg:py-0"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-7xl">
        <div
          ref={pinTargetRef}
          className="steps-pin-target flex flex-col gap-12 md:h-screen md:justify-center md:gap-10"
        >
          <div className="mx-auto max-w-4xl text-center">
            <h2
              id="how-it-works-title"
              className="text-4xl leading-tight font-plusJakartaSans tracking-tight text-white sm:text-[44px]"
            >
              How it Works
            </h2>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_220px_1.2fr] md:items-center md:gap-12">
            <StepBody steps={steps} bodyRefs={bodyRefs} />
            <StepIndicator
              steps={steps}
              indicatorRefs={indicatorRefs}
              listRef={indicatorListRef}
            />
            <StepImage steps={steps} imageRefs={imageRefs} />
          </div>
        </div>
      </div>
    </section>
  );
}
