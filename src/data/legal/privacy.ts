import type { LegalDocument } from "./types";

const SITE = "https://financcalculators.com";
const EMAIL = "contact@financcalculators.com";

export const privacyPolicy: Record<"en", LegalDocument> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "October 26, 2026",
    lastUpdatedIso: "2026-10-26",
    intro:
      "FinanceCalculator (“we”, “us”, “our”) operates the website financcalculators.com (the “Website” or “Site”). This Privacy Policy explains what information we collect, how we and our advertising partners use cookies and similar technologies, who we share information with, and the choices and rights you have. Calculator inputs are processed in your browser, and you never need an account to use our tools.",
    sections: [
      {
        id: "who-we-are",
        title: "Who we are and how to contact us",
        paragraphs: [
          `FinanceCalculator is an independent website that publishes free financial, math and everyday calculators together with educational articles. For any privacy question or request, email us at ${EMAIL} or use our [contact page](/contact).`,
        ],
      },
      {
        id: "information-we-collect",
        title: "Information we collect",
        paragraphs: [
          "Information you give us:",
          [
            "Contact form: when you send us a message we receive the name, email address, subject and message text you submit. We store these in our database provider (Supabase) so we can read and answer them.",
            "Email: if you email us directly, we receive your email address and anything you include in the message.",
          ],
          "Information collected automatically:",
          [
            "Calculator data: numbers you enter (loan amount, interest rate, dates, height and weight, and so on) are processed locally in your browser. We do not send or store your calculation inputs on our servers.",
            "Log data: our hosting provider and our content delivery network (Cloudflare) automatically record technical information such as IP address, browser type, device type, referring URL, pages requested and the date and time of each request. This is used for security, abuse prevention and troubleshooting.",
            "Cookies and similar technologies: we and our advertising and analytics partners use cookies, pixels, tags and local storage as described in the sections below.",
          ],
          "We do not ask for, and ask you not to send us, sensitive information such as government ID numbers, bank account details or health records.",
        ],
      },
      {
        id: "how-we-use",
        title: "How we use information",
        paragraphs: [
          [
            "To operate, maintain, secure and improve the Website and our calculators.",
            "To respond to messages, corrections and support requests.",
            "To display advertising that keeps the Website free, and to measure how ads perform.",
            "To understand, in aggregate, which pages and tools are useful so we can improve them.",
            "To detect, prevent and respond to fraud, abuse, security incidents and technical problems.",
            "To comply with legal obligations and enforce our [Terms and Conditions](/terms).",
          ],
          "Where the EU or UK General Data Protection Regulation applies, we rely on these legal bases: your consent (for non-essential cookies and personalized advertising), our legitimate interests (running, securing and improving the Website, answering messages), and compliance with legal obligations.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and similar technologies",
        paragraphs: [
          "A cookie is a small text file that a website stores on your device. We use the following kinds:",
          [
            "Strictly necessary: remember your privacy and consent choices and keep the Website secure. These cannot be switched off in our systems.",
            "Advertising: set by our advertising partners to serve ads, limit how often you see the same ad, measure ad performance and, where permitted, show ads based on your interests.",
            "Analytics: help us count visits and understand how pages are used, in aggregate.",
          ],
          "You can block or delete cookies in your browser settings. Blocking cookies does not stop the calculators from working, but it may change the ads you see. In regions where consent is required, a consent banner lets you accept, reject or customize non-essential cookies, and you can change your choice at any time using the privacy settings link shown on the Website.",
        ],
      },
      {
        id: "mediavine-programmatic-advertising",
        title: "Mediavine Programmatic Advertising (Ver 1.1)",
        paragraphs: [
          "The Website works with Mediavine to manage third-party interest-based advertising appearing on the Website. Mediavine serves content and advertisements when you visit the Website, which may use first and third-party cookies. A cookie is a small text file which is sent to your computer or mobile device (referred to in this policy as a “device”) by the web server so that a website can remember some information about your browsing activity on the Website.",
          "First party cookies are created by the website that you are visiting. A third-party cookie is frequently used in behavioral advertising and analytics and is created by a domain other than the website you are visiting. Third-party cookies, tags, pixels, beacons and other similar technologies (collectively, “Tags”) may be placed on the Website to monitor interaction with advertising content and to target and optimize advertising. Each internet browser has functionality so that you can block both first and third-party cookies and clear your browser’s cache. The \"help\" feature of the menu bar on most browsers will tell you how to stop accepting new cookies, how to receive notification of new cookies, how to disable existing cookies and how to clear your browser’s cache. For more information about cookies and how to disable them, you can consult the information at [All About Cookies](https://www.allaboutcookies.org/manage-cookies/).",
          "Without cookies you may not be able to take full advantage of the Website content and features. Please note that rejecting cookies does not mean that you will no longer see ads when you visit our Site. In the event you opt-out, you will still see non-personalized advertisements on the Website.",
          "The Website collects the following data using a cookie when serving personalized ads:",
          [
            "IP Address",
            "Operating System type",
            "Operating System version",
            "Device Type",
            "Language of the website",
            "Web browser type",
            "Email (in hashed form)",
          ],
          "Mediavine Partners (companies listed below with whom Mediavine shares data) may also use this data to link to other end user information the partner has independently collected to deliver targeted advertisements. Mediavine Partners may also separately collect data about end users from other sources, such as advertising IDs or pixels, and link that data to data collected from Mediavine publishers in order to provide interest-based advertising across your online experience, including devices, browsers and apps. This data includes usage data, cookie information, device information, information about interactions between users and advertisements and websites, geolocation data, traffic data, and information about a visitor’s referral source to a particular website. Mediavine Partners may also create unique IDs to create audience segments, which are used to provide targeted advertising.",
          "If you would like more information about this practice and to know your choices to opt-in or opt-out of this data collection, please visit [National Advertising Initiative opt out page](https://thenai.org/opt-out/). You may also visit [Digital Advertising Alliance website](http://optout.aboutads.info/#/) and [Network Advertising Initiative website](http://optout.networkadvertising.org/#) to learn more information about interest-based advertising. You may download the AppChoices app at [Digital Advertising Alliance’s AppChoices app](https://youradchoices.com/appchoices) to opt out in connection with mobile apps, or use the platform controls on your mobile device to opt out.",
          "For specific information about Mediavine Partners, the data each collects and their data collection and privacy policies, please visit [Mediavine Partners](https://www.mediavine.com/ad-partners/).",
        ],
      },
      {
        id: "other-advertising",
        title: "Other advertising and site features",
        paragraphs: [
          "Grow by Mediavine: we may use Grow, a Mediavine service that powers features such as saving favorite pages and recommended content. Grow may use cookies and local storage to provide these features and to support advertising measurement. If you create a Grow account, its own privacy terms apply.",
          "Google: before or alongside Mediavine we may display ads served by Google (including Google AdSense). Google and its partners use cookies to serve ads based on your visits to this and other websites. You can manage personalized advertising at [Google Ads Settings](https://adssettings.google.com/) and learn how Google uses data at [How Google uses information from sites that use its services](https://policies.google.com/technologies/partner-sites).",
          "Analytics: we may use Google Analytics 4 to understand aggregate traffic. Google Analytics uses cookies to collect information such as pages visited, approximate location and device type. You can opt out with the [Google Analytics opt-out browser add-on](https://tools.google.com/dlpage/gaoptout).",
          "Our list of authorized digital sellers is published at [/ads.txt](/ads.txt).",
        ],
      },
      {
        id: "sharing",
        title: "How we share information",
        paragraphs: [
          "We do not sell your contact-form details or email address to anyone. We share information only as follows:",
          [
            "Service providers that host and run the Website for us: our web host, Cloudflare (content delivery and security) and Supabase (database for contact messages and blog content). They process data on our instructions.",
            "Advertising and analytics partners, as described above, who collect information directly from your browser through cookies and similar technologies.",
            "Authorities or other parties when required by law, to protect our rights or the safety of others, or to investigate fraud or security issues.",
            "A buyer or successor if the Website is sold or transferred, in which case this policy continues to apply to the information transferred.",
          ],
        ],
      },
      {
        id: "us-state-privacy",
        title: "Your US state privacy rights",
        paragraphs: [
          "If you live in California, Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana, Iowa, Delaware, Nebraska, New Hampshire, New Jersey, Tennessee, Minnesota, Maryland or another US state with a comprehensive privacy law, you may have the right to:",
          [
            "Know and access the personal information we and our partners collect about you.",
            "Correct inaccurate personal information.",
            "Delete personal information we hold about you.",
            "Opt out of the “sale” of personal information or its “sharing” for cross-context behavioral (targeted) advertising, and opt out of profiling.",
            "Not be discriminated against for exercising these rights.",
          ],
          "Categories of personal information collected in the last 12 months: identifiers (such as IP address, cookie IDs and hashed email), internet or other electronic network activity (such as pages viewed and ad interactions), approximate geolocation derived from IP address, and, if you contact us, your name and email address. These are collected from you and your device for the purposes described in this policy.",
          "The use of advertising cookies for targeted advertising may be considered a “sale” or “sharing” of personal information under some state laws. To opt out, use the “Do Not Sell or Share My Personal Information” link that appears in the footer of the Website for visitors in applicable states. Where supported, we also honor browser-based opt-out preference signals such as Global Privacy Control.",
          `To make an access, correction or deletion request, email ${EMAIL} with the subject “Privacy request”. We may need to verify your request, and you may use an authorized agent. If we decline a request, you may appeal by replying to our decision; we will respond to appeals within the time required by your state’s law.`,
        ],
      },
      {
        id: "gdpr-rights",
        title: "Your rights in the EEA, UK and Switzerland",
        paragraphs: [
          "If you are in the European Economic Area, the United Kingdom or Switzerland, you have the right to access, correct, delete, restrict or object to processing of your personal data, the right to data portability, and the right to withdraw consent at any time (without affecting processing done before you withdrew). Personalized advertising in these regions is shown only with your consent, collected through a consent management platform registered with the IAB Transparency and Consent Framework.",
          `To exercise your rights, email ${EMAIL}. You may also lodge a complaint with your local data protection authority.`,
          "Our service providers and advertising partners may process data in countries outside your own, including the United States. Where required, these transfers rely on safeguards such as the European Commission’s Standard Contractual Clauses or the EU-US Data Privacy Framework.",
        ],
      },
      {
        id: "children",
        title: "Children’s privacy",
        paragraphs: [
          "The Website is a general-audience site intended for adults. It is not directed to children under 13 (or under 16 in the EEA and UK), and we do not knowingly collect personal information from them. If you believe a child has given us personal information, contact us and we will delete it.",
        ],
      },
      {
        id: "retention",
        title: "Data retention",
        paragraphs: [
          [
            "Contact messages: kept as long as needed to handle your request and for reasonable record-keeping, normally no longer than 24 months, then deleted.",
            "Server and security logs: kept according to our host’s and Cloudflare’s standard rotation schedules, typically weeks to a few months.",
            "Cookies: each cookie has its own lifetime set by the partner that places it; see their privacy policies.",
          ],
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "The whole Website is served over HTTPS. Access to contact messages and site content is restricted to authorized administrators and protected by database access rules. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        id: "do-not-track",
        title: "Do Not Track and third-party links",
        paragraphs: [
          "There is no common industry standard for “Do Not Track” browser signals, so we do not respond to them; we do honor Global Privacy Control where described above.",
          "Our articles link to other websites (for example government sources). Their privacy practices are their own; please review their policies.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy when our practices, partners or the law change. The “Last updated” date at the top shows when it last changed. If changes are significant, we will make that clear on the Website.",
        ],
      },
      {
        id: "contact",
        title: "Contact us",
        paragraphs: [
          `Questions about this Privacy Policy or your data: ${EMAIL}`,
          `Contact page: ${SITE}/contact`,
        ],
      },
    ],
  },
};
