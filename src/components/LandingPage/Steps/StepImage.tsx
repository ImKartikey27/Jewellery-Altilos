"use client";

import Image from "next/image";
import type { MutableRefObject } from "react";
import type { Step } from "@/lib/content";

type Props = {
  steps: Step[];
  imageRefs: MutableRefObject<Array<HTMLDivElement | null>>;
};

export function StepImage({ steps, imageRefs }: Props) {
  return (
    <div className="order-1 relative mx-auto mt-4 aspect-3/2 w-full max-w-xl overflow-hidden rounded-[28px] border border-white/20 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:order-0 md:mt-0 md:rounded-[37px]">
      {steps.map((step, index) => (
        <div
          key={step.image}
          ref={(el) => {
            imageRefs.current[index] = el;
          }}
          className="steps-image-layer absolute inset-0"
        >
          <Image
            src={step.image}
            alt={`${step.eyebrow}: ${step.title}`}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
