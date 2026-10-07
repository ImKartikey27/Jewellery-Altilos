/**
 * Checkout is a full page load (the plan CTA is a plain <a>), so returning via
 * browser back re-runs the landing page from scratch. Leaving a breadcrumb here
 * lets the landing page re-anchor on the pricing grid — the section the user
 * actually wants to retry from — instead of wherever native scroll restoration
 * lands once the GSAP pin spacer changes the document height.
 */
export const RETURN_TO_PLANS_KEY = "altilos:return-to-plans";

export function markReturnToPlans() {
  try {
    window.sessionStorage.setItem(RETURN_TO_PLANS_KEY, "1");
  } catch {
    // Private-mode / storage-disabled browsers just get default scroll behaviour.
  }
}

type StorageLike = {
  getItem(key: string): string | null;
  removeItem(key: string): void;
};

/**
 * How the browser arrived at the current document. "back_forward" is the only
 * value that means the visitor pressed Back or Forward — which is the single
 * case this breadcrumb was written for.
 */
function currentNavigationType(): string | undefined {
  try {
    const [entry] = performance.getEntriesByType("navigation");
    return (entry as PerformanceNavigationTiming | undefined)?.type;
  } catch {
    return undefined;
  }
}

function defaultStorage(): StorageLike | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Clears the breadcrumb and reports whether the plans grid should be re-anchored.
 *
 * The two halves are deliberately separate. CLEARING is unconditional: the
 * marker is written on click, so it also gets written by a modifier-click that
 * opens checkout in another tab, and it survives a completed purchase. Left in
 * place it would fire on some unrelated later visit.
 *
 * HONOURING is limited to a back/forward navigation, because that is what the
 * marker actually means. Consuming it on any arrival at the home page sent the
 * "Altilos home" link on the checkout page — a request for the top of the page —
 * to the plans grid instead.
 *
 * Dependencies are injectable so the decision is testable; both default to the
 * browser.
 */
export function consumeReturnToPlans(
  deps: { navigationType?: string; storage?: StorageLike } = {}
): boolean {
  const storage = deps.storage ?? defaultStorage();
  if (!storage) return false;

  const navigationType =
    "navigationType" in deps ? deps.navigationType : currentNavigationType();

  try {
    if (storage.getItem(RETURN_TO_PLANS_KEY) !== "1") return false;
    storage.removeItem(RETURN_TO_PLANS_KEY);
    return navigationType === "back_forward";
  } catch {
    return false;
  }
}
