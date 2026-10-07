import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

import { ScrollLink } from "@/components/LandingPage/ui/ScrollLink";
import type { SectionId } from "@/lib/section-anchors";

const CLASS_NAME =
  "group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#f97316] border-2 border-[#f97316] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#f97316]/30";

export function PrimaryButton({
  children,
  to,
  href,
}: {
  children: React.ReactNode;
  to?: SectionId;
  href?: string;
}) {
  const inner = (
    <>
      <span className="font-inter">{children}</span>
      <FaArrowRight className="group-hover:-rotate-45 w-4 " />
    </>
  );

  if (href) {
    const isExternal =
      href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (isExternal) {
      return (
        <a className={CLASS_NAME} href={href}>
          {inner}
        </a>
      );
    }
    return (
      <Link className={CLASS_NAME} href={href}>
        {inner}
      </Link>
    );
  }

  return (
    <ScrollLink className={CLASS_NAME} to={to ?? "email-gate"}>
      {inner}
    </ScrollLink>
  );
}
