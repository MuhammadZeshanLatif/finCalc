import type { BlogArticle } from "./types";

/** EN: NDFL 2026 calculator guide — paired with RU via topicKey. */
export const ndfl2026CalculatorGuideEn: BlogArticle = {
  topicKey: "ndfl-2026-calculator",
  articleSection: "Taxes",
  slug: "ndfl-2026-income-tax-calculator-guide",
  title: "NDFL 2026 Calculator: Russia Progressive Income Tax on Salary",
  metaTitle: "NDFL 2026: Income Tax Calculator Guide | FinanceCalculator",
  metaDescription:
    "NDFL 2026 calculator guide for Russia salary tax: 13–22% progressive brackets, ruble examples, marginal vs effective rate, and our free online tool.",
  keywords:
    "NDFL 2026, income tax calculator Russia, progressive tax brackets, marginal tax rate, effective tax rate, salary tax Russia, article 224 tax code",
  excerpt:
    "NDFL 2026 uses five progressive brackets on salary income. Learn the 13–22% scale, worked ruble examples, and how to estimate tax with our calculator.",
  datePublished: "2026-06-14",
  dateModified: "2026-06-14",
  author: "FinanceCalculator Editorial",
  readingTimeMinutes: 12,
  hero: {
    src: "/blog/ndfl-2026-hero.svg",
    alt: "NDFL 2026 calculator screen showing 4.5 million ruble income, bracket breakdown, and 627,000 ruble total tax.",
    caption: "NDFL 2026 applies higher rates only to the portion of annual income inside each bracket.",
    credit: "FinanceCalculator",
  },
  keyPhrases: [
    "NDFL 2026",
    "progressive tax brackets Russia",
    "marginal vs effective tax rate",
    "salary withholding calculation",
    "income tax calculator",
  ],
  blocks: [
    {
      t: "p",
      text: "From 2025 onward, most Russian residents pay salary income tax on a progressive scale that continues through NDFL 2026. The top headline rate is 22%, but only rubles above 50 million per year face that band — not your entire paycheck. This guide maps the official bracket table, shows ruble arithmetic step by step, and points to our calculator for marginal versus effective rate practice.",
    },
    {
      t: "h2",
      id: "what-is-ndfl-2026",
      text: "What is NDFL 2026?",
    },
    {
      t: "p",
      text: "NDFL (personal income tax) on the main tax base — wages, bonuses, and similar employment income for residents — follows a five-step ladder codified in Russian Tax Code Article 224, as amended by Federal Law No. 176-FZ of 12 July 2024. NDFL 2026 keeps the same structure as 2025: 13% on the first 2.4 million rubles of annual base, then 15%, 18%, 20%, and 22% on successive slices. Each rate touches only income inside its interval.",
    },
    {
      t: "h2",
      id: "ndfl-2026-brackets",
      text: "NDFL 2026 bracket table (main base)",
    },
    {
      t: "table",
      caption: "Simplified summary for residents — confirm full Article 224 text and FTS guidance for edge cases.",
      head: ["Annual base interval", "NDFL rate", "What the rate applies to"],
      rows: [
        ["Up to 2.4 million ₽", "13%", "Only rubles in this band"],
        ["2.4M – 5M ₽", "15%", "Only rubles inside the interval"],
        ["5M – 20M ₽", "18%", "Only rubles inside the interval"],
        ["20M – 50M ₽", "20%", "Only rubles inside the interval"],
        ["Above 50M ₽", "22%", "Only rubles above 50 million"],
      ],
    },
    {
      t: "figure",
      src: "/blog/ndfl-2026-brackets.svg",
      alt: "Table chart of NDFL 2026 progressive tax brackets from 13% to 22% with ruble thresholds.",
      caption: "Higher brackets tax slices of income, not the whole annual base at the top rate.",
      credit: "FinanceCalculator",
    },
    {
      t: "callout",
      variant: "note",
      title: "Other income types",
      text: "Dividends, deposit interest above limits, certain military payments, and regional coefficients can use different rates or bases. This article focuses on the main employment base most salaried workers ask about.",
    },
    {
      t: "h2",
      id: "how-to-calculate",
      text: "How to calculate NDFL 2026 step by step",
    },
    {
      t: "p",
      text: "Add gross salary and taxable bonuses for the calendar year (minus standard deductions if they apply). Split the total across brackets from bottom to top. Multiply each slice by its rate and sum the results. That total is annual NDFL; employers withhold progressively through the year so December cumulative withholding should match the annual ladder.",
    },
    {
      t: "h2",
      id: "example-4-5-million",
      text: "Worked example: 4.5 million ₽ annual base",
    },
    {
      t: "p",
      text: "On 4,500,000 ₽: 2,400,000 × 13% = 312,000 ₽. The next 2,100,000 ₽ (from 2.4M to 4.5M) × 15% = 315,000 ₽. Total NDFL 2026 liability: 627,000 ₽. Net income ≈ 3,873,000 ₽. Effective rate: 627,000 ÷ 4,500,000 ≈ 13.93%. The marginal rate on the next ruble is still 15% until you cross 5 million — not 22% on everything.",
    },
    {
      t: "h2",
      id: "example-6-million",
      text: "Worked example: 6 million ₽ annual base",
    },
    {
      t: "p",
      text: "On 6,000,000 ₽: 312,000 ₽ at 13% (first 2.4M), 390,000 ₽ at 15% (next 2.6M up to 5M), and 180,000 ₽ at 18% (the 5M–6M slice). Total tax 882,000 ₽; effective rate about 14.7%. This shows how a sixth-million earner pays more than a 4.5M earner, but still far below a flat 18% or 22% on the full amount.",
    },
    {
      t: "h2",
      id: "marginal-vs-effective",
      text: "Marginal rate vs. effective rate",
    },
    {
      t: "p",
      text: "Marginal rate is the tax on the next ruble of income — it tells you the cost of a bonus or raise at the margin. Effective rate is total tax divided by total gross — it answers “what share of my year did I actually pay?” NDFL 2026 confusion usually comes from mixing these two. For a deeper explanation of the paycheck myth, see our progressive brackets article.",
    },
    {
      t: "link",
      href: "/blog/progressive-tax-brackets-net-income",
      label: "Progressive tax brackets: marginal vs effective",
      internal: true,
    },
    {
      t: "h2",
      id: "use-calculator",
      text: "Using FinanceCalculator’s income tax tool",
    },
    {
      t: "p",
      text: "Our tax page demonstrates progressive bracket math with a teaching ladder in generic currency bands. It builds intuition for marginal and effective rates and shows a band-by-band table. It does not auto-load Russian ruble thresholds — use the ruble examples above or your employer’s cumulative withholding statement for compliance-grade NDFL 2026 figures.",
    },
    {
      t: "link",
      href: "/tax",
      label: "Open the income tax calculator",
      internal: true,
    },
    {
      t: "link",
      href: "https://www.nalog.gov.ru/rn77/taxation/taxes/ndfl/",
      label: "Federal Tax Service of Russia — NDFL section",
      nofollow: true,
    },
    {
      t: "h2",
      id: "withholding-monthly",
      text: "Why monthly withholding fluctuates",
    },
    {
      t: "p",
      text: "Payroll systems recalculate NDFL on a year-to-date base. A large bonus month can push cumulative income into a higher bracket mid-year, so one month’s payslip may show a higher withholding percentage than the next even at the same salary. By year-end, total withheld should align with the annual bracket math unless deductions or non-salary income change your base.",
    },
    {
      t: "h2",
      id: "deductions",
      text: "Deductions and annual reconciliation",
    },
    {
      t: "p",
      text: "Standard child deductions, social deductions for certain expenses, and property-related deductions can reduce taxable base if you claim them correctly. Some flow through employer; others via annual 3-NDFL filing with the FTS. The bracket examples here assume gross base before such reductions — adjust inputs if you know your certified deduction amounts.",
    },
    {
      t: "h2",
      id: "faq",
      text: "Frequently asked questions",
    },
    {
      t: "h3",
      id: "faq-ndfl-2026-rate",
      text: "What is the top NDFL 2026 rate on salary?",
    },
    {
      t: "p",
      text: "22% applies only to the portion of the main annual tax base above 50 million rubles. Most employees never reach that band; typical effective rates stay in the low teens even when marginal rates hit 15% or 18%.",
    },
    {
      t: "h3",
      id: "faq-raise-myth",
      text: "If I cross 2.4 million ₽, does all income get taxed at 15%?",
    },
    {
      t: "p",
      text: "No. Only rubles above 2.4 million face 15%. The first 2.4 million still pays 13%. That stair-step logic is the core of progressive NDFL 2026.",
    },
    {
      t: "h3",
      id: "faq-nonresident",
      text: "Do non-residents use the same NDFL 2026 brackets?",
    },
    {
      t: "p",
      text: "Non-residents generally face different rules and flat rates on many Russian-source income types. This guide targets tax residents on the main salary base.",
    },
    {
      t: "h3",
      id: "faq-calculator-rubles",
      text: "Does the site calculator use ruble brackets?",
    },
    {
      t: "p",
      text: "The built-in demo uses illustrative dollar-style bands to teach bracket mechanics. For ruble NDFL 2026 totals, apply the table in this article or official FTS tools.",
    },
    {
      t: "h3",
      id: "faq-december",
      text: "Why does December withholding look different?",
    },
    {
      t: "p",
      text: "Year-end true-up adjusts cumulative withholding to match the full-year progressive schedule. A December payslip often reflects catching up after bonuses or bracket crossings earlier in the year.",
    },
    {
      t: "h3",
      id: "faq-2025-vs-2026",
      text: "Did NDFL brackets change from 2025 to 2026?",
    },
    {
      t: "p",
      text: "As of the current Tax Code amendments discussed here, the five-band 13–22% structure for the main base continues. Always verify the latest FTS publications at the start of each tax year.",
    },
    {
      t: "callout",
      variant: "disclaimer",
      title: "Disclaimer",
      text: "Educational content only — not tax advice. Laws, deductions, and employer payroll rules change. Confirm calculations with the FTS, your accountant, or official filings before making financial decisions.",
    },
  ],
  sources: [
    {
      title: "Federal Tax Service of Russia (FTS)",
      url: "https://www.nalog.gov.ru/",
    },
    {
      title: "FTS Russia — NDFL",
      url: "https://www.nalog.gov.ru/rn77/taxation/taxes/ndfl/",
    },
  ],
  calcLink: "tax",
};
