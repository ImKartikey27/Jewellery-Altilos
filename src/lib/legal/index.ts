// Registry of every legal page, so sitemap.ts iterates the docs instead of
// restating their routes. The constraint that keeps this honest: a legal page
// that is not listed here is absent from the sitemap, so adding one means
// adding it here in the same change.

import { privacyDoc } from "./privacy.ts";
import { termsDoc } from "./terms.ts";
import { securityDoc } from "./security.ts";

export const legalDocs = [privacyDoc, termsDoc, securityDoc] as const;
