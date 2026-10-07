import { faqs } from "@/lib/content";
import { ScrollLink } from "@/components/LandingPage/ui/ScrollLink";

export function FAQ() {
  return (
    <section
      id="faqs"
      className="scroll-mt-28 bg-black px-5 py-20 sm:px-8 lg:px-16"
      aria-labelledby="faqs-title"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="faqs-title"
          className=" text-4xl sm:text-[40px] font-plusJakartaSans leading-tight text-white "
        >
          Frequently asked questions about Indian skincare consumer research
        </h2>
        <div className="mt-6 flex flex-col gap-2">
          {faqs.map((faq) => (
            <details
              className="group border-b  border-[#e9e9eb]"
              key={faq.question}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-xl font-inter text-white marker:hidden">
                {/* A heading inside <summary> is the accepted pattern for a
                    <details> accordion — it is the only way the question is a
                    heading at all. Preflight leaves the rendering identical to
                    the <span> it replaces. */}
                <h3 className="font-inter">{faq.question}</h3>
                <svg
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-white transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p className="max-w-3xl pb-5 text-base leading-7 font-inter text-[#c4c7c8]">
                {faq.answer}
                {faq.cta && (
                  <>
                    {" "}
                    <ScrollLink
                      to={faq.cta.to}
                      className="text-[#F97316] underline-offset-4 hover:underline"
                    >
                      {faq.cta.label}
                    </ScrollLink>
                    .
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
