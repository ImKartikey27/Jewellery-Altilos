"use client";

import { useEffect, type RefObject, type MutableRefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACTIVE_COLOR = "#f97316";
const INACTIVE_COLOR = "#404040";
const Y_SHIFT_BODY = 28;
const Y_SHIFT_IMAGE = 14;

// Total pinned scroll distance in viewport-heights. Split into equal bands,
// one per step; scroll position only selects the active band — the crossfade
// itself is a fixed-duration tween, never tied to scroll progress.
const PIN_LENGTH_PER_STEP = 0.87;

// Hysteresis around band boundaries (fraction of one band, ~15px of scroll)
// so pixel jitter at a boundary can't flip-flop the active step.
const BAND_EPS = 0.02;

type Args = {
  sectionRef: RefObject<HTMLElement | null>;
  pinTargetRef: RefObject<HTMLDivElement | null>;
  bodyRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  indicatorRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  indicatorListRef: RefObject<HTMLDivElement | null>;
  imageRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  stepCount: number;
};

export function useStepsScroll({
  sectionRef,
  pinTargetRef,
  bodyRefs,
  indicatorRefs,
  indicatorListRef,
  imageRefs,
  stepCount,
}: Args) {
  useEffect(() => {
    const section = sectionRef.current;
    const pinTarget = pinTargetRef.current;
    if (!section || !pinTarget) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const bodies = bodyRefs.current.filter(Boolean) as HTMLDivElement[];
        const indicators = indicatorRefs.current.filter(
          Boolean,
        ) as HTMLDivElement[];
        const images = imageRefs.current.filter(Boolean) as HTMLDivElement[];
        const list = indicatorListRef.current;
        if (
          bodies.length !== stepCount ||
          indicators.length !== stepCount ||
          images.length !== stepCount ||
          !list
        ) {
          return;
        }

        // opacity, never autoAlpha. GSAP's autoAlpha also writes
        // visibility:hidden, which takes the step text out of the
        // accessibility tree and reads to a rendering crawler as hidden
        // content — four of the five most keyword-dense blocks on the page.
        // Hit-testing that visibility:hidden used to suppress is handled by the
        // `pointer-events: none` rule on .steps-panel in globals.css.
        //
        // No will-change here: a permanent will-change keeps the text on a
        // GPU-rasterized layer even at rest, which softens it. It's applied
        // per-transition instead and cleared on complete.
        bodies.forEach((b, i) =>
          gsap.set(b, {
            opacity: i === 0 ? 1 : 0,
            y: i === 0 ? 0 : Y_SHIFT_BODY,
          }),
        );
        images.forEach((img, i) =>
          gsap.set(img, {
            opacity: i === 0 ? 1 : 0,
            y: i === 0 ? 0 : Y_SHIFT_IMAGE,
          }),
        );
        indicators.forEach((ind, i) =>
          gsap.set(ind, { color: i === 0 ? ACTIVE_COLOR : INACTIVE_COLOR }),
        );
        gsap.set(list, { y: 0 });

        const measureSlotHeight = () => {
          if (indicators.length < 2) {
            return window.innerWidth < 768 ? 50 : 96;
          }
          // Both rects carry the same list translate, so the difference is
          // the untranslated slot height.
          const a = indicators[0].getBoundingClientRect();
          const b = indicators[1].getBoundingClientRect();
          return b.top - a.top;
        };
        let indicatorSlotHeight = measureSlotHeight();

        let activeIndex = 0;
        let transition: gsap.core.Timeline | null = null;

        const goToStep = (next: number) => {
          const prev = activeIndex;
          if (next === prev) return;
          activeIndex = next;
          const dir = next > prev ? 1 : -1;

          transition?.kill();

          // A killed mid-flight transition (fast fling across several bands,
          // or a quick direction reversal) can leave a third panel partially
          // visible — hard-reset everything that isn't part of this
          // transition before animating prev → next directly.
          bodies.forEach((b, i) => {
            if (i !== prev && i !== next) {
              gsap.set(b, {
                opacity: 0,
                y: Y_SHIFT_BODY * dir,
                clearProps: "willChange",
              });
            }
          });
          images.forEach((img, i) => {
            if (i !== prev && i !== next) {
              gsap.set(img, {
                opacity: 0,
                y: Y_SHIFT_IMAGE * dir,
                clearProps: "willChange",
              });
            }
          });
          indicators.forEach((ind, i) => {
            if (i !== prev && i !== next) {
              gsap.set(ind, { color: INACTIVE_COLOR });
            }
          });

          const tl = gsap.timeline({
            onComplete: () => {
              // Resting text must have no transform matrix (crisp subpixel
              // rendering) and no will-change (no forced GPU layer).
              gsap.set([bodies[next], images[next]], {
                clearProps: "transform,willChange",
              });
              transition = null;
            },
          });

          tl.set(
            [bodies[prev], images[prev], bodies[next], images[next]],
            { willChange: "transform, opacity" },
            0,
          )
            .set(bodies[next], { y: Y_SHIFT_BODY * dir }, 0)
            .set(images[next], { y: Y_SHIFT_IMAGE * dir }, 0)
            .to(
              bodies[prev],
              {
                opacity: 0,
                y: -Y_SHIFT_BODY * dir,
                duration: 0.28,
                ease: "power2.in",
              },
              0,
            )
            .to(
              images[prev],
              {
                opacity: 0,
                y: -Y_SHIFT_IMAGE * dir,
                duration: 0.28,
                ease: "power2.in",
              },
              0,
            )
            .to(
              bodies[next],
              { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" },
              0.16,
            )
            .to(
              images[next],
              { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" },
              0.16,
            )
            .to(
              indicators[prev],
              { color: INACTIVE_COLOR, duration: 0.3, ease: "power1.inOut" },
              0,
            )
            .to(
              indicators[next],
              { color: ACTIVE_COLOR, duration: 0.35, ease: "power1.inOut" },
              0.1,
            )
            .to(
              list,
              {
                y: -next * indicatorSlotHeight,
                duration: 0.4,
                ease: "power3.out",
              },
              0,
            )
            .set([bodies[prev], images[prev]], { clearProps: "willChange" });

          transition = tl;
        };

        const syncToProgress = (progress: number) => {
          const raw = progress * stepCount;
          if (raw >= activeIndex + 1 + BAND_EPS || raw < activeIndex - BAND_EPS) {
            goToStep(gsap.utils.clamp(0, stepCount - 1, Math.floor(raw)));
          }
        };

        const st = ScrollTrigger.create({
          trigger: pinTarget,
          start: "top top",
          end: () => `+=${window.innerHeight * stepCount * PIN_LENGTH_PER_STEP}`,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => syncToProgress(self.progress),
          onRefresh: (self) => {
            indicatorSlotHeight = measureSlotHeight();
            if (!transition) {
              gsap.set(list, { y: -activeIndex * indicatorSlotHeight });
            }
            syncToProgress(self.progress);
          },
        });

        return () => {
          transition?.kill();
          st.kill();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, [
    sectionRef,
    pinTargetRef,
    bodyRefs,
    indicatorRefs,
    indicatorListRef,
    imageRefs,
    stepCount,
  ]);
}
