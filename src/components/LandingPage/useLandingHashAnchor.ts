"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { consumeReturnToPlans } from "@/lib/return-to-plans";

/**
 * The Steps section is pinned by ScrollTrigger, which only adds its ~4.5vh pin
 * spacer after hydration. Anything that anchors the page before that — native
 * scroll restoration on back-nav, or the browser's own hash jump — is computed
 * against a much shorter document and ends up clamped inside the pinned Steps
 * range (the "step 3" landing).
 *
 * So we take over: suppress the browser's attempt, wait for load + a refreshed
 * ScrollTrigger layout, then jump to the target ourselves.
 *
 * This handles ANY resolving hash, not just the plans grid, because the section
 * anchors are now real crawlable hrefs — so `/#faqs` is a URL that search
 * results and shared links will actually land on, and every anchor below the
 * Steps section hits the same stale-offset problem.
 *
 * @param fallbackId target for a post-checkout return, where there is no hash.
 */
export function useLandingHashAnchor(fallbackId: string) {
  useEffect(() => {
    // A bfcache restore replays the page with its pin spacer (and scroll
    // position) intact, so there is nothing to fix — but the breadcrumb must
    // still be cleared, or it fires on some unrelated later visit.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) consumeReturnToPlans();
    };
    window.addEventListener("pageshow", onPageShow);

    // Consumed unconditionally and first: short-circuiting past it would leave
    // the breadcrumb to fire on an unrelated later visit.
    const returning = consumeReturnToPlans();

    // A hand-typed or truncated fragment like "/#%" is not valid percent-
    // encoding, and decodeURIComponent throws URIError on it. Unguarded, that
    // aborted the effect here — after the breadcrumb was already consumed and
    // the pageshow listener already added, but before any cleanup was returned
    // — turning a malformed URL into a client-side error plus a leaked
    // listener. An undecodable fragment is simply no target.
    let hashId = "";
    try {
      hashId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      hashId = "";
    }

    const targetId =
      (hashId && document.getElementById(hashId) ? hashId : "") ||
      (returning ? fallbackId : "");

    if (!targetId) {
      return () => window.removeEventListener("pageshow", onPageShow);
    }

    const previousRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    let cancelled = false;

    const restoreRestoration = () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previousRestoration;
      }
    };

    const anchor = () => {
      if (cancelled) return;
      // Pin spacers are sized here; without this the target's offset is stale.
      ScrollTrigger.refresh();
      document.getElementById(targetId)?.scrollIntoView({
        block: "start",
        // Not "auto": globals.css sets html { scroll-behavior: smooth }
        // unconditionally, and "auto" resolves to the computed value — so the
        // jump would animate through the entire pinned Steps range, and could
        // be interrupted mid-flight.
        behavior: "instant",
      });
      restoreRestoration();
    };

    // Two frames after `load`: images are sized, GSAP's matchMedia effect has
    // run, and the pin spacer exists.
    const run = () =>
      requestAnimationFrame(() => requestAnimationFrame(anchor));

    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("load", run);
      restoreRestoration();
    };
  }, [fallbackId]);
}
