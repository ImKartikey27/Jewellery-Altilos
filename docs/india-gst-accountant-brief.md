# Indian GST on sales from a US entity

**Briefing for external accountant**

We are about to start charging Indian customers in rupees from our US-registered entity. Before we do, we need your position on five things. This note sets out what we sell, what we already believe to be true, and the specific questions we need answered.

| | |
|---|---|
| **Seller entity** | US-registered |
| **India presence** | None |
| **Charged in** | INR → settles USD |
| **Ticket range** | ₹8,000 – ₹2,00,000 |
| **Date** | 15 Aug 2026 |
| **Status** | Awaiting advice |

---

## What we sell

Consumer market-research studies for brands. A customer buys a tier online, answers a brief, and receives a report. Everything is delivered electronically; nothing physical ships.

| Tier | Price | What the buyer receives | Human involvement |
|---|---|---|---|
| **Pulse** | ₹8,000 | AI-generated 1-page summary from 50 survey responses | None |
| **Core** | ₹40,000 | Analyst-edited report, 200 responses | Analyst edits report; email Q&A |
| **Core+** | ₹1,00,000 | Above, plus segmentation and receipt evidence | Plus one 45-minute expert call |
| **Expert** | ₹2,00,000 | Above, at greater depth and scale | Plus two 1-hour expert sessions |

Buyers can also add optional extras at checkout (₹2,500–₹28,000) such as extra responses, an additional city, or an expert call. These are charged on the same invoice as the tier.

**Our customers are overwhelmingly Indian companies** — brand and marketing teams. We expect most to be GST-registered, but we cannot currently rule out occasional buyers who are not.

---

## What we believe is already settled

The **verified** items are taken directly from Stripe's tax documentation and we are reasonably confident in them. The **assumption** items are our own reading and are exactly what we need you to confirm or correct.

**✅ VERIFIED** — Because we have no physical presence in India, we count as a **remote seller**, which is the category that can collect Indian tax through Stripe at all.
> *Stripe: "To collect this tax on Stripe, you must be a remote seller without a physical presence in the country."*

**✅ VERIFIED** — Sales to **GST-registered Indian businesses** do not create a registration obligation for us.
> *Stripe: "Sales to business customers in India don't trigger any tax registration obligations because non-resident businesses aren't required to collect tax on these sales."*

**✅ VERIFIED** — For **B2C** sales of digital products into India there is **no threshold** — the obligation starts at the first transaction.
> *Stripe: "Remote sellers ... have no registration threshold. They must register for IGST purposes from the first sale." Registration threshold listed as 1 transaction.*

**✅ VERIFIED** — Only **IGST** is in scope, and only for OIDAR services. Calculating it requires the buyer's Indian state or union territory in their address.
> *Stripe: "Stripe only supports collecting integrated goods and services tax (IGST) for online information and database access or retrieval services (OIDAR)."*

**⚠️ OUR ASSUMPTION** — That the **reverse charge mechanism** is what makes the second item work: the Indian business buyer self-accounts for the GST, so we charge nothing and they claim it back.

**⚠️ OUR ASSUMPTION** — That capturing a valid **GSTIN at checkout** is sufficient evidence to treat a buyer as B2B.

---

## Questions

Numbered so you can reply against them directly. Each carries a short note on what it changes for us, so you can see which are load-bearing.

### A · Is what we sell actually OIDAR?

**Q1.** Does a research report generated from consumer survey data and delivered as a PDF fall within OIDAR?
> *Changes: whether Indian GST is in scope for us at all.*

**Q2.** Our upper tiers involve a human analyst editing the report and running live calls. We understand the "minimal human intervention" wording was removed from the OIDAR definition in 2023. Does that mean these tiers are OIDAR too, or does the human element take them outside it?
> *Changes: whether all four tiers get one treatment or two. **This is the question we are least sure about.***

**Q3.** If tiers classify differently, can we lawfully apply a single treatment across all of them for simplicity, or must we split?
> *Changes: whether our checkout needs per-tier tax logic.*

**Q4.** If a tier is *not* OIDAR, what is it instead — an import of service on which the Indian buyer is liable under reverse charge regardless?

### B · B2B and reverse charge

**Q5.** Confirm: for a GST-registered Indian business buyer we charge no GST, and they self-account under reverse charge. Is that right?
> *Changes: whether our advertised prices are the final price for most customers.*

**Q6.** What evidence of the buyer's registered status must we actually hold? Is collecting a GSTIN enough, or must we validate it against the GST portal and retain proof?
> *Changes: whether we need a GSTIN validation step, which is real engineering work.*

**Q7.** If a business buyer will not or cannot supply a GSTIN, do we default to treating them as B2C and charge 18%?

**Q8.** Does a buyer's status need re-verifying on repeat purchases, or can we rely on what we captured the first time?

### C · Registration

**Q9.** If we make even one B2C sale, does that trigger simplified OIDAR registration? We understand the route is Form GST REG-10 — please correct us if not.

**Q10.** Does registration require an authorised representative resident in India? Can you act in that capacity, or do we need to appoint someone locally?
> *Changes: cost and lead time before we can accept a single consumer sale.*

**Q11.** What is the realistic timeline, cost, and ongoing compliance burden of registering?

**Q12.** Is it a legitimate and defensible position to sell *only* to GST-registered businesses — making a valid GSTIN mandatory at checkout — and thereby avoid registration entirely?
> *Changes: this is the simplest possible outcome for us and we would like to know if it is available. It costs us any individual or unregistered buyer.*

### D · Invoicing

**Q13.** What must our invoice show for an Indian business to claim input tax credit under reverse charge?

**Q14.** Must the invoice explicitly state that tax is payable under reverse charge?

**Q15.** Do we need the buyer's GSTIN and their place of supply (state) on every invoice? We do not currently collect a billing address.
> *Changes: whether we add address collection to checkout, which costs conversion.*

**Q16.** Is Stripe's automatic payment receipt sufficient, or must we issue our own compliant tax invoice?

**Q17.** Must the invoice be denominated in INR, USD, or both, given we charge in INR but settle in USD?

### E · How we display prices publicly

**Q18.** If a business pays ₹8,000 and a consumer pays ₹9,440, what can we put on the website? Is "₹8,000 + GST where applicable" acceptable?

**Q19.** Alternatively, may we show one GST-inclusive price to everybody and absorb the difference on B2B sales?
> *Changes: our pricing page currently shows a single flat rupee figure per tier.*

**Q20.** Are there Indian advertising or consumer-protection rules about displaying prices exclusive of tax that we should know about?

### F · US side and ongoing compliance

**Q21.** Any US federal or state consequences of INR-denominated revenue settling to USD?

**Q22.** How should we treat FX gain or loss between transaction date and settlement date?

**Q23.** If we register in India, what returns are due and how often? We understand GSTR-5A, monthly — and who files them, you or an India-based agent?

**Q24.** If we have collected GST and later refund a customer, how is that tax reclaimed?
> *Changes: our refund process, which is currently a single click in Stripe.*

**Q25.** What records must we retain, in what form, and for how long?

---

## What we will do with your answer

The technical work is already built and can go either way. These are the three outcomes we are set up to implement, so that you can see the practical stakes rather than advising in the abstract.

| If your answer is | We will | Cost to us |
|---|---|---|
| **B2B only is defensible**<br>(Q12 yes) | Make a valid GSTIN mandatory at checkout. No tax engine. Advertised rupee price is the final price. | Lose any individual or unregistered buyer. Simplest to run. |
| **We must register for IGST**<br>(Q9 yes) | Turn on Stripe's tax engine, collect GSTIN to separate B2B from B2C, add billing address, show tax as a separate line. | Registration, monthly returns, more checkout friction. |
| **Not OIDAR at all**<br>(Q1 no) | Collect nothing. Reverse charge for all Indian buyers. Advertised price is final. | None, but we would want this in writing. |

Switching between these is roughly a day of engineering in each direction. **Please do not optimise your advice for our convenience — we would rather be right.**

---

## Source

Every "verified" item above comes from Stripe's own tax documentation for India, which is the reference our payment provider applies when calculating tax. Reproduced here so you can check our reading against it.

> Remote sellers providing digital goods or electronically supplied services (digital products) to consumers in India have no registration threshold. They must register for IGST purposes from the first sale. Sales to business customers in India don't trigger any tax registration obligations because non-resident businesses aren't required to collect tax on these sales.
>
> — docs.stripe.com · Collect tax in Asia Pacific · India

> In India, Stripe only supports collecting integrated goods and services tax (IGST) for online information and database access or retrieval services (OIDAR). Stripe refers to these as "digital products." To collect this tax on Stripe, you must be a remote seller without a physical presence in the country.
>
> — docs.stripe.com · Supported calculations for India

Note that Stripe lists India as **not supported as a business location** — that restriction applies to sellers based *in* India, not to us. As a US entity selling into India we fall under the remote-seller route above.

---

**Prepared by the Altilos engineering side** — the payment integration is complete and currently charges a flat rupee price with no tax handling. Nothing ships to Indian customers until these questions are closed.

Please reply against the question numbers. Anything you would like removed from scope, say so and we will drop it rather than guess.
