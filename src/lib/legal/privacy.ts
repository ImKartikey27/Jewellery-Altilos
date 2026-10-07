import type { LegalDoc } from "./types.ts";

// Altilos privacy notice. Mirrors the sections of the notice served to data
// subjects; section 3 has no automated-decision-making clause, so its lettered
// subsections run A. through E.
export const privacyDoc: LegalDoc = {
  path: "/privacy",
  breadcrumb: "Privacy Policy",
  eyebrow: "Your Privacy Matters",
  titleLead: "Privacy",
  titleRest: "Policy",
  subtitle:
    "How Altilos, Inc. collects, uses, discloses, and protects personal information across our Services.",
  lastUpdated: { iso: "2026-08-22", label: "August 22, 2026" },
  intro: [
    { kind: "p", text: "This Privacy Notice applies to the processing of personal information by Altilos, Inc. (“Altilos,” “we,” “us,” or “our”) including on our website available at altilos.com and our other online or offline offerings which link to, or are otherwise subject to, this Privacy Notice (collectively, the “Services”)." },
    { kind: "p", text: "Altilos is a global company headquartered in Wilmington, Delaware in the United States. Many of our IT and other functions are administered centrally by Altilos in the United States and any information that you provide or we collect may be transmitted to a country other than your country of residence for processing or storage, and it may also be communicated to third parties hired by us to provide services such as website hosting, database management, or analytics. By using our Services, you consent to the collection, use, storage, and processing of your personal information in the United States and in any country to which we may transfer your personal information in the course of our business operations. For more information, please see International Transfers of Personal Information. For information on our processing of personal information subject to applicable European Union or United Kingdom laws, please see Annex A – Supplemental Privacy Notice for Individuals within the EU/UK." },
  ],
  sections: [
    {
      id: "updates",
      title: "1. Updates to This Privacy Notice",
      blocks: [
        { kind: "p", text: "We may update this Privacy Notice from time to time in our sole discretion. If we do, we’ll let you know by posting the updated Privacy Notice on our website and/or we may also send other communications." },
      ],
    },
    {
      id: "information-we-collect",
      title: "2. Personal Information We Collect",
      blocks: [
        { kind: "p", text: "We collect personal information you provide to us, personal information we collect automatically when you use the Services, and personal information from third-party sources, as described below." },
        { kind: "h3", text: "A. Personal Information You Provide to Us Directly" },
        { kind: "p", text: "We may collect personal information you provide to us." },
        {
          kind: "ul",
          items: [
            "**Account Information.** We may collect personal information in connection with the creation or administration of your account. The personal information may include, but is not limited to, your name, postal address, email address, and other information you store with your account.",
            "**Purchases.** We may collect personal information and details associated with your purchases, including payment information. Any payments made via our Services are processed by third-party payment processors. We do not directly collect or store any payment card information entered through our Services, but we may receive information associated with your payment card information (e.g., your billing details).",
            "**Your Communications with Us.** We, and our service providers, may collect the information you communicate to us, such as through email, SMS, text, or via our chat bot tool.",
            "**Surveys.** We may contact you to participate in surveys. If you decide to participate, we may collect personal information from you in connection with the survey.",
            "**Interactive Features.** We and others who use our Services may collect personal information you submit or make available through our interactive features (e.g., messaging features, commenting functionalities, forums, blogs, and social media pages). Any information you provide using the public sharing features of the Services will be considered “public.”",
            "**Sweepstakes or Contests.** We may collect personal information you provide for any sweepstakes or contests we offer. In some jurisdictions, we are required to publicly share information of sweepstakes and contest winners.",
            "**Conferences, Trade Shows, and Other Events.** We may collect personal information from individuals when we attend or host conferences, trade shows, and other events. Business Development and Strategic Partnerships. We may collect personal information from individuals and third parties to assess and pursue potential business opportunities.",
            "**Job Applications.** If you apply for a job with us, we will collect any personal information you provide in connection with your application, such as your contact information and resume details.",
          ],
        },
        { kind: "h3", text: "B. Personal Information Collected Automatically" },
        { kind: "p", text: "We may collect personal information automatically when you use the Services." },
        { kind: "p", text: "**Device Information.** We may collect personal information about your device, such as your Internet protocol (IP) address, user settings, cookie identifiers, other unique identifiers, browser or device information, Internet service provider, and location information (including, as applicable, approximate location derived from IP address and precise geo-location information)." },
        { kind: "p", text: "**Usage Information.** We may collect personal information about your use of the Services, such as the pages you visit, items you search for, the types of content you interact with, information about the links you click, the frequency and duration of your activities, and other information about how you use the Services." },
        { kind: "p", text: "**Cookie Notice (and Other Technologies).** We, as well as third parties, may use cookies, pixel tags, and other technologies (“Technologies”) to automatically collect personal information through your use of the Services." },
        {
          kind: "ul",
          items: [
            "**Cookies.** Cookies are small text files stored in device browsers.",
            "**Pixel Tags/Web Beacons.** A pixel tag (also known as a web beacon) is a piece of code embedded in the Services collecting personal information about use of or engagement with the Services. The use of a pixel tag allows us to record, for example, that a user has visited a particular web page or clicked on a particular advertisement. We may also include web beacons in e-mails to understand whether messages have been opened, acted on, or forwarded.",
          ],
        },
        { kind: "p", text: "See “Your Privacy Choices and Rights” below to understand your choices regarding these Technologies." },
        { kind: "h3", text: "C. Personal Information Collected from Third Parties" },
        { kind: "p", text: "We may collect personal information about you from third parties. For example, if you access the Services using a Third-Party Service (defined below), we may collect personal information about you from such Third-Party Service you have made available via your privacy settings. In addition, users of the Services may upload or otherwise provide personal information about others." },
      ],
    },
    {
      id: "how-we-use",
      title: "3. How We Use Personal Information",
      blocks: [
        { kind: "p", text: "We use personal information for a variety of business purposes, including to provide the Services, for administrative purposes, and to provide you with marketing materials, as described below." },
        { kind: "h3", text: "A. Provide the Services" },
        { kind: "p", text: "We use personal information to fulfill our contract with you and provide the Services, such as:" },
        {
          kind: "ul",
          items: [
            "Managing your information;",
            "Processing your requests, including event registration;",
            "Providing access to certain areas, functionalities, and features (including statistical modeling) of the Services;",
            "Communicating with you;",
            "Sharing personal information with third parties as needed to provide the Services;",
            "Processing your financial information and other payment methods for Services; and",
            "Processing job applications.",
          ],
        },
        { kind: "h3", text: "B. Improve the Services and Develop New Products and Services" },
        { kind: "p", text: "We use personal information to improve the Services and develop new products and services, such as:" },
        {
          kind: "ul",
          items: [
            "Developing, training, and fine-tuning models, algorithms, and artificial intelligence technologies;",
            "Improving, upgrading, or enhancing the Services; and",
            "Other administrative purposes.",
          ],
        },
        { kind: "h3", text: "C. Operate Our Business" },
        { kind: "p", text: "We use personal information to operate our business, such as:" },
        {
          kind: "ul",
          items: [
            "Pursuing our legitimate interests such as direct marketing, research and development (including marketing research), network and information security, and fraud prevention;",
            "Carrying out analytics;",
            "Creating de-identified and/or aggregated information. Please note, if we create or receive de-identified information, we will not attempt to reidentify such information, unless permitted by, or required to comply with, applicable laws;",
            "Ensuring internal quality control and safety;",
            "Authenticating and verifying individual identities, including requests to exercise your rights under this Privacy Notice;",
            "Debugging to identify and repair errors with the Services;",
            "Auditing relating to interactions, transactions, and other compliance activities;",
            "Enforcing our agreements and policies; and",
            "Carrying out activities required to comply with our legal obligations.",
          ],
        },
        { kind: "h3", text: "D. Marketing" },
        { kind: "p", text: "We may use personal information to tailor and provide you with marketing and other content, brand recommendations, sale alerts, and other brand promotional information. We may provide you with these materials as permitted by applicable law." },
        { kind: "p", text: "Some of our marketing activities may be considered a “sale” or “targeted advertising” under applicable privacy laws." },
        { kind: "p", text: "**California Shine the Light:** If you are a California resident, you may annually submit a request to us to find out whether we have shared your personal information with third parties for the third parties’ direct marketing purposes. If you would like to submit such a request, please “Contact Us.”" },
        { kind: "p", text: "If you have any questions about our marketing practices, you may contact us at any time as set forth in “Contact Us” below." },
        { kind: "h3", text: "E. With Your Consent or Direction" },
        { kind: "p", text: "We may use personal information for other purposes clearly disclosed to you at the time you provide personal information, with your consent, or as otherwise directed by you." },
      ],
    },
    {
      id: "how-we-disclose",
      title: "4. How We Disclose Personal Information",
      blocks: [
        { kind: "p", text: "We disclose personal information to third parties for a variety of business purposes, including to provide the Services, to protect us or others, or in the event of a major business transaction such as a merger, sale, or asset transfer, as described below." },
        { kind: "h3", text: "A. Disclosures to Provide the Services" },
        { kind: "p", text: "We may disclose any of the personal information we collect to the categories of third parties described below." },
        {
          kind: "ul",
          items: [
            "**Service Providers.** We may disclose personal information to third-party service providers assisting us with the provision of the Services. This may include, but is not limited to, service providers providing us with hosting, customer service, analytics, marketing services, IT support, and related services. In addition, personal information and chat communications may be disclosed to service providers helping provide our chat features.",
          ],
        },
        { kind: "p", text: "Some of the service providers we may use include:" },
        {
          kind: "ul",
          items: [
            "**Google Analytics.** For more information about how Google uses your personal information, please visit [Google Analytics’ Privacy Policy](https://policies.google.com/privacy). To opt out of Google Analytics’ use of your personal information, use the [Google Analytics opt-out browser add-on](https://tools.google.com/dlpage/gaoptout).",
            "**Usercentrics.** For more information about how Usercentrics uses your personal information, please visit the [Usercentrics Privacy Policy](https://usercentrics.com/privacy-policy/).",
            "**Other Users You Share or Interact With.** The Services may allow Altilos users to share personal information or interact with other users and customers of the Services.",
            "**Third-Party Services You Share or Interact With.** The Services may link to or allow you to interface, interact, share information with, direct us to share information with, access and/or use third-party websites, applications, services, products, and technology (each a “Third-Party Service”).",
          ],
        },
        { kind: "p", text: "Any personal information shared with a Third-Party Service will be subject to the Third-Party Service’s privacy policy. We are not responsible for the processing of personal information by Third-Party Services." },
        {
          kind: "ul",
          items: [
            "**Business Partners.** We may share your personal information with business partners to provide you with a product or service you have requested. We may also share your personal information with business partners with whom we jointly offer products or services.",
          ],
        },
        { kind: "p", text: "Once your personal information is shared with our business partner, it will also be subject to our business partner’s privacy policy. We are not responsible for the processing of personal information by our business partners." },
        {
          kind: "ul",
          items: [
            "**Altilos Customers (Authorized Users Only).** In cases where you use our Services as an employee, contractor, or other authorized user of a Altilos customer, such Altilos customer may access information associated with your use of the Services including usage data and the contents of the communications and files associated with your account. Your personal information may also be subject to the Altilos customer’s privacy policy. We are not responsible for the Altilos customer’s processing of your personal information.",
            "**Affiliates.** We may share your personal information with our corporate affiliates.",
            "**Advertising Partners.** We may share your personal information with third-party advertising partners. These third-party advertising partners may set Technologies and other tracking tools on our Services to collect information regarding your activities and your device (e.g., your IP address, cookie identifiers, page(s) visited, location, time of day). These advertising partners may use this information (and similar information collected from other services) for purposes of delivering personalized advertisements to you when you visit digital properties within their networks. This practice is commonly referred to as “interest-based advertising”, “personalized advertising”, or “targeted advertising.”",
          ],
        },
        { kind: "p", text: "Some of the advertising partners we engage may include:" },
        {
          kind: "ul",
          items: [
            "**Meta Connect.** For more information about Meta’s use of your personal information, please visit [Meta’s Privacy Policy](https://www.facebook.com/privacy/policy/). To opt out of Meta’s use of your information, adjust your [Facebook ad settings](https://www.facebook.com/settings?tab=ads) while logged in.",
            "**HubSpot.** For information about how HubSpot uses your personal information, please review the [HubSpot Privacy Policy](https://legal.hubspot.com/privacy-policy). To submit a request to opt-out of HubSpot’s use of your personal information, please submit your written request to privacy@hubspot.com.",
            "**Instagram.** For more information about Instagram’s use of your personal information, please visit [Instagram’s Privacy Policy](https://privacycenter.instagram.com/policy). To opt out of Instagram’s use of your information, adjust your [Instagram ad settings](https://privacycenter.instagram.com/policy) while logged in.",
            "**LinkedIn.** For more information about how LinkedIn uses your personal information, please visit [LinkedIn’s Privacy Policy](https://www.linkedin.com/legal/privacy-policy). To opt out, adjust your [LinkedIn advertising preferences](https://www.linkedin.com/psettings/advertising).",
            "**TikTok.** For more information about TikTok’s use of your personal information, please visit [TikTok’s Privacy Policy](https://www.tiktok.com/legal/privacy-policy). To opt out, adjust your [TikTok ad personalisation settings](https://www.tiktok.com/legal/privacy-policy).",
            "**X (formerly Twitter).** For more information about X’s use of your personal information, please visit [X’s Privacy Policy](https://x.com/en/privacy). To opt out, adjust your [X personalisation settings](https://x.com/settings/account/personalization).",
          ],
        },
        { kind: "h3", text: "B. Disclosures to Protect Us or Others" },
        { kind: "p", text: "We may access, preserve, and disclose any information we store associated with you to external parties if we, in good faith, believe doing so is required or appropriate to: comply with law enforcement or national security requests and legal process, such as a court order or subpoena; protect your, our, or others’ rights, property, or safety; enforce our policies or contracts; collect amounts owed to us; or assist with an investigation or prosecution of suspected or actual illegal activity." },
        { kind: "h3", text: "C. Disclosure in the Event of Merger, Sale, or Other Asset Transfers" },
        { kind: "p", text: "If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, receivership, purchase or sale of assets, transition of service to another provider, or other similar corporate transaction, your personal information may be disclosed, sold, or transferred as part of such a transaction." },
      ],
    },
    {
      id: "your-choices-and-rights",
      title: "5. Your Privacy Choices and Rights",
      blocks: [
        { kind: "p", text: "A. Your Privacy Choices. The privacy choices you may have about your personal information are described below and in the Supplemental Privacy Notice, where relevant." },
        {
          kind: "ul",
          items: [
            "**Email Communications.** If you receive an unwanted promotional email from us, you can use the unsubscribe functionality found at the bottom of the email to opt out of receiving future promotional emails. Note you will continue to receive transaction-related emails. We may also send you certain non-promotional communications regarding us and the Services, and you will not be able to opt out of those communications (e.g., communications regarding the Services or updates to this Privacy Notice).",
            "**Text Messages.** If you receive an unwanted promotional text message from us, you may opt out of receiving future promotional text messages from us by following the instructions in the text message you have received from us or by otherwise contacting us as set forth in “Contact Us” below.",
            "**Account Deletion.** To request deletion of your account, please use the standard deletion functionality available via the Services or contact us using the information set forth in “Contact Us” below.",
            "**Do Not Track Signals.** Some web browsers incorporate \"do-not-track\" (“DNT”) or similar features signaling to websites with which the browser communicates that a visitor does not want to have their online activity tracked. As of the Effective Date, not all browsers offer a DNT option and DNT signals are not yet uniform. For this reason, we along with many other digital service operators do not respond to DNT or similar signals.",
            "**Cookies.** You may stop or restrict the placement of Technologies on your device or remove them by adjusting your preferences as your browser or device permits. However, if you adjust your preferences, the Services may not work properly.",
          ],
        },
        { kind: "p", text: "Please note cookie-based opt-outs are not effective on mobile applications. However, you may opt-out of certain tracking on some mobile applications by following the instructions for [Android](https://support.google.com/googleplay/answer/3405269) and [iOS](https://support.apple.com/en-us/HT202074)." },
        { kind: "p", text: "The online advertising industry also provides mechanisms that may allow you to opt out of receiving targeted ads from organizations participating in self-regulatory programs. To learn more, visit the [Network Advertising Initiative](https://optout.networkadvertising.org/), the [Digital Advertising Alliance](https://optout.aboutads.info/), the [European Digital Advertising Alliance](https://www.youronlinechoices.eu/), and the [Digital Advertising Alliance of Canada](https://youradchoices.ca/)." },
        { kind: "p", text: "Please note you must separately opt out in each browser and on each device." },
        { kind: "p", text: "B. Your Privacy Rights. In accordance with applicable law and the Supplemental Privacy Notice below, you may have the right to:" },
        {
          kind: "ul",
          items: [
            "Confirm We Are Processing Your Personal Information;",
            "Request Access to or Portability of Your Personal Information;",
            "Request Correction of Your Personal Information;",
            "Request Deletion of Your Personal Information;",
            "Request Restriction of or Object to our Processing of Your Personal Information;",
            "Request to Opt-Out of Certain Processing Activities including, as applicable, if we process your personal information for “targeted advertising” (as “targeted advertising” is defined by applicable privacy laws), if we “sell” your personal information (as “sell” is defined by applicable privacy laws), or if we engage in “profiling” in furtherance of certain “decisions producing legal or similarly significant effects” concerning you (as such terms are defined by applicable privacy laws); and",
            "**Withdraw Your Consent to our Processing of Your Personal Information.** Please note your withdrawal will only take effect for future processing and will not affect the lawfulness of processing before the withdrawal.",
          ],
        },
        { kind: "p", text: "If you would like to exercise any of these rights, please contact us as set forth in “Contact Us” below. We will process such requests in accordance with applicable laws. You may be entitled to additional rights depending on where you live. If you live in a country offering comprehensive privacy rights, please review the supplemental notice below (Annex A – Supplemental Privacy Notice for Individuals within the EU/UK)." },
        { kind: "p", text: "Only you, or someone legally authorized to act on your behalf in certain jurisdictions, may make a request to exercise the rights listed above regarding your personal information. If your personal information is subject to a law allowing an authorized agent to act on your behalf in exercising your privacy rights and you wish to designate an authorized agent, please provide written authorization signed by you and your designated agent using the information found in “Contact Us” below and ask us for additional instructions." },
        { kind: "p", text: "To protect your privacy, we will take steps to verify your identity before fulfilling requests submitted under applicable privacy laws. These steps may involve asking you to provide sufficient information allowing us to reasonably verify you are the person about whom we collected personal information or an authorized representative. Examples of our verification process may include asking you to confirm the email address we have associated with you." },
        { kind: "p", text: "Some laws may allow you to appeal our decision if we decline to process your request. If applicable laws grant you an appeal right, and you would like to appeal our decision with respect to your request, you may do so by informing us of this and providing us with information supporting your appeal." },
      ],
    },
    {
      id: "international-transfers",
      title: "6. International Transfers of Personal Information",
      blocks: [
        { kind: "p", text: "All personal information we process may be transferred, processed, and stored anywhere in the world, including, but not limited to, the United States or other countries. Please note, these countries may have data protection laws that are different from the laws where you live and may not have “adequate” data protection laws as defined by the data protection authority in the country in which you reside." },
        { kind: "p", text: "If we transfer personal information from the European Economic Area, Switzerland, and/or the United Kingdom to a country not considered to provide an “adequate” level of protection under applicable data protection laws, one safeguard we may use to support such transfer is the EU Standard Contractual Clauses." },
        { kind: "p", text: "For more information about the safeguards we use for international transfers of your personal information, please “Contact Us.”" },
      ],
    },
    {
      id: "retention",
      title: "7. Retention of Personal Information",
      blocks: [
        { kind: "p", text: "We store the personal information we collect as described in this Privacy Notice for as long as you use the Services, or as necessary to fulfill the purpose(s) for which it was collected or pursue our business purposes." },
        { kind: "p", text: "To determine the appropriate retention period for personal information, we may consider applicable legal requirements, the amount, nature, and sensitivity of the personal information, certain risk factors, the purposes for which we process your personal information, and whether we can achieve those purposes through other means." },
      ],
    },
    {
      id: "childrens-information",
      title: "8. Children's Personal Information",
      blocks: [
        { kind: "p", text: "The Services are not directed to children under 18 (or other age as required by local law outside the United States), and we do not knowingly collect personal information from children." },
        { kind: "p", text: "If you are a parent or guardian and believe your child has uploaded personal information to the Services in violation of applicable law, you may contact us as described in “Contact Us” below." },
      ],
    },
    {
      id: "third-party-websites",
      title: "9. Third-Party Websites/Applications",
      blocks: [
        { kind: "p", text: "The Services may contain links to other websites/applications and other websites/applications may reference or link to our Services. These third-party services are not controlled by us. We encourage our users to read the privacy policies of each website and application with which they interact. We do not endorse, screen, or approve, and are not responsible for, the privacy practices or content of such other websites or applications. Providing personal information to third-party websites or applications is at your own risk." },
      ],
    },
    {
      id: "contact-us",
      title: "10. Contact Us",
      blocks: [
        { kind: "p", text: "Altilos is the controller of the personal information we process under this Privacy Notice." },
        { kind: "p", text: "If you have any questions about our privacy practices or this Privacy Notice, would like to speak with our appointed Data Protection Officer and/or EU/UK Representative, or to exercise your rights as detailed in this Privacy Notice, please contact us at:" },
        {
          kind: "ul",
          items: [
            "Email: info@altilos.com",
            "Postal Mail: [TODO: ALTILOS REGISTERED ADDRESS]",
            "Telephone: +1-909-243-4942",
          ],
        },
      ],
    },
    {
      id: "annex-a",
      title: "Annex A, Supplemental Notice for Individuals within the EU/UK",
      blocks: [
        { kind: "p", text: "This Supplemental Notice for EU/UK GDPR only applies to our processing of personal information subject to the European Union or the United Kingdom General Data Protection Regulation." },
        { kind: "p", text: "In some cases, providing personal information may be a requirement under applicable law, a contractual requirement, or a requirement necessary to enter a contract. If you choose not to provide personal information in cases where it is required, we will inform you of the consequences at the time of your refusal to provide the personal information." },
        { kind: "p", text: "Altilos’s processing of personal information may be supported by one or more of the following lawful bases." },
        {
          kind: "table",
          head: ["Privacy Notice Section", "Performance of a Contract", "Legitimate Interest", "Consent", "Compliance with Legal Obligations"],
          rows: [
            ["Section 3A: Provide the Services", "✔", "✔", "✔", "✔"],
            ["Section 3B: Improve the Services and Develop New Products and Services", "✔", "✔", "✔", "✔"],
            ["Section 3C: Operate Our Business", "✔", "✔", "✔", "✔"],
            ["Section 3D: Marketing", "", "✔", "✔", ""],
            ["Section 3E: With Your Consent or Direction", "✔", "✔", "✔", ""],
          ],
        },
        { kind: "p", text: "If we process personal information that is considered a “special category of personal data,” our processing of this personal information may be supported by one or more of the following conditions:" },
        {
          kind: "ul",
          items: [
            "**Explicit Consent:** You may have provided your explicit consent for our processing of your personal information.",
            "**Necessary for Employment, Social Security, or Social Protection Law Purposes:** Our processing of your personal information may be necessary for the purposes of carrying out obligations and exercising specific rights in the field of employment, social security, and/or social protection law.",
            "**Necessary to Protect Vital Interests:** Our processing of your personal information may be necessary to protect the vital interests of you if you are physically or legally incapable of giving consent.",
            "**In Connection with a Foundation, Association or Other Non-Profit Body.** Our processing of your personal information may be carried out in the course of our legitimate activities in connection with our foundation, association, or other non-profit body.",
            "**Publicly Available Personal Information:** Our processing of your personal information may relate to personal information which has been manifestly made public by you.",
            "**Necessary for the Establishment, Exercise or Defense of Legal Claims:** Our processing of your personal information may be necessary for the establishment, exercise or defense of legal claims.",
            "**Necessary for Substantial Public Interest:** Our processing of your personal information may be necessary for reasons of substantial public interest.",
            "**Necessary for Medical Purposes:** Our processing of your personal information may be necessary for the purposes of preventive or occupational medicine, medical diagnosis, the provision of health or social care or treatment or the management of health or social care systems and services, or pursuant to contract with a health professional.",
            "**Necessary for Substantial Interest in the Area of Public Health:** Our processing of your personal information may be necessary for reasons of public interest in the area of public health.",
            "**Necessary for Archiving, Research, or Statistical Purposes.** Our processing of your personal information may be necessary for archiving purposes in the public interest, scientific or historical research purposes or statistical purposes.",
          ],
        },
        { kind: "p", text: "If your personal information is subject to the applicable data protection laws of the European Economic Area or the United Kingdom, you have the right to lodge a complaint with the competent supervisory authority if you believe our processing of your personal information violates applicable law." },
        {
          kind: "ul",
          items: [
            "If you are located within the European Economic Area, you may find the contact details of the competent authorities in the following link: [European Data Protection Board members](https://www.edpb.europa.eu/about-edpb/about-edpb/members_en).",
            "If you are located within the United Kingdom, you may lodge a complaint with the Information Commissioner’s Office (ICO) via the [ICO complaints page](https://ico.org.uk/make-a-complaint/).",
          ],
        },
      ],
    },
  ],
  help: {
    body:
      "Privacy questions or want to exercise your rights? Contact our Data Protection Officer.",
    email: "info@altilos.com",
  },
  related: [{ label: "General Terms", href: "/terms" }],
};
