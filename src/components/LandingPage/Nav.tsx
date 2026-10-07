"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";
import { Brand } from "@/components/LandingPage/ui/Brand";
import { ScrollLink } from "@/components/LandingPage/ui/ScrollLink";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // No explicit role="banner". On the home page this header renders inside
    // <main> (app/page.tsx), and ARIA forbids a banner landmark there — the
    // explicit role produced an invalid landmark hierarchy. Moving the header
    // out of <main> would fix the nesting but also change its behaviour: it is
    // sticky inside an overflow-hidden, isolate ancestor, which currently
    // confines the stickiness to the hero wrapper. That behaviour is
    // intentional, so the landmark is dropped instead. A bare <header> nested
    // in <main> maps to `generic`, which is valid; the legal pages, where this
    // same component sits outside <main>, still expose a real banner.
    <header
      className="sticky top-5 z-30 px-5 pt-5 pb-4 sm:px-8"
      id="top"
    >
      <div
        className={`mx-auto flex h-[52px] w-full max-w-[1008px] items-center justify-between gap-6 rounded-full pl-5 pr-2 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "border border-white/10 bg-white/10 backdrop-blur-xl backdrop-saturate-150"
            : "border border-transparent bg-white"
        }`}
      >
        <Brand tone={scrolled ? "light" : "dark"} />
        <nav
          aria-label="Primary"
          className={`hidden items-center gap-10 text-base transition-colors duration-300 lg:flex ${
            scrolled ? "text-white/90" : "text-black"
          }`}
        >
          {navLinks.map((link) => (
            <ScrollLink
              className="transition font-inter text-[14px] hover:text-[#f97316]"
              to={link.to}
              key={link.to}
            >
              {link.label}
            </ScrollLink>
          ))}
        </nav>
        <ScrollLink
          className="inline-flex font-inter text-[14px] h-9 shrink-0 items-center justify-center rounded-[18px] border border-[#fb861c] bg-[#f97316] px-5 text-sm  text-white shadow-[0_4px_15px_rgba(251,134,28,0.25)] transition hover:bg-[#fb861c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/25"
          to="email-gate"
        >
          Get Free report
        </ScrollLink>
      </div>
    </header>
  );
}
