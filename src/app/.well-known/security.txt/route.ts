// RFC 9116 security.txt — the conventional location researchers check before
// reporting a vulnerability. Served from a route handler rather than public/ so
// the absolute URLs follow the deployed base URL.

import { absoluteUrl, ORG_EMAIL } from "@/lib/site";

// RFC 9116 requires an Expires field and treats a stale file as untrustworthy.
// Bump this when reviewing the disclosure process.
const EXPIRES = "2027-08-22T00:00:00.000Z";

export const dynamic = "force-static";

export function GET() {
  const body = [
    `Contact: mailto:${ORG_EMAIL}`,
    `Expires: ${EXPIRES}`,
    `Policy: ${absoluteUrl("/security")}`,
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    "Preferred-Languages: en",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
