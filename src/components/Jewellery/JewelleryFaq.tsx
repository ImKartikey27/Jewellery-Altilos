import { jewelleryFaqs } from "@/lib/jewellery/content";

// Native <details>, as on the skincare page: works without JS and stays crawlable.
export function JewelleryFaq() {
  return (
    <section id="faqs" className="scroll-mt-28 px-6 pb-[120px] pt-[100px]" aria-labelledby="faqs-title">
      <div className="mx-auto max-w-[1160px]">
        <h2 id="faqs-title" className="mb-9 font-plusJakartaSans text-[clamp(30px,3.4vw,42px)] font-normal leading-[1.2] tracking-[-0.02em] text-balance">
          Frequently asked questions about Indian jewellery consumer research
        </h2>
        {jewelleryFaqs.map((f) => (
          <details key={f.question} className="group border-b border-white/70">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-[22px] text-left font-inter text-[19px] text-white marker:hidden">
              <h3 className="font-inter">{f.question}</h3>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.6" className="flex-none transition-transform duration-200 group-open:rotate-180"><path d="M3 6l5 5 5-5" /></svg>
            </summary>
            <p className="pb-6 pr-10 font-inter text-base leading-[1.75] text-[#a3a3a3]">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
