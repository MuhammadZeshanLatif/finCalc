import type { LegalDocument } from "./types";

const EMAIL = "contact@financcalculators.com";

export const disclaimer: Record<"en", LegalDocument> = {
  en: {
    title: "Disclaimer",
    lastUpdated: "October 26, 2026",
    lastUpdatedIso: "2026-10-26",
    intro:
      "FinanceCalculator publishes calculators and articles to help people understand money math. Please read this disclaimer before relying on anything you find on financcalculators.com.",
    sections: [
      {
        id: "educational-only",
        title: "Educational information, not advice",
        paragraphs: [
          "Everything on this Website, including calculator results, articles, examples, tables and charts, is general educational information. It is not financial, investment, tax, legal, accounting, insurance or medical advice, and it does not take your personal circumstances into account.",
          "FinanceCalculator is not a bank, lender, broker, investment adviser, tax preparer or law firm. Nothing on the Website is an offer, recommendation or solicitation to buy, sell or borrow any product.",
          "Before making decisions about loans, mortgages, investments, taxes, retirement or insurance, talk to a qualified, licensed professional and check the official documents from your lender, plan provider or tax authority.",
        ],
      },
      {
        id: "calculator-accuracy",
        title: "How accurate are the calculators?",
        paragraphs: [
          "Our calculators use standard, published formulas (for example the amortization formula for loan payments and the compound interest formula for savings). Results are estimates that depend entirely on the numbers you enter and on simplifying assumptions, such as:",
          [
            "fixed interest rates for the whole term unless a tool says otherwise;",
            "no fees, penalties, insurance, escrow or taxes unless a field for them is shown;",
            "regular, on-time payments and standard rounding;",
            "simplified, illustrative tax brackets that may not match your filing status, location or tax year.",
          ],
          "Real offers and statements from lenders, banks and governments can differ. Treat every result as a starting point for a conversation, not a final figure.",
        ],
      },
      {
        id: "health",
        title: "Health calculators",
        paragraphs: [
          "Tools such as the BMI calculator are screening and education aids only. They do not diagnose any condition and are not a substitute for advice from a doctor or other healthcare professional.",
        ],
      },
      {
        id: "rates-and-data",
        title: "Rates, laws and third-party data",
        paragraphs: [
          "Exchange rates come from public reference sources and may be delayed; they are not the rate your bank or card provider will charge. Tax rates, contribution limits and regulations change, and articles reflect our understanding at the time they were written or last updated. We work to keep content current but cannot guarantee it.",
        ],
      },
      {
        id: "advertising-disclosure",
        title: "Advertising and affiliate disclosure",
        paragraphs: [
          "The Website is free because it shows advertising. Ads are selected and served by third-party networks and do not represent an endorsement by FinanceCalculator. Advertisers have no influence over our articles or calculator results.",
          "If an article ever contains affiliate links or sponsored content, it will be clearly labeled, and we may earn a commission at no extra cost to you.",
        ],
      },
      {
        id: "external-links",
        title: "External links",
        paragraphs: [
          "We link to government agencies, regulators and other sources so you can verify information. We are not responsible for the content or availability of external websites.",
        ],
      },
      {
        id: "errors",
        title: "Found an error?",
        paragraphs: [
          `We correct mistakes quickly. If you find an error in a calculator or article, email ${EMAIL} or use the [contact page](/contact). Read how we create and review content in our [Editorial Policy](/editorial-policy).`,
        ],
      },
    ],
  },
};
