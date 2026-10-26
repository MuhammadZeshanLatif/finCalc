import type { LegalDocument } from "./types";

const EMAIL = "contact@financcalculators.com";

export const editorialPolicy: Record<"en", LegalDocument> = {
  en: {
    title: "Editorial Policy",
    lastUpdated: "October 26, 2026",
    lastUpdatedIso: "2026-10-26",
    intro:
      "Money decisions deserve accurate, plainly written information. This page explains how FinanceCalculator plans, writes, checks, updates and corrects its calculators and articles, and how we keep advertising separate from editorial content.",
    sections: [
      {
        id: "mission",
        title: "What we publish and why",
        paragraphs: [
          "We publish free calculators and practical guides that explain the math behind everyday money questions: what a loan really costs, how compounding works, how much a mortgage payment includes, how tax brackets apply, and similar topics. Every article is tied to a real question readers ask and, where possible, to a calculator so you can test the numbers yourself.",
        ],
      },
      {
        id: "standards",
        title: "Our content standards",
        paragraphs: [
          [
            "Accuracy first: formulas are shown or explained, worked examples are recalculated, and figures such as tax limits or rates are checked against official sources (for example government agencies, central banks and regulators).",
            "Sources: we cite primary sources where they exist and link to them so you can verify the information.",
            "Plain language: we explain jargon, show the assumptions behind every example, and point out what a calculator leaves out.",
            "No promises: we do not promise returns, approval, savings or outcomes, and we do not recommend specific financial products.",
            "Dates matter: articles show when they were published and updated, and rules that change yearly are labeled with the year they apply to.",
          ],
        ],
      },
      {
        id: "process",
        title: "How articles are created and reviewed",
        paragraphs: [
          "Topics are chosen from reader questions, search data and the calculators on the site. Drafts may be prepared with the help of software tools, including AI writing assistants, to research outlines or produce a first draft.",
          "No article is published automatically. Every article is saved as a draft and must be read, fact-checked and edited by a member of our team before it goes live. During review we recalculate the worked examples with our own calculators, check facts and figures against the cited sources, remove anything we cannot verify, and edit for clarity.",
          "Calculators are tested against hand calculations and published reference examples before release and after changes.",
        ],
      },
      {
        id: "updates",
        title: "Updates and corrections",
        paragraphs: [
          "We review articles when laws, limits or rates change and at least once a year for evergreen topics. When we update an article, the “Updated” date changes.",
          `If you spot a mistake, email ${EMAIL} or use our [contact page](/contact). We review every correction request, fix confirmed errors promptly, and note significant corrections in the article.`,
        ],
      },
      {
        id: "independence",
        title: "Advertising and editorial independence",
        paragraphs: [
          "FinanceCalculator is funded by display advertising served by third-party networks. Advertisers do not choose topics, review articles or influence calculator results, and ads are visually separated from editorial content.",
          "We do not accept payment for favorable coverage. Any sponsored content or affiliate link would be clearly labeled.",
        ],
      },
      {
        id: "limits",
        title: "Know the limits",
        paragraphs: [
          "Our content is educational and general. It cannot account for your full situation. Please read our [Disclaimer](/disclaimer) and consult a qualified professional before major financial, tax, legal or health decisions.",
        ],
      },
    ],
  },
};
