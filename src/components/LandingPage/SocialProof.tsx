import Image from "next/image";

import { metrics, partnerLogos } from "@/lib/content";

export function Benchmarks() {
  return (
    <section
      className="bg-transparent px-5 py-12 sm:px-8 lg:px-16"
      aria-label="Altilos benchmarks"
    >
      {/* A description list, because each number answers a term: "Decision
          Velocity: 6x Faster". The <dl> takes the grid classes, so the layout
          is unchanged — Preflight zeroes the UA margin a <dd> would otherwise
          carry. */}
      <dl className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <div className="py-3 text-center" key={metric.label}>
            <dt className="font-inter text-[11px] uppercase tracking-[0.2em] text-[#a1a1a1]">
              {metric.label}
            </dt>
            <dd className="mt-2 text-3xl font-bold leading-none text-white font-plusJakartaSans sm:text-4xl">
              {metric.value}
            </dd>
            <dd className="mx-auto mt-4 max-w-sm whitespace-pre-line font-inter text-base leading-7 text-white">
              {metric.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const MARQUEE_COPIES = 4;

export function LogoRow() {
  const loop = Array.from({ length: MARQUEE_COPIES }, () => partnerLogos).flat();

  return (
    <section
      className="overflow-hidden bg-transparent py-20"
      aria-label="Partner logos"
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-black to-transparent" />
        <div className="logo-marquee-track flex w-max items-center">
          {loop.map((logo, index) => {
            // Copies 2-4 exist only so the -50% marquee keyframe has enough
            // track to loop seamlessly on wide viewports.
            const isDuplicate = index >= partnerLogos.length;

            return (
              <div
                className="relative h-20 w-30 shrink-0 mr-12"
                key={`${logo.image}-${index}`}
                aria-hidden={isDuplicate ? "true" : undefined}
              >
                <Image
                  src={logo.image}
                  // aria-hidden on the wrapper hides duplicates from assistive
                  // tech but leaves their alt in the DOM, so a text extractor
                  // read every brand name four times. Blanking the alt is what
                  // actually fixes it.
                  alt={isDuplicate ? "" : logo.name}
                  fill
                  // The container is 120px wide (w-30); "60px" made Next pick a
                  // 64w candidate at 1x DPR, which rendered visibly soft.
                  sizes="120px"
                  className="object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  return (
    <>
      <Benchmarks />
      <LogoRow />
    </>
  );
}
