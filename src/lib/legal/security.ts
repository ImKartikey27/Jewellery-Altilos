import type { LegalDoc } from "./types.ts";

// Altilos security practices.
//
// Every claim here must describe a control that actually exists in this
// repository or a documented property of a named provider. If a control is
// removed from the codebase, remove the claim in the same change. Deliberately
// absent: certifications we do not hold, penetration testing, a bug bounty, and
// request rate limiting.
export const securityDoc: LegalDoc = {
  path: "/security",
  breadcrumb: "Security",
  eyebrow: "Trust & Security",
  titleLead: "Security",
  titleRest: "Practices",
  subtitle:
    "How Altilos protects your data, your payments, and the research you trust us with.",
  lastUpdated: { iso: "2026-08-22", label: "August 22, 2026" },
  intro: [
    {
      kind: "p",
      text: "Altilos handles two things that matter to you: the payment you make and the commercial questions you ask us to research. This page sets out the controls we actually operate to protect both. We have tried to describe what is true today rather than what sounds reassuring — where we do not yet have something, we say so.",
    },
    {
      kind: "p",
      text: "If you are completing a security review and need detail beyond this page, contact us at [info@altilos.com](mailto:info@altilos.com).",
    },
  ],
  sections: [
    {
      id: "payments",
      title: "1. Payment Security",
      blocks: [
        {
          kind: "p",
          text: "All payments are processed by **Stripe**, a PCI DSS Level 1 certified service provider. Card details are entered directly into a checkout form served and rendered by Stripe. That form runs on Stripe's own domain inside an isolated frame, so card numbers, expiry dates and security codes are transmitted from your browser to Stripe without passing through Altilos servers, application code or logs.",
        },
        {
          kind: "p",
          text: "Altilos never receives, stores or has the ability to retrieve your full card number. What we retain against an order is limited to Stripe's own identifiers, the plan purchased, the amount and currency, any add-ons selected, and the payment status.",
        },
        {
          kind: "p",
          text: "Payment confirmations reach us as signed webhooks from Stripe. Every delivery is verified against a shared signing secret before it is acted on, and any request that arrives unsigned or with an invalid signature is rejected outright. Verified events are recorded by their unique Stripe event identifier, so a replayed or duplicated delivery cannot cause an order to be processed twice.",
        },
      ],
    },
    {
      id: "data-we-hold",
      title: "2. What Data We Hold",
      blocks: [
        {
          kind: "p",
          text: "We practise data minimisation: the service only collects what is needed to deliver a research report and to contact you about it.",
        },
        { kind: "h3", text: "What we store" },
        {
          kind: "ul",
          items: [
            "**Contact details.** Your name, work email address, company and phone number.",
            "**Order records.** The plan purchased, amount, currency, status, add-ons, and the corresponding Stripe and CRM identifiers.",
            "**Your research brief.** The answers you submit describing your category, target consumers, locations and the questions you want answered.",
          ],
        },
        { kind: "h3", text: "What we never store" },
        {
          kind: "ul",
          items: [
            "**Card and bank details.** These stay with Stripe, as described above.",
            "**Passwords.** Altilos has no user accounts and issues no passwords, so there are no credentials of yours for an attacker to steal, reuse or crack.",
          ],
        },
        {
          kind: "p",
          text: "Your research brief is commercially sensitive, and we treat it that way. It is used to produce and deliver your report and is not sold, published, or shared with other customers. The categories of personal information we process, and the purposes we process them for, are set out in full in our [Privacy Policy](/privacy).",
        },
      ],
    },
    {
      id: "encryption",
      title: "3. Encryption",
      blocks: [
        {
          kind: "p",
          text: "Every connection to Altilos is served over HTTPS using TLS. We send a HTTP Strict Transport Security header with a two-year lifetime covering all subdomains, which instructs browsers to refuse any future plain-text connection to us — this closes off downgrade attacks and protects visitors on untrusted networks.",
        },
        {
          kind: "p",
          text: "Customer records are held in managed PostgreSQL provided by Neon, which encrypts data at rest and requires TLS for connections from our application. Traffic between our application and the third-party services listed below travels over TLS-protected APIs.",
        },
      ],
    },
    {
      id: "report-access",
      title: "4. Access to Your Brief",
      blocks: [
        {
          kind: "p",
          text: "After payment you receive a private link to the onboarding form where you set out your research brief. Because there are no accounts or passwords, that link is the credential — so it is designed to fail safely.",
        },
        {
          kind: "ul",
          items: [
            "**Unguessable.** Each link carries a 256-bit token drawn from a cryptographically secure random number generator.",
            "**Never stored in usable form.** We keep only an HMAC-SHA256 hash of the token, computed with a secret held in our server environment and never written to the database. Someone who obtained a copy of the database could not reconstruct a working link from it.",
            "**Short-lived.** Tokens expire fourteen days after they are issued.",
            "**Single-use.** A token is marked as used once the brief is submitted, and will not open the form again.",
            "**Scoped to a paid order.** A token is only honoured while its order is in a paid state, and is rejected otherwise.",
          ],
        },
        {
          kind: "p",
          text: "If you believe your onboarding link has been seen by someone else, email [info@altilos.com](mailto:info@altilos.com) and we will invalidate it and issue a new one.",
        },
      ],
    },
    {
      id: "application-security",
      title: "5. Application Security",
      blocks: [
        { kind: "h3", text: "Input handling and data access" },
        {
          kind: "ul",
          items: [
            "**Server-side validation.** Every submission — checkout requests and research briefs alike — is validated against an explicit schema on the server. Validation performed in the browser is treated as a convenience for the visitor, never as a security control.",
            "**Parameterised queries.** All database access goes through parameterised statements, so values supplied by a visitor are passed as bound parameters and are never concatenated into SQL. This is the structural defence against SQL injection.",
            "**Contextual output encoding.** Pages are rendered through React, which escapes interpolated values by default, mitigating cross-site scripting.",
          ],
        },
        { kind: "h3", text: "Browser-enforced protections" },
        {
          kind: "p",
          text: "We set response headers that constrain what a browser will do with our pages, so that a single injected string cannot escalate into a working attack:",
        },
        {
          kind: "ul",
          items: [
            "**Content-Security-Policy** restricting scripts, styles, frames, images and network connections to our own origin and the specific Stripe origins that checkout requires. Plugin content is blocked outright, and the document base URI and form submission targets are pinned to our own origin, which blocks form-hijacking.",
            "**X-Frame-Options: DENY** and a `frame-ancestors 'none'` directive, so our pages cannot be embedded in a third-party site for clickjacking.",
            "**X-Content-Type-Options: nosniff**, preventing browsers from reinterpreting a response as a type we did not declare.",
            "**Referrer-Policy: strict-origin-when-cross-origin**, so paths and query strings are not leaked to external sites in the referrer header.",
            "**Permissions-Policy** denying access to the camera, microphone, geolocation and other device APIs the site has no reason to use.",
          ],
        },
        {
          kind: "p",
          text: "We also suppress the framework version banner, so our responses do not advertise the exact software versions we run.",
        },
        { kind: "h3", text: "Secret management" },
        {
          kind: "ul",
          items: [
            "API keys and signing secrets are supplied only as environment variables in the deployment platform, and are excluded from version control.",
            "Modules that read secrets are marked server-only, which makes it a build failure — not a silent leak — for credential-bearing code to be pulled into a browser bundle.",
            "Only the Stripe publishable key, which is designed to be public, is ever exposed to the browser.",
          ],
        },
      ],
    },
    {
      id: "infrastructure",
      title: "6. Infrastructure and Sub-processors",
      blocks: [
        {
          kind: "p",
          text: "Altilos is built on managed infrastructure rather than servers we patch ourselves, which means operating-system and platform hardening is handled by providers who do it at scale. We use the following sub-processors:",
        },
        {
          kind: "table",
          cells: "text",
          head: ["Sub-processor", "Purpose", "Data involved"],
          rows: [
            ["Stripe", "Payment processing", "Card details, billing contact, order amounts"],
            ["Vercel", "Application hosting and TLS", "Request metadata, application logs"],
            ["Neon", "Managed PostgreSQL database", "Contact details, orders, research briefs"],
            ["Mailchimp Transactional", "Transactional email", "Name, email address, order context"],
            ["Resend", "Transactional email", "Name, email address, order context"],
            ["Pipedrive", "Customer relationship management", "Contact details, order and enquiry context"],
          ],
        },
        {
          kind: "p",
          text: "Stripe maintains PCI DSS Level 1 certification, and Vercel and Neon each maintain their own independent security certifications for the platforms they operate. Their certifications cover their infrastructure, not the Altilos application itself — see the next section.",
        },
      ],
    },
    {
      id: "retention",
      title: "7. Retention and Deletion",
      blocks: [
        {
          kind: "p",
          text: "We keep customer records for as long as needed to deliver your report, support you afterwards, and satisfy the tax and accounting obligations that attach to a completed sale. Expired and used onboarding tokens are retained only as hashes and carry no ability to access anything.",
        },
        {
          kind: "p",
          text: "You can ask us to correct or delete your personal information at any time by emailing [info@altilos.com](mailto:info@altilos.com). Where we are required to retain a record of a transaction for legal reasons, we will tell you what we must keep and why. The rights available to you, and how we handle such requests, are described in our [Privacy Policy](/privacy).",
        },
      ],
    },
    {
      id: "compliance",
      title: "8. Certifications and Compliance",
      blocks: [
        {
          kind: "p",
          text: "We would rather be accurate than impressive: **Altilos is not currently SOC 2 or ISO 27001 certified, and we have not commissioned an independent penetration test.** We do not operate a paid bug bounty programme. Any vendor that tells you otherwise about us is mistaken.",
        },
        {
          kind: "p",
          text: "What we rely on instead is the combination described on this page: keeping card data entirely outside our systems, holding no passwords, minimising the personal data we collect, and building on infrastructure from providers who do hold current certifications. As Altilos grows, formal certification is on our roadmap, and we will update this page — with a new date at the top — when that status changes rather than in advance of it.",
        },
        {
          kind: "p",
          text: "If your procurement process requires a security questionnaire, a data processing agreement, or written answers about any control on this page, contact [info@altilos.com](mailto:info@altilos.com) and we will work through it with you.",
        },
      ],
    },
    {
      id: "incidents",
      title: "9. Security Incidents",
      blocks: [
        {
          kind: "p",
          text: "If we become aware of a security incident affecting your personal information, we will investigate, take steps to contain it, and notify affected customers without undue delay, together with the regulators we are required to inform under applicable data protection law. We will tell you what happened, what data was involved, and what we are doing about it.",
        },
      ],
    },
    {
      id: "disclosure",
      title: "10. Reporting a Vulnerability",
      blocks: [
        {
          kind: "p",
          text: "We welcome reports from security researchers, and we would much rather hear from you than from an attacker. Please send findings to [info@altilos.com](mailto:info@altilos.com) with the subject line beginning “Security”, including enough detail to reproduce the issue — the affected URL or endpoint, the steps you took, and what you observed.",
        },
        {
          kind: "p",
          text: "We aim to acknowledge a report within five business days, and we will keep you updated while we work on a fix. Our machine-readable contact details are published at [/.well-known/security.txt](/.well-known/security.txt) in line with RFC 9116.",
        },
        { kind: "h3", text: "When investigating, please do" },
        {
          kind: "ul",
          items: [
            "Give us a reasonable opportunity to fix an issue before disclosing it publicly.",
            "Use only test data and your own accounts, orders and onboarding links.",
            "Stop as soon as you have demonstrated a problem, and tell us rather than exploring further.",
          ],
        },
        { kind: "h3", text: "Please do not" },
        {
          kind: "ul",
          items: [
            "Access, modify or exfiltrate data belonging to another customer.",
            "Run denial-of-service tests, load tests, or automated scanning heavy enough to degrade the service for others.",
            "Use social engineering, phishing, or physical intrusion against our staff or our providers.",
          ],
        },
        {
          kind: "p",
          text: "Testing against Stripe, Vercel, Neon or any other provider listed above is out of scope for us — please report those findings through that provider's own disclosure programme.",
        },
      ],
    },
  ],
  help: {
    body: "Running a security review, or need to report a vulnerability? Get in touch.",
    email: "info@altilos.com",
  },
  related: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "General Terms", href: "/terms" },
  ],
};
