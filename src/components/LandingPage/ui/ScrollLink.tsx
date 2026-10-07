"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { sectionHref, type SectionId } from "@/lib/section-anchors";

export function ScrollLink({
  to,
  children,
  className,
  ariaLabel,
  onClick,
}: {
  to: SectionId;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented) return;
    // Modifier and middle clicks fall through to the browser, which now has a
    // real href to open rather than the bare "/" it used to get.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;

    onClick?.();
    event.preventDefault();

    if (pathname === "/") {
      smoothScrollToId(to);
      return;
    }

    // Cross-route: let the URL carry the intent. This used to stash the target
    // in sessionStorage and push a bare "/", but the consumer of that key lived
    // in the root layout — which is not remounted on a client-side navigation —
    // so it never ran. Arriving from /terms silently failed to scroll, and the
    // stale key then fired on some unrelated later hard load. useLandingHashAnchor
    // reads the fragment when Pricing mounts, after the pin spacer exists.
    //
    // `scroll` is suppressed only for the hash targets, where the hook does the
    // positioning itself. "top" resolves to a bare "/" with no fragment, so the
    // hook finds no target and does nothing — suppressing the router's own
    // scroll there would strand the reader at the previous page's offset.
    router.push(sectionHref(to), { scroll: to === "top" });
  }

  return (
    // A real href, not "/". These are the only internal links to the section
    // anchors, so with href="/" neither a crawler nor a middle-click could
    // reach #how-it-works, #plans, #faqs or #email-gate at all — the page
    // shipped eight self-links carrying eight different anchor texts.
    // handleClick still preventDefault()s, so a plain left click behaves
    // exactly as before and the URL stays clean.
    <Link
      href={sectionHref(to)}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}

function smoothScrollToId(id: SectionId) {
  if (typeof window === "undefined") return;
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
