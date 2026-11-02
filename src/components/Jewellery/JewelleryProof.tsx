import { jewelleryProofBand } from "@/lib/jewellery/content";

export function JewelleryProof() {
  return (
    <section className="px-6 pb-[100px]" aria-labelledby="proof-title">
      <div className="mx-auto max-w-[1000px] rounded-[28px] border border-white/20 bg-[linear-gradient(135deg,rgba(243,144,25,.12),rgba(0,0,0,0)_70%)] p-8 sm:p-12">
        <h2 id="proof-title" className="font-plusJakartaSans text-[clamp(26px,3vw,38px)] font-normal leading-[1.2] tracking-[-0.02em] text-balance">
          {jewelleryProofBand.headline}
        </h2>
        <p className="mt-5 max-w-3xl font-inter text-base leading-[1.75] text-white">{jewelleryProofBand.body}</p>
        <p className="mt-5 max-w-3xl font-inter text-[15px] leading-7 text-[#cfcfcf]">
          <span className="font-semibold text-[#F39019]">Honest note: </span>
          {jewelleryProofBand.note}
        </p>
      </div>
    </section>
  );
}
