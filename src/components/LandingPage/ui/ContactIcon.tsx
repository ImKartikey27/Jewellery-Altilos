export function ContactIcon({ icon }: { icon: "mail" | "phone" | "social" }) {
  if (icon === "phone") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
        <path
          d="M6.6 3.4 8 6.6 6.5 8c.8 1.7 2.1 3.1 3.8 3.8l1.5-1.5 3.1 1.4-.5 2.9c-.1.7-.7 1.2-1.4 1.2A10.8 10.8 0 0 1 4.2 7c0-.7.5-1.3 1.2-1.4l1.2-.2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  if (icon === "social") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
        <path
          d="M7.5 12.5 12.5 7.5M8 6H5.8A2.8 2.8 0 0 0 3 8.8v5.4A2.8 2.8 0 0 0 5.8 17h5.4a2.8 2.8 0 0 0 2.8-2.8V12m-4-9h7v7m0-7-7.5 7.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
      <path
        d="M3.5 5.5h13v9h-13v-9Zm.5.7 6 4.4 6-4.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
