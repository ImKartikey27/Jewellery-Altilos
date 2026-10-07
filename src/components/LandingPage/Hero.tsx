import Image from "next/image";

import { PrimaryButton } from "@/components/LandingPage/ui/PrimaryButton";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-10 lg:pt-0"
      aria-labelledby="hero-title"
    >
      {/* Copy shell: centred and capped so the split stops drifting left of the
          photo (and out of line with the Nav) on wide displays. */}
      <div className="mx-auto max-w-[1600px] lg:flex lg:min-h-[clamp(720px,84vh,880px)] lg:items-center">
        {/* Copy */}
        <div className="relative z-10 px-5 text-center sm:px-8 lg:w-[64%] lg:px-0">
          <div className="mx-auto max-w-[700px]">
            {/* The h1, despite being the smaller line. This is the only
                string on the page naming the category and the market, and
                the h1 is what crawlers and answer engines weight most.
                Tailwind Preflight resets h1 font-size and font-weight to
                inherit, so the classes below fully determine the
                appearance. */}
            <h1
              id="hero-title"
              className="font-inter text-[13px] uppercase tracking-[0.2em] text-[#F97316] lg:text-[15px]"
            >
              Real-Time Intelligence for Indian D2C Skincare Brands
            </h1>
            <p className="mt-8 font-plusJakartaSans text-3xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-4xl lg:mt-16 lg:text-[2.75rem]">
              <span className="text-[#F97316]">Win</span> and{" "}
              <span className="text-[#F97316]">Keep</span> Your{" "}
              <span className="text-[#F97316]">Consumers,</span>{" "}
              <br className="hidden lg:block" />
              <span className="text-[#F97316]">Before</span> Your{" "}
              <span className="text-[#F97316]">Competition</span> Does
            </p>
            <p className="mt-6 font-inter text-base leading-[1.9] text-[#E8E8E8] lg:mt-7 lg:text-[15px] lg:leading-[2.2]">
              <span className="font-bold">5 million+</span> verified category{" "}
              <span className="font-bold">consumers</span>.{" "}
              <span className="font-bold">Proprietary</span> AI analysis,{" "}
              <span className="font-bold">validated</span> by{" "}
              <span className="font-bold">industry</span> experts.{" "}
              <br className="hidden lg:block" />
              <span className="font-bold">Decision-ready</span> reports in{" "}
              <span className="font-bold">under 7 days</span>, from{" "}
              <span className="font-bold">₹8,000</span>.
            </p>
            <div className="mt-10 flex justify-center font-black lg:mt-14">
              <PrimaryButton>Get Your Free Report</PrimaryButton>
            </div>
            <p className="mt-4 font-inter text-sm text-white">
              No contracts. No lock-ins. No assumptions dressed up as data.
            </p>
          </div>
        </div>
      </div>

      {/* Visual: in flow below the copy on mobile, anchored bottom-right on
          desktop — to the section, so it bleeds past the capped copy shell.
          Sized by HEIGHT (82% of the band) with the width coming from the
          intrinsic ratio, so it can never outgrow the band and be clipped, at
          any viewport width. The bleed is a fixed 5rem rather than a percentage
          so the subject's clearance from the copy does not shrink as the
          viewport widens. */}
      <div className="relative mt-4 h-[360px] w-full overflow-hidden sm:h-[440px] lg:absolute lg:-right-20 lg:bottom-0 lg:mt-0 lg:aspect-[3120/1593] lg:h-[82%] lg:w-auto">
        {/* Mobile: pin the subject's own centre (63.5% across the photo) to the
            container's centre, independent of viewport size. */}
        <Image
          src="/images/hero/lady-v3.webp"
          alt="A smiling young Indian woman resting a hand on her cheek, lit by an orange glow"
          width={3120}
          height={1593}
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 1440px, 100vw"
          className="absolute left-1/2 h-full w-auto max-w-none -translate-x-[63.5%] lg:relative lg:left-auto lg:w-full lg:translate-x-0 lg:object-cover"
        />
        {/* Mobile fade — scoped to the photo so it never reaches the copy */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.97)_22%,rgba(0,0,0,0.72)_52%,rgba(0,0,0,0.28)_78%,transparent_100%)] lg:hidden"
        />
      </div>

      {/* Desktop fade — full-bleed so the photo and the glow dissolve together */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[22%] bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.97)_22%,rgba(0,0,0,0.72)_52%,rgba(0,0,0,0.28)_78%,transparent_100%)] lg:block"
      />
    </section>
  );
}
