import type { BlogArticle } from "./types";

/** EN: Deposit calculator guide — paired with RU via topicKey. */
export const depositCalculatorGuideEn: BlogArticle = {
  topicKey: "deposit-calculator",
  articleSection: "Personal finance",
  slug: "deposit-calculator-savings-interest-guide",
  title: "Deposit Calculator: How to Project Savings Growth and Interest Earned",
  metaTitle: "Deposit Calculator: Savings & APY Guide | FinanceCalculator",
  metaDescription:
    "Use a deposit calculator to project savings growth with monthly contributions, APY, and term. Step-by-step formula, worked example, and free online tool.",
  keywords:
    "deposit calculator, savings calculator, APY calculator, monthly contribution savings, compound interest deposit, term deposit calculator, savings growth projection",
  excerpt:
    "A deposit calculator projects your balance from an opening amount, monthly contributions, rate, and term — with the math, a worked example, and our free tool.",
  datePublished: "2026-06-13",
  dateModified: "2026-06-13",
  author: "FinanceCalculator Editorial",
  readingTimeMinutes: 11,
  hero: {
    src: "/blog/deposit-calculator-hero.svg",
    srcWebp: "/blog/deposit-calculator-hero.webp",
    alt: "Deposit calculator screen with $5,000 initial deposit, $200 monthly contribution, 5% rate, and projected $13,558 balance.",
    caption: "A deposit calculator combines opening balance, contributions, and interest into a projected savings total.",
    credit: "FinanceCalculator",
  },
  keyPhrases: [
    "deposit calculator",
    "monthly savings contribution",
    "APY vs interest rate",
    "compound growth on deposits",
    "term deposit projection",
  ],
  blocks: [
    {
      t: "p",
      text: "Whether you are building an emergency fund, saving for a down payment, or comparing bank offers, you need a realistic end balance — not a guess. A deposit calculator turns an opening amount, optional monthly contributions, annual rate, and term into projected growth and interest earned. This guide explains the monthly compounding logic, walks through a numeric example, and links to our free browser tool.",
    },
    {
      t: "h2",
      id: "what-is-deposit-calculator",
      text: "What is a deposit calculator?",
    },
    {
      t: "p",
      text: "A deposit calculator is an online or spreadsheet tool that estimates how savings grow when interest compounds on your balance and you add money each period. Unlike a simple interest quote, it models month-by-month accrual: interest applies to the current balance, then contributions stack on top. The output is a planning figure — actual banks may use tiered rates, promotional APY windows, or withdrawal penalties that change real results.",
    },
    {
      t: "p",
      text: "Savings accounts, certificates of deposit (CDs), and term deposits all share the same core question: how much will I have at the end? Running scenarios in one place lets you compare a 4.5% high-yield savings account against a 5% CD with locked funds, using identical contribution assumptions.",
    },
    {
      t: "h2",
      id: "how-monthly-compounding-works",
      text: "How monthly compounding works",
    },
    {
      t: "p",
      text: "FinanceCalculator’s deposit tool compounds monthly. Each period: accrued interest = current balance × (annual rate ÷ 12), then the balance becomes prior balance + accrued interest + monthly contribution. There is no separate compounding-frequency toggle because contributions already arrive monthly — matching how most savers fund accounts.",
    },
    {
      t: "callout",
      variant: "note",
      title: "APY vs. nominal rate",
      text: "APY (annual percentage yield) reflects compounding within a year. A 5% APY savings quote is not identical to 5% simple interest on one lump sum. When comparing products, use APY on each side or model the same compounding rule in your spreadsheet.",
    },
    {
      t: "h2",
      id: "inputs-explained",
      text: "Inputs: initial deposit, contributions, rate, and term",
    },
    {
      t: "ul",
      items: [
        "Initial deposit — money already in the account on day one.",
        "Monthly contribution — optional recurring add-on; set to zero for a lump-sum CD scenario.",
        "Annual rate — use the APY or note rate your bank publishes; keep it constant for baseline projections.",
        "Term — total months or years; longer horizons amplify compounding on both principal and prior interest.",
        "Opening date — schedules payment dates in the table; does not change the math when rate is flat.",
      ],
    },
    {
      t: "h2",
      id: "worked-example",
      text: "Worked example: $5,000 plus $200/month at 5% for 3 years",
    },
    {
      t: "p",
      text: "Start with $5,000, add $200 every month, and assume a steady 5% annual rate for 36 months. The deposit calculator projects a final balance of about $13,558. You contributed $12,200 in principal ($5,000 + 36 × $200), so roughly $1,358 is interest. Year-end checkpoints: about $7,712 after year one, $10,562 after year two.",
    },
    {
      t: "table",
      caption: "Illustrative projection — promotional rates and fees can shift real outcomes.",
      head: ["Metric", "Value", "Notes"],
      rows: [
        ["Initial deposit", "$5,000", "Day-one balance"],
        ["Monthly contribution", "$200", "Added after each interest accrual"],
        ["Annual rate", "5.0%", "Held constant for projection"],
        ["Term", "36 months", "3 years"],
        ["Total contributed", "$12,200", "Initial + 36 contributions"],
        ["Interest earned", "$1,358", "Final balance minus contributions"],
        ["Projected balance", "$13,558", "End of month 36"],
      ],
    },
    {
      t: "figure",
      src: "/blog/deposit-monthly-growth.svg",
      srcWebp: "/blog/deposit-monthly-growth.webp",
      alt: "Stacked bar chart showing deposit balance growth by year with contributions and interest portions at 5% APY.",
      caption: "Contributions add steadily; interest grows as the balance base enlarges.",
      credit: "FinanceCalculator",
    },
    {
      t: "h2",
      id: "savings-vs-cd",
      text: "Savings accounts vs. term deposits (CDs)",
    },
    {
      t: "p",
      text: "High-yield savings accounts offer flexibility — you can withdraw for emergencies, though rates can change overnight. CDs and term deposits often pay slightly more but lock funds until maturity; early withdrawal triggers penalties that erase months of yield. Model each product with the same contribution plan, then subtract penalty risk mentally for locked products.",
    },
    {
      t: "h2",
      id: "apy-compound-interest",
      text: "Relationship to compound interest",
    },
    {
      t: "p",
      text: "Deposit growth is compound interest plus cash flows. The classic formula A = P(1 + r/n)^(nt) assumes no monthly deposits. Adding contributions requires period-by-period simulation — exactly what the calculator does. For a deeper look at compounding frequency and timing effects on lump sums, see our compound interest guide.",
    },
    {
      t: "link",
      href: "/blog/compound-interest-guide",
      label: "Compound interest guide: formula and frequency",
      internal: true,
    },
    {
      t: "h2",
      id: "use-our-calculator",
      text: "How to use our deposit calculator",
    },
    {
      t: "p",
      text: "Open the deposit page on FinanceCalculator, enter initial balance, monthly contribution, annual rate, term in years, and opening date. Results update live with a payment schedule, interest total, and balance chart. Toggle contribution to zero to compare a one-time CD, or raise the monthly amount to see how automation accelerates the curve.",
    },
    {
      t: "link",
      href: "/deposit",
      label: "Open the free deposit calculator",
      internal: true,
    },
    {
      t: "link",
      href: "https://www.investor.gov/introduction-investing/investing-basics/glossary/annual-percentage-yield-apy",
      label: "Investor.gov — APY glossary (SEC)",
      nofollow: true,
    },
    {
      t: "h2",
      id: "common-mistakes",
      text: "Common mistakes when projecting deposits",
    },
    {
      t: "ul",
      items: [
        "Treating a promotional APY as permanent for multi-year projections.",
        "Ignoring taxes on interest in taxable accounts (withholding varies by country).",
        "Forgetting that CD penalties can exceed earned interest if you exit early.",
        "Comparing accounts with different compounding rules without normalizing to APY.",
        "Skipping emergency liquidity needs in pursuit of the highest headline rate.",
      ],
    },
    {
      t: "h2",
      id: "faq",
      text: "Frequently asked questions",
    },
    {
      t: "h3",
      id: "faq-what-does-calculator-show",
      text: "What does a deposit calculator show?",
    },
    {
      t: "p",
      text: "It shows projected ending balance, total interest earned, and usually a period-by-period schedule. You enter opening balance, optional monthly additions, rate, and term — the tool compounds monthly on the running balance.",
    },
    {
      t: "h3",
      id: "faq-monthly-contribution",
      text: "Do monthly contributions change the math?",
    },
    {
      t: "p",
      text: "Yes. Each contribution increases the base that earns interest next month. Skipping contributions in the model when you plan to save monthly will understate your outcome.",
    },
    {
      t: "h3",
      id: "faq-apy-input",
      text: "Should I enter APY or APR?",
    },
    {
      t: "p",
      text: "Use APY when the bank quotes it — it already reflects intra-year compounding. If only a nominal annual rate is published, confirm how often the institution compounds before comparing products.",
    },
    {
      t: "h3",
      id: "faq-cd-penalty",
      text: "Can I model a certificate of deposit?",
    },
    {
      t: "p",
      text: "Yes — set monthly contribution to zero and enter the lump sum as the initial deposit. Add the term in years matching the CD maturity. Remember early withdrawal penalties are not modeled automatically.",
    },
    {
      t: "h3",
      id: "faq-inflation",
      text: "Does the calculator adjust for inflation?",
    },
    {
      t: "p",
      text: "No. Projections are nominal — dollars in the account, not purchasing power. For long goals, mentally discount results or run a separate inflation estimate.",
    },
    {
      t: "h3",
      id: "faq-accuracy",
      text: "How accurate are online deposit projections?",
    },
    {
      t: "p",
      text: "With a fixed rate and monthly compounding, the math is deterministic. Real accounts differ when banks change rates, cap balances on promo tiers, or charge fees.",
    },
    {
      t: "callout",
      variant: "disclaimer",
      title: "Disclaimer",
      text: "This article is educational, not tax or investment advice. Rates, insurance limits, and product rules vary by institution and country. Confirm figures with your bank before committing funds.",
    },
  ],
  sources: [
    {
      title: "U.S. Securities and Exchange Commission — Investor.gov",
      url: "https://www.investor.gov/",
    },
    {
      title: "Investor.gov — Annual Percentage Yield (APY)",
      url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/annual-percentage-yield-apy",
    },
  ],
  calcLink: "deposit",
};
