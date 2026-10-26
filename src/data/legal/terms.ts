import type { LegalDocument } from "./types";

const SITE = "https://financcalculators.com";
const EMAIL = "contact@financcalculators.com";

export const termsOfUse: Record<"en", LegalDocument> = {
  en: {
    title: "Terms and Conditions",
    lastUpdated: "October 26, 2026",
    lastUpdatedIso: "2026-10-26",
    intro:
      "These Terms govern your use of FinanceCalculator at financcalculators.com (the “Website”). By using the Website you agree to these Terms and to our [Privacy Policy](/privacy). If you do not agree, please do not use the Website.",
    sections: [
      {
        id: "service",
        title: "About the service",
        paragraphs: [
          "FinanceCalculator provides free online financial, math and everyday calculators, together with educational articles and guides. No account is required.",
          "The Website is supported by advertising. Ads are served by third-party partners such as Mediavine and Google, which may personalize ads based on your browsing activity as described in our [Privacy Policy](/privacy).",
        ],
      },
      {
        id: "not-advice",
        title: "Not professional advice",
        paragraphs: [
          "All calculator results, articles and examples are general information for education only. They are not financial, investment, tax, legal, accounting, insurance or medical advice, and no client or advisory relationship is created by using the Website.",
          "Tax rules, interest rates, loan products and regulations vary by country and change over time. Always verify figures with official sources and a qualified professional before you make a financial decision. Read our full [Disclaimer](/disclaimer).",
          "We do not guarantee that any result is complete, current, accurate or suitable for your situation.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        paragraphs: [
          "You may use the Website for lawful personal and business reference purposes. You agree not to:",
          [
            "disrupt, overload or attempt to gain unauthorized access to the Website, its servers or its admin areas;",
            "scrape or copy the Website with automated tools in a way that harms performance;",
            "upload or transmit malware or spam, including through the contact form;",
            "generate fraudulent ad impressions or clicks, or interfere with advertising or security measures;",
            "misrepresent an affiliation with FinanceCalculator.",
          ],
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual property",
        paragraphs: [
          "The FinanceCalculator name, logo, site design, original articles, images and calculator interfaces are protected by copyright and other laws. You may share links and quote short excerpts with attribution and a link back; republishing whole articles requires our written permission.",
          "Third-party trademarks mentioned on the Website (for example TI-84 or Desmos) belong to their owners. Our tools are independent implementations and are not endorsed by those companies.",
        ],
      },
      {
        id: "advertising",
        title: "Advertising, sponsorship and third-party links",
        paragraphs: [
          "Advertisements are provided by third parties and are clearly separated from our editorial content. Advertisers do not review or approve our articles or calculator results. If we ever publish sponsored content or use affiliate links, we will label it clearly.",
          "We link to external websites for sources and further reading. We are not responsible for their content, products or privacy practices.",
        ],
      },
      {
        id: "disclaimer",
        title: "Disclaimer of warranties",
        paragraphs: [
          'The Website is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy and non-infringement. We do not warrant uninterrupted or error-free operation.',
        ],
      },
      {
        id: "liability",
        title: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, FinanceCalculator and its operators are not liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, savings or data, arising from your use of the Website or reliance on calculator outputs or articles.",
          "Our total liability for any claim relating to the Website is limited to the amount you paid us to use it, which is zero for free users. Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the maximum extent permitted by law.",
        ],
      },
      {
        id: "indemnity",
        title: "Indemnification",
        paragraphs: [
          "You agree to indemnify and hold harmless FinanceCalculator from claims arising out of your misuse of the Website or violation of these Terms.",
        ],
      },
      {
        id: "changes",
        title: "Changes to the Website and these Terms",
        paragraphs: [
          "We may change calculators, content, features or these Terms at any time. The “Last updated” date shows the latest version. Continued use after changes means you accept the updated Terms.",
        ],
      },
      {
        id: "governing-law",
        title: "Governing law",
        paragraphs: [
          "These Terms are governed by applicable laws of the Russian Federation, without regard to conflict-of-law rules, to the extent consistent with mandatory consumer protections in your country of residence.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        paragraphs: [
          `Questions about these Terms: ${EMAIL}`,
          `Contact page: ${SITE}/contact`,
        ],
      },
    ],
  },
};
