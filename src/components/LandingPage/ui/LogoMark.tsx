export function LogoMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const markSize = size === "lg" ? "h-10 w-10" : "h-7 w-7";

  return (
    <svg
      className={`${markSize} inline-block shrink-0`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="58" fill="#ff8017" />
      <rect x="29" y="25" width="64" height="70" rx="13" fill="black" />
      <path
        d="M37 37H50L75 84H88"
        stroke="#ff8017"
        strokeWidth="5.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M75 37H88"
        stroke="#ff8017"
        strokeWidth="5.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
