import { LogoMark } from "@/components/LandingPage/ui/LogoMark";
import { ScrollLink } from "@/components/LandingPage/ui/ScrollLink";

export function Brand({
  size = "sm",
  tone = "dark",
}: {
  size?: "sm" | "lg";
  tone?: "dark" | "light";
}) {
  return (
    <ScrollLink className="inline-flex items-center gap-2" to="top" ariaLabel="Altilos home">
      <LogoMark size={size} />
      <span
        className={`font-inter ${
          size === "lg" ? "text-2xl" : "text-xl"
        } ${tone === "light" ? "text-white" : "text-[#1d1d1d]"}`}
      >
        altilos<span className="text-[#f97316]">.</span>
      </span>
    </ScrollLink>
  );
}
