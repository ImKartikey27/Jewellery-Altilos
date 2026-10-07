import type { Metadata, Viewport } from "next";
import { bricolageGrotesque } from "@/fonts/fonts";
import { hankenGrotesk } from "@/fonts/fonts";
import { poppins } from "@/fonts/fonts";
import { inter } from "@/fonts/fonts";
import {geist} from "@/fonts/fonts";
import {plusJakartaSans} from "@/fonts/fonts";
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  TITLE_TEMPLATE,
} from "@/lib/site";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `default` is required alongside `template`. Note the template does NOT
  // apply to app/page.tsx — a layout's template never reaches a page in the
  // same route segment — so the home page deliberately exports no title.
  title: { default: SITE_TITLE, template: TITLE_TEMPLATE },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  publisher: SITE_NAME,
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Large thumbnails in Discover and AI Overviews, and no cap on snippet
      // length — the snippet is the quotable unit an answer engine lifts.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(GOOGLE_SITE_VERIFICATION && {
    verification: { google: GOOGLE_SITE_VERIFICATION },
  }),
  openGraph: {
    ...OG_BASE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: { ...TWITTER_BASE, title: SITE_TITLE, description: SITE_DESCRIPTION },
  // No `alternates` here on purpose: a canonical set on the layout is inherited
  // by every page that does not override it, which had the three funnel pages
  // declaring themselves to be the homepage. Each page declares its own.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Every page is bg-black; without this the mobile browser chrome flashes
  // white on load. Neither property affects layout, so the render is unchanged.
  // themeColor/colorScheme belong here rather than in `metadata`, where they
  // have been deprecated since Next 14.
  themeColor: "#000000",
  colorScheme: "dark",
};

// Flips the "How it Works" section from its static stacked baseline to the
// pinned crossfade, before first paint so there is no swap to watch. Kept out
// of React deliberately: the baseline must be what a scripting-less client
// sees, so if this never runs, all five steps stay in flow and fully visible
// rather than stranded at opacity:0. The `change` listener keeps the flag in
// sync with GSAP's own matchMedia revert when the OS preference flips
// mid-session. Inline <script> is permitted by the CSP in next.config.ts.
const STEPS_MODE_SCRIPT =
  "(function(){var m=matchMedia('(prefers-reduced-motion: no-preference)')," +
  "s=function(){document.documentElement.toggleAttribute('data-steps-animated',m.matches)};" +
  "s();m.addEventListener('change',s)})();";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`
       ${bricolageGrotesque.variable} ${hankenGrotesk.variable} ${poppins.variable} ${inter.variable} ${geist.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: STEPS_MODE_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
