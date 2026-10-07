import type { IconType } from "react-icons";
import { FiClock, FiFileText, FiHeadphones } from "react-icons/fi";
import type { ConfirmationCard as ConfirmationCardData } from "@/lib/content";

const iconMap: Record<ConfirmationCardData["icon"], IconType> = {
  report: FiFileText,
  secure: FiClock,
  help: FiHeadphones,
};

type Props = {
  card: ConfirmationCardData;
};

export function ConfirmationCard({ card }: Props) {
  const Icon = iconMap[card.icon];

  return (
    <article className=" rounded-[36px] border border-[#7a4f36]/80 bg-[#0d0d0d]/95 px-9 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm ">
      <Icon className="h-8 w-8 text-[#ffb787]" aria-hidden="true" />
      <h2 className="mt-4 max-w-[16ch]  text-2xl font-hankenGrotesk leading-tight text-[#e7e7e7] sm:text-[28px]">
        {card.title}
      </h2>
      <p className="mt-5 max-w-sm font-inter text-[16px] leading-snug text-[#d8c4b8]">
        {card.body}
      </p>
    </article>
  );
}
