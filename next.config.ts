import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Stripe's documented origins for an embedded Checkout integration. Checkout
// renders inside an iframe served by Stripe, so frame-src must allow it or the
// payment step silently fails to mount. See src/lib/stripe.ts (ui_mode:
// "embedded_page") and src/components/CheckoutPage/CheckoutGateway.tsx.
const STRIPE = {
  script: ["https://js.stripe.com", "https://checkout.stripe.com"],
  connect: [
    "https://api.stripe.com",
    "https://checkout.stripe.com",
    "https://merchant-ui-api.stripe.com",
  ],
  frame: [
    "https://js.stripe.com",
    "https://checkout.stripe.com",
    "https://hooks.stripe.com",
  ],
};

// Fonts are self-hosted: next/font/google downloads them at build time and
// serves them from /_next/static, so no external font origin is needed.
const csp = [
  `default-src 'self'`,
  // 'unsafe-inline' is required for the framework's bootstrap, the JSON-LD
  // blocks emitted by components/JsonLd.tsx, and the pre-paint reduced-motion
  // probe in app/layout.tsx. A nonce would be stricter but has to be applied
  // per-request from middleware, which would opt every page out of static
  // rendering. 'unsafe-eval' is dev-only (HMR).
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}${STRIPE.script.join(" ")}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.stripe.com`,
  `font-src 'self' data:`,
  `connect-src 'self' ${isDev ? "ws: " : ""}${STRIPE.connect.join(" ")}`,
  `frame-src 'self' ${STRIPE.frame.join(" ")}`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `manifest-src 'self'`,
  // Would rewrite http://localhost to https in development.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Redundant with frame-ancestors above, kept for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=(self)",
      "usb=()",
    ].join(", "),
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

// HSTS is meaningless over plain http and would pin localhost to https.
if (!isDev) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const NO_INDEX_HEADER = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The header form is the only way to mark non-HTML responses noindex —
      // a <meta> tag cannot exist in a JSON payload.
      { source: "/api/:path*", headers: [NO_INDEX_HEADER] },
      // Belt-and-braces alongside the `robots` metadata on these three pages:
      // the header also covers any non-HTML response they may redirect to.
      { source: "/(checkout|formPage|confirmPage)", headers: [NO_INDEX_HEADER] },
    ];
  },
};

export default nextConfig;
