# Altilos Landing Page

Node.js architecture build for the Altilos market-intelligence landing page (Personal Care / India segment). Built under PO RWZ-2026-0527-002.

## Stack Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Neon (serverless Postgres) via `@neondatabase/serverless` |
| ORM | Prisma 7, connected through `@prisma/adapter-neon` (`src/lib/prisma.ts`) |
| Payments | Stripe Embedded Checkout (`@stripe/react-stripe-js`, `stripe`) |
| Transactional email | Resend, called via direct HTTP fetch (`src/lib/mailchimp-transactional.ts` — historical filename, sends through Resend; see note below) |
| CRM sync | Pipedrive (`src/lib/pipedrive.ts`) |
| Hosting | Vercel |

**Note on email provider:** the project originally scaffolded for Mailchimp Transactional (Mandrill). The team moved to Resend during the build; the file `src/lib/mailchimp-transactional.ts` is the active Resend integration (kept its original name for git-history continuity), while unused `MAILCHIMP_*` env vars remain reserved in case of a future revert.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXT_PUBLIC_BASE_URL` | Yes | Canonical site URL — used for metadata, sitemap/robots, and onboarding links |
| `STRIPE_SECRET_KEY` | Yes | Server-side Stripe API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Client-side Stripe key for Embedded Checkout |
| `STRIPE_WEBHOOK_SECRET` | Yes | Verifies `stripe-signature` on incoming webhooks |
| `STRIPE_PRODUCT_ID_PULSE` / `_CORE` / `_CORE_PLUS` / `_EXPERT` | Yes | Stripe product IDs per pricing tier |
| `ONBOARDING_TOKEN_PEPPER` | Yes | Secret pepper for hashing onboarding access tokens |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_FROM_NAME` | Yes | Transactional email sending |
| `RESEND_TEAM_NOTIFICATION_EMAILS` | No | Comma-separated internal notification recipients on new onboarding submissions |
| `PIPEDRIVE_API_TOKEN` | No | Enables CRM sync for leads and onboarding submissions |
| `PIPEDRIVE_API_BASE_URL` | No | Defaults to `https://api.pipedrive.com/api/v2` |
| `PIPEDRIVE_DEFAULT_OWNER_ID`, `PIPEDRIVE_LEAD_MAGNET_LABEL_ID`, `PIPEDRIVE_*_FIELD_KEY` | No | Pipedrive custom field mappings |
| `LEAD_MAGNET_FILE_PATH` / `_FILE_NAME` / `_FILE_TYPE` | No | Report PDF served from disk (defaults to `public/lead-magnet.pdf`) |
| `MAILCHIMP_TRANSACTIONAL_*` | No | Reserved, unused while Resend is the active provider |

Full list enforced at runtime in `src/lib/env.ts` (`requireEnv` throws on missing required values; `optionalEnv` returns `undefined`).

## Prisma Schema (`prisma/schema.prisma`)

| Model | Purpose |
|---|---|
| `Customer` | Buyer record; links Stripe and Pipedrive person IDs |
| `Order` | One row per checkout attempt — plan, amount, Stripe session/payment IDs, `OrderStatus` |
| `OnboardingAccessToken` | Hashed, expiring tokens granting access to the post-payment onboarding form |
| `OnboardingSubmission` | Post-payment questionnaire responses, incl. `researchBrief` JSON and Pipedrive sync status |
| `Lead` | Lead-magnet email-gate captures, incl. report delivery and Pipedrive sync status |
| `WebhookEvent` | Audit log of every Stripe webhook received, keyed by Stripe event `id` for idempotency |

Migrations live under `prisma/migrations/`. Run `npx prisma migrate deploy` against `DATABASE_URL` to apply them.

## API Routes & Server Actions

Two flows are exposed as REST routes; two are implemented as typed Next.js Server Actions rather than routes — this was the agreed architecture for this build, not a partial implementation.

| Flow | Implementation | File |
|---|---|---|
| Checkout session creation | `POST /api/checkout/create-session` | `src/app/api/checkout/create-session/route.ts` — validates `plan` with Zod, creates a `PENDING` `Order`, opens a Stripe Embedded Checkout session, returns `clientSecret` |
| Stripe webhook | `POST /api/stripe/webhook` | `src/app/api/stripe/webhook/route.ts` — verifies `stripe-signature`, writes a `WebhookEvent` row keyed on the Stripe event ID (duplicate deliveries short-circuit on the unique-constraint conflict), dispatches `checkout.session.completed` / `checkout.session.expired`, records `processedAt` / `processingError` |
| Lead magnet capture | Server Action `submitLeadMagnetAction` | `src/app/_actions/submit-lead-magnet.ts` → `src/lib/lead-magnet-submission.ts` — writes/upserts `Lead`, syncs to Pipedrive, sends the report via Resend |
| Onboarding questionnaire | Server Action `submitOnboardingAction` | `src/app/formPage/page.tsx` → `src/lib/onboarding-submission.ts` — writes `OnboardingSubmission`, syncs to Pipedrive, triggers team notification email |

## Deployment Procedure

1. Push to `main` — Vercel auto-deploys via its Git integration (production) and generates preview URLs for other branches/PRs.
2. Confirm all environment variables above are set in the Vercel project (Production + Preview).
3. Run `npx prisma migrate deploy` against the production `DATABASE_URL` before/at cutover.
4. Point the confirmed subdomain (`jewellery.altilos.com`) at Vercel via CNAME, then add it as a custom domain in the Vercel project settings.
5. Verify `/sitemap.xml` and `/robots.txt` resolve on the live domain once DNS is live.

## SEO

- `src/app/sitemap.ts`, `src/app/robots.ts` — generated sitemap/robots routes.
- `src/app/layout.tsx` — page metadata, Open Graph/Twitter tags, canonical URL, `Organization` JSON-LD.
- `src/app/page.tsx` — `Service`/`Offer` JSON-LD reflecting the four pricing tiers.

## Testing

Unit tests cover validation, formatting, and payload-shaping logic, using Node's built-in test runner (no separate framework dependency):

```bash
node --experimental-strip-types --test 'tests/*.test.mjs'
```

Test files live in `tests/` (email validation, lead-magnet validation, onboarding schema/shape/brief formatting, checkout contact fields, team email recipients, Pipedrive payload shaping).

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
