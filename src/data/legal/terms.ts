import type { LegalDocument } from "./types";

const SITE = "https://financcalculators.com";
const EMAIL = "contact@financcalculators.com";

export const termsOfUse: Record<"en", LegalDocument> = {
  en: {
    title: "Terms and Conditions",
    lastUpdated: "June 11, 2026",
    intro:
      "These Terms govern your use of FinanceCalculator at financcalculators.com. By accessing the site you agree to these Terms and our Privacy Policy. If you do not agree, please do not use the site.",
    sections: [
      {
        id: "service",
        title: "About the service",
        paragraphs: [
          "FinanceCalculator provides free online financial and scientific calculators, educational articles, and related tools in English and Russian.",
          "The site is supported by advertising (including Google AdSense and other ad networks). Ads may be personalized based on your browsing activity as described in our Privacy Policy.",
        ],
      },
      {
        id: "not-advice",
        title: "Not professional advice",
        paragraphs: [
          "All calculator results, blog articles, and examples are for general information and education only. They are not tax, legal, investment, medical, or accounting advice.",
          "Tax rules, loan products, and regulations vary by country and change over time. Always verify figures with qualified professionals and official sources before making financial decisions.",
          "We do not guarantee that any result is complete, current, or suitable for your situation.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        paragraphs: [
          "You may use the site for lawful personal and commercial reference purposes.",
          "You may not: attempt to disrupt or overload our servers; scrape the site in a way that harms performance; upload malware; misrepresent affiliation with FinanceCalculator; or use automated tools to circumvent advertising or security measures.",
          "You may not copy large portions of our editorial content for republication without permission, except as allowed by fair use or applicable law.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual property",
        paragraphs: [
          "The FinanceCalculator name, logo, site design, original articles, and calculator layouts are protected by copyright and related rights.",
          "Third-party trademarks (for example, TI-84 or Desmos where referenced) belong to their respective owners. Our tools are independent educational implementations unless stated otherwise.",
        ],
      },
      {
        id: "advertising",
        title: "Advertising and third-party links",
        paragraphs: [
          "We display third-party advertisements and may include links to external sites. We are not responsible for the content, products, or privacy practices of advertisers or linked sites.",
          "Clicking an ad or external link is at your own risk. Review the advertiser’s terms and privacy policy.",
        ],
      },
      {
        id: "disclaimer",
        title: "Disclaimer of warranties",
        paragraphs: [
          'The site is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.',
          "We do not warrant uninterrupted or error-free operation.",
        ],
      },
      {
        id: "liability",
        title: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, FinanceCalculator and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising from your use of the site or reliance on calculator outputs.",
          "Our total liability for any claim relating to the site shall not exceed the amount you paid us to use the site (which is zero for free users).",
          "Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the maximum permitted by law.",
        ],
      },
      {
        id: "indemnity",
        title: "Indemnification",
        paragraphs: [
          "You agree to indemnify and hold harmless FinanceCalculator from claims arising out of your misuse of the site or violation of these Terms.",
        ],
      },
      {
        id: "changes",
        title: "Changes to the site and Terms",
        paragraphs: [
          "We may modify calculators, content, features, or these Terms at any time. Material changes will be reflected by updating the “Last updated” date. Continued use constitutes acceptance.",
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
