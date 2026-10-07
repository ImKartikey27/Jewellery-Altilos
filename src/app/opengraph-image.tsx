import { ImageResponse } from "next/og";

import { formatMinor } from "@/lib/money";
import { PLAN_PRICING } from "@/lib/plans";

// Generated rather than a static PNG for two reasons: public/brand/altilos-
// logo.png is a 1380x360 wordmark against OG's required 1200x630, so dropping
// it in would letterbox every share card; and the price on the card derives
// from plans.ts, so it cannot drift the way a hand-exported binary would.
//
// This is the image ChatGPT and Perplexity render beside a citation, not just
// the one WhatsApp shows — which is why it is worth generating properly.

export const alt =
  "Altilos - zero-party consumer research for Indian jewellery brands, delivered in 3 to 7 days";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No `runtime` export: none is documented for this file convention, the Node.js
// default is correct, and runtime = "edge" is unsupported under Cache
// Components.
//
// No `fonts` option either: @vercel/og bundles Geist-Regular as its default
// face, while the project's next/font files are content-hashed .woff2 under
// .next/static, which satori cannot parse. That leaves ONE weight, so hierarchy
// here comes from size and colour rather than fontWeight — satori will not
// synthesize a bold from a regular face.
export default function Image() {
  const from = formatMinor(PLAN_PRICING.pulse.amountMinor, "inr");

  return new ImageResponse(
    (
      // Flexbox only — satori does not implement display:grid, and every
      // element with more than one child needs an explicit display:flex.
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          color: "#ffffff",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F97316",
            }}
          />
          <div style={{ display: "flex", fontSize: 36, letterSpacing: -0.5 }}>
            altilos
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#F97316",
              letterSpacing: 4,
            }}
          >
            CONSUMER RESEARCH FOR INDIAN JEWELLERY BRANDS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              lineHeight: 1.18,
              maxWidth: 980,
            }}
          >
            Zero-party insight from verified buyers, in 3 to 7 days
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 27, color: "#A1A1A1" }}>
          {`Tier 1-3 cities  ·  pin-code level  ·  from ${from}`}
        </div>
      </div>
    ),
    size,
  );
}
