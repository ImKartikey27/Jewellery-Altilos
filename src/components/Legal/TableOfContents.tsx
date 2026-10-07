"use client";

import { useEffect, useState } from "react";

// Sticky "ON THIS PAGE" nav with scroll spy. The observer's top inset clears
// the sticky Nav pill (top-5 on a h-[52px] pill ≈ 96px) so a section counts as
// active only once its heading is actually visible below the nav.
const OBSERVER_MARGIN = "-112px 0px -60% 0px";

export function TableOfContents({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const ids = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const nodes = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: OBSERVER_MARGIN, threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ids]);

  return (
    <>
      <p className="mb-4 font-inter text-[11px] uppercase tracking-[0.2em] text-[#f97316]">
        On this page
      </p>
      <nav aria-label="Sections">
        <ul className="flex flex-col gap-1">
          {sections.map((section) => {
            const active = section.id === activeId;

            return (
              <li key={section.id}>
                <a
                  aria-current={active ? "true" : undefined}
                  className={`block rounded-r-md border-l-2 py-1.5 pl-3 pr-2 font-inter text-[13px] leading-snug transition-colors duration-200 ${
                    active
                      ? "border-[#f97316] bg-white/[0.06] font-medium text-white"
                      : "border-[#444748] text-[#a1a1a1] hover:border-[#a1a1a1] hover:text-white"
                  }`}
                  href={`#${section.id}`}
                >
                  {section.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
