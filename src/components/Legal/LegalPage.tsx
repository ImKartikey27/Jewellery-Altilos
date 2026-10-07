import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/LandingPage/Footer";
import { Nav } from "@/components/LandingPage/Nav";
import { TableOfContents } from "@/components/Legal/TableOfContents";
import type { LegalBlock, LegalDoc } from "@/lib/legal/types";

const BODY = "font-inter text-[15px] leading-[1.8] text-[#c4c7c8]";
const LINK = "text-[#f97316] underline-offset-4 hover:underline";

// **bold** | [label](href)
const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(INLINE_PATTERN.source, "g");
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    if (match[1] !== undefined) {
      nodes.push(
        <strong className="font-semibold text-white" key={match.index}>
          {match[1]}
        </strong>,
      );
    } else {
      const href = match[3];
      const external = /^https?:/i.test(href);

      nodes.push(
        <a
          className={LINK}
          href={href}
          key={match.index}
          {...(external ? { rel: "noreferrer noopener", target: "_blank" } : {})}
        >
          {match[2]}
        </a>,
      );
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return <>{nodes}</>;
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <p className={`${BODY} mb-3`}>
          <Inline text={block.text} />
        </p>
      );

    case "h3":
      return (
        <h3 className="mt-8 mb-3 font-plusJakartaSans text-base font-semibold text-white">
          {block.text}
        </h3>
      );

    case "ul":
      return (
        <ul className="mb-3 flex flex-col gap-3">
          {block.items.map((item, index) => (
            <li className={`${BODY} relative pl-5`} key={index}>
              <span
                aria-hidden="true"
                className="absolute left-0 text-[#f97316]"
              >
                •
              </span>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="mb-3 overflow-x-auto rounded-xl border border-[#444748]">
          <table className="w-full min-w-[680px] border-collapse text-left [&_tr:last-child_td]:border-b-0">
            <thead>
              <tr>
                {block.head.map((heading) => (
                  <th
                    className="border-b border-[#444748] px-4 py-3 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
                    key={heading}
                    scope="col"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      className={`border-b border-[#444748]/60 px-4 py-3 font-inter text-[13px] ${
                        cellIndex === 0
                          ? "text-white"
                          : (block.cells ?? "mark") === "mark"
                            ? "text-center text-[#f97316]"
                            : "text-[#c4c7c8]"
                      }`}
                      key={cellIndex}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

// The four corner "+" glyphs that frame the hero.
function CornerCrosses() {
  const corners = [
    "left-4 top-4 sm:left-8 lg:left-14",
    "right-4 top-4 sm:right-8 lg:right-14",
    "bottom-4 left-4 sm:left-8 lg:left-14",
    "bottom-4 right-4 sm:right-8 lg:right-14",
  ];

  return (
    <>
      {corners.map((position) => (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute font-inter text-lg leading-none text-[#444748] ${position}`}
          key={position}
        >
          +
        </span>
      ))}
    </>
  );
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const sectionLinks = doc.sections.map(({ id, title }) => ({ id, title }));

  return (
    <div className="bg-black">
      <Nav />

      <main>
        <nav
          aria-label="Breadcrumb"
          className="mx-auto w-full max-w-[1100px] px-5 pt-6 pb-2 sm:px-8 lg:px-16"
        >
          <ol className="flex flex-wrap items-center gap-2 font-inter text-[13px] text-[#a1a1a1]">
            <li className="inline-flex items-center gap-2">
              <Link className="transition hover:text-[#f97316]" href="/">
                Home
              </Link>
              <span aria-hidden="true" className="text-[#444748]">
                /
              </span>
            </li>
            <li aria-current="page" className="text-white">
              {doc.breadcrumb}
            </li>
          </ol>
        </nav>

        <section className="relative px-5 py-12 sm:px-8 lg:px-16">
          <CornerCrosses />

          <div className="mx-auto max-w-[760px] text-center">
            <p className="mb-4 inline-flex items-center gap-2 font-inter text-[11px] uppercase tracking-[0.2em] text-[#f97316] lg:text-xs">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#f97316]"
              />
              {doc.eyebrow}
            </p>

            <h1 className="mb-3 font-plusJakartaSans text-4xl leading-tight tracking-tight text-white sm:text-5xl">
              <span className="font-light">{doc.titleLead}</span>{" "}
              <span className="font-bold">{doc.titleRest}</span>
            </h1>

            <p className="mx-auto mb-4 max-w-[540px] font-inter text-base leading-[1.7] text-[#c4c7c8]">
              {doc.subtitle}
            </p>

            {doc.lastUpdated && (
              <p className="inline-flex items-center gap-2 font-inter text-xs text-[#a1a1a1]">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[#f97316]"
                />
                Last updated{" "}
                <time dateTime={doc.lastUpdated.iso}>
                  {doc.lastUpdated.label}
                </time>
              </p>
            )}
          </div>
        </section>

        {/* No itemScope/itemType here. The page's WebPage entity — including
            dateModified — comes from the JSON-LD graph in the route. Declaring
            it twice in two vocabularies would give the URL two WebPage
            entities, which parsers do not merge, silently degrading the
            @id linking the rest of the graph depends on. */}
        <article className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-start gap-12 px-5 pt-6 pb-24 sm:px-8 lg:grid-cols-[240px_1fr] lg:gap-16 lg:px-16">
          <aside
            aria-label="Table of contents"
            className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
          >
            <TableOfContents sections={sectionLinks} />

            <div className="mt-6 rounded-xl border border-[#444748] bg-white/[0.03] p-4">
              <p className="mb-2 font-inter text-[13px] font-medium text-white">
                Need help?
              </p>
              <p className="mb-3 font-inter text-[13px] leading-[1.5] text-[#a1a1a1]">
                {doc.help.body}
              </p>
              <a
                className={`inline-flex items-center gap-1.5 font-inter text-[13px] font-medium ${LINK}`}
                href={`mailto:${doc.help.email}`}
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect height="16" rx="2" width="20" x="2" y="4" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {doc.help.email}
              </a>
            </div>
          </aside>

          <div className="max-w-[760px]">
            {doc.intro.length > 0 && (
              <div className="mb-12">
                {doc.intro.map((block, index) => (
                  <Block block={block} key={index} />
                ))}
              </div>
            )}

            {doc.sections.map((section) => (
              <section
                aria-labelledby={`${section.id}-title`}
                className="mb-12 scroll-mt-28"
                id={section.id}
                key={section.id}
              >
                <h2
                  className="mb-3 font-plusJakartaSans text-2xl font-semibold leading-snug text-white"
                  id={`${section.id}-title`}
                >
                  {section.title}
                </h2>
                {section.blocks.map((block, index) => (
                  <Block block={block} key={index} />
                ))}
              </section>
            ))}

            {doc.related.length > 0 && (
              <div className="mt-12 rounded-xl border border-[#444748] bg-white/[0.03] p-6">
                <p className="mb-2 font-inter text-sm font-medium text-white">
                  Related
                </p>
                <ul className="flex flex-col gap-1">
                  {doc.related.map((item) => (
                    <li key={item.href}>
                      <Link
                        className={`font-inter text-sm ${LINK}`}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
