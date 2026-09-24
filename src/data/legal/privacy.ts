import type { LegalDocument } from "./types";

const SITE = "https://financcalculators.com";
const EMAIL = "contact@financcalculators.com";

export const privacyPolicy: Record<"en", LegalDocument> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "June 11, 2026",
    intro:
      "FinanceCalculator (“we”, “us”) operates financcalculators.com. This policy explains what information we collect, how we use cookies and third-party advertising, and what choices you have. Calculator inputs are processed in your browser; we do not require an account to use our tools.",
    sections: [
      {
        id: "information-we-collect",
        title: "Information we collect",
        paragraphs: [
          "Calculator data: Numbers you enter (loan amount, interest rate, dates, etc.) are processed locally in your browser unless a specific tool states otherwise. We do not store your calculation inputs on our servers.",
          "Contact form: If you send a message via our contact page, we receive the name, email address, and message text you submit so we can respond.",
          "Server logs: Our hosting provider may automatically log IP address, browser type, referring URL, request time, and pages viewed. This is standard web-server logging used for security and troubleshooting.",
          "Advertising data: Google AdSense and other ad partners may collect or receive device identifiers, cookie IDs, approximate location (derived from IP), and interaction data to deliver and measure ads. See the sections below for opt-out links.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and similar technologies",
        paragraphs: [
          "We use cookies and similar technologies for: (1) remembering your cookie consent choice, (2) serving and measuring advertisements, and (3) basic site functionality.",
          "Google AdSense: Google uses cookies (including the DoubleClick cookie) to serve ads based on your visits to this and other websites. You can opt out of personalized advertising by visiting Google Ads Settings: https://www.google.com/settings/ads",
          "Other ad partners: We may work with additional advertising networks (for example, programmatic partners) that set their own cookies to deliver ads and limit repeat impressions. Those partners are required to comply with applicable laws and their own policies.",
          "Essential preference cookie: When you click “Accept” on our cookie banner, we store a local preference (localStorage / cookie) so we do not show the banner on every visit.",
          "You can block or delete cookies in your browser settings. Blocking cookies may affect how ads display but calculators will still work.",
        ],
      },
      {
        id: "how-we-use",
        title: "How we use information",
        paragraphs: [
          "To operate, secure, and improve FinanceCalculator.",
          "To respond to contact messages and support requests.",
          "To display advertisements that help keep the site free.",
          "To comply with legal obligations and enforce our Terms of Use.",
          "We do not sell your personal information to data brokers.",
        ],
      },
      {
        id: "third-parties",
        title: "Third-party services",
        paragraphs: [
          `Google AdSense and Google marketing products — privacy policy: https://policies.google.com/privacy`,
          "Advertising and analytics partners listed in our ads.txt file at /ads.txt on this domain.",
          "Currency tools may call public exchange-rate APIs (for example, Frankfurter or ExchangeRate-API when configured). Those requests send only the data needed to fetch rates, not your identity.",
          "Embedded content (such as YouTube tutorials where linked) is governed by the third party’s policy when you interact with it.",
        ],
      },
      {
        id: "your-rights",
        title: "Your rights (EEA, UK, and similar regions)",
        paragraphs: [
          "Depending on where you live, you may have the right to access, correct, delete, or restrict processing of personal data, and to object to certain processing or withdraw consent where processing is consent-based.",
          "To exercise these rights, email us at the address below. We will respond within a reasonable time as required by applicable law.",
          "You may lodge a complaint with your local data-protection authority if you believe we have not handled your data lawfully.",
        ],
      },
      {
        id: "children",
        title: "Children’s privacy",
        paragraphs: [
          "FinanceCalculator is a general-audience financial education site. We do not knowingly collect personal information from children under 13 (or under 16 in the EEA where applicable). If you believe a child has provided us personal data, contact us and we will delete it.",
        ],
      },
      {
        id: "retention",
        title: "Data retention",
        paragraphs: [
          "Contact messages are kept only as long as needed to handle your request and for reasonable record-keeping.",
          "Server logs are retained according to our host’s standard rotation schedule (typically weeks to months).",
          "Cookie duration is set by each provider; see their policies for details.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "We use HTTPS across the site. No method of transmission over the Internet is 100% secure; we follow reasonable practices appropriate to a free calculator website.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. The “Last updated” date at the top will change when we do. Continued use of the site after changes means you accept the updated policy.",
        ],
      },
      {
        id: "contact",
        title: "Contact us",
        paragraphs: [
          `Questions about this Privacy Policy or your data: ${EMAIL}`,
          `Website: ${SITE}/contact`,
        ],
      },
    ],
  },
};
