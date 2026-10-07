import { footerContacts, footerLinks } from "@/lib/content";
import { LogoMark } from "@/components/LandingPage/ui/LogoMark";
import { ScrollLink } from "@/components/LandingPage/ui/ScrollLink";
import Link from "next/link";
import { COPYRIGHT_YEAR } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black px-5 py-12 text-white sm:px-8 lg:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 110%, rgba(249,115,22,0.55) 0%, rgba(249,115,22,0.28) 35%, rgba(220,38,38,0.12) 60%, rgba(0,0,0,0) 80%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <ScrollLink
          className="inline-flex items-center gap-2"
          to="top"
          ariaLabel="Altilos home"
        >
          <LogoMark size="lg" />
          <span className="font-inter text-3xl text-white sm:text-4xl">
            altilos<span className="text-[#f97316]">.</span>
          </span>
        </ScrollLink>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-inter text-white sm:gap-x-8"
          aria-label="Footer navigation"
        >
          {footerLinks.map((link, index) => (
            <span className="inline-flex items-center" key={link.label}>
              <Link
                className="transition hover:text-[#f97316]"
                href={link.href}
              >
                {link.label}
              </Link>
              {index < footerLinks.length - 1 && (
                <span aria-hidden="true" className="ml-6 text-[#444748] sm:ml-8">
                  |
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-inter text-[#c4c7c8] sm:gap-x-8">
          {footerContacts.map((contact, index) => (
            <span className="inline-flex items-center" key={contact.label}>
              <a
                className="transition hover:text-[#f97316]"
                href={contact.href}
              >
                {contact.label}
              </a>
              {index < footerContacts.length - 1 && (
                <span aria-hidden="true" className="ml-6 text-[#444748] sm:ml-8">
                  |
                </span>
              )}
            </span>
          ))}
        </div>

        <p className="font-inter text-xs text-[#8a8a8a]">
          ©{" "}
          <time dateTime={String(COPYRIGHT_YEAR)}>{COPYRIGHT_YEAR}</time>{" "}
          Altilos. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
