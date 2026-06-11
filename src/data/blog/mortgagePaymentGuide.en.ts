import type { BlogArticle } from "./types";

/** EN: Mortgage payment calculator guide — paired with RU via topicKey. */
export const mortgagePaymentGuideEn: BlogArticle = {
  topicKey: "mortgage-payment-calculator",
  articleSection: "Personal finance",
  slug: "mortgage-payment-calculator-guide",
  title: "Mortgage Payment Calculator: How to Estimate Your Monthly PITI",
  metaTitle: "Mortgage Payment Calculator: PITI Guide | FinanceCalculator",
  metaDescription:
    "Use a mortgage payment calculator to estimate monthly PITI, total interest, and payoff before you buy. Step-by-step formula, worked examples, and free tool.",
  keywords:
    "mortgage payment calculator, monthly mortgage payment, PITI calculator, amortization, home loan payment, principal and interest, property tax estimate, mortgage affordability",
  excerpt:
    "Learn how a mortgage payment calculator estimates principal, interest, taxes, and insurance — with the standard formula, a worked example, and our free online tool.",
  datePublished: "2026-06-11",
  dateModified: "2026-06-11",
  author: "FinanceCalculator Editorial",
  readingTimeMinutes: 12,
  hero: {
    src: "/blog/mortgage-payment-hero.svg",
    alt: "Illustration of a mortgage payment calculator screen showing monthly PITI breakdown next to a house icon.",
    caption: "A mortgage payment calculator combines principal, interest, taxes, and insurance into one monthly figure.",
    credit: "FinanceCalculator",
  },
  keyPhrases: [
    "mortgage payment calculator",
    "monthly PITI payment",
    "principal and interest formula",
    "mortgage amortization schedule",
    "home affordability estimate",
  ],
  blocks: [
    {
      t: "p",
      text: "Buying a home starts with one practical question: what will you pay each month? A mortgage payment calculator answers that by combining principal, interest, property taxes, and homeowners insurance into a single figure lenders call PITI. This guide walks through the math, shows a real-number example, and points you to our free tool so you can sanity-check quotes before you apply.",
    },
    {
      t: "h2",
      id: "what-is-mortgage-payment-calculator",
      text: "What is a mortgage payment calculator?",
    },
    {
      t: "p",
      text: "A mortgage payment calculator is an online or spreadsheet tool that estimates your monthly home-loan payment from a few inputs: loan amount, annual interest rate, and loan term in years. Stronger versions also add estimated property taxes, insurance, and sometimes HOA dues or private mortgage insurance (PMI). The output is not a loan offer — it is a planning number you compare against your take-home pay and other debts.",
    },
    {
      t: "p",
      text: "Lenders underwrite on more than the sticker payment, but borrowers still model scenarios online to see how a 0.25% rate change or a larger down payment shifts the monthly line item. That is why the same workflow is useful both before house hunting and while comparing Loan Estimates from different banks.",
    },
    {
      t: "h2",
      id: "monthly-payment-formula",
      text: "How the monthly payment formula works",
    },
    {
      t: "p",
      text: "For a fixed-rate loan, principal and interest (P&I) follow the standard amortizing payment formula. Let P be the principal borrowed, r the monthly interest rate (annual rate ÷ 12), and n the total number of monthly payments (years × 12). The monthly payment M is:",
    },
    {
      t: "p",
      text: "M = P × [ r(1 + r)^n ] / [ (1 + r)^n − 1 ]. When r is 0, M simplifies to P ÷ n. Every reputable online mortgage tool implements this identity; differences usually come from rounding, extra fees, or whether taxes and insurance are layered on top.",
    },
    {
      t: "callout",
      variant: "note",
      title: "Quick check",
      text: "If you only need P&I, enter price minus down payment, rate, and term. Add annual tax and insurance bills divided by 12 to approximate full PITI.",
    },
    {
      t: "h2",
      id: "piti-breakdown",
      text: "PITI breakdown: what goes into the monthly bill",
    },
    {
      t: "ul",
      items: [
        "Principal — pays down the loan balance; share grows over time as interest shrinks.",
        "Interest — cost of borrowing; highest in early years on long amortization schedules.",
        "Taxes — property tax escrowed monthly; varies widely by county and assessment rules.",
        "Insurance — homeowners policy premium, often paid through escrow; flood or hazard riders may add more.",
        "PMI or FHA mortgage insurance — applies when down payment is under 20% on many conventional loans.",
      ],
    },
    {
      t: "figure",
      src: "/blog/mortgage-piti-vivid.svg",
      alt: "Diagram breaking down a monthly mortgage payment into principal, interest, taxes, and insurance slices.",
      caption: "PITI is the all-in monthly housing payment most affordability rules reference.",
      credit: "FinanceCalculator",
    },
    {
      t: "h2",
      id: "worked-example",
      text: "Worked example: $400,000 home with 20% down",
    },
    {
      t: "p",
      text: "Suppose you buy a $400,000 home, put 20% down ($80,000), and finance $320,000 at 6.5% for 30 years. The calculator returns about $2,022 for principal and interest alone. Add $410/month for property taxes and $145 for insurance and PITI lands near $2,577. That is the number to compare with net income, not the P&I line alone.",
    },
    {
      t: "table",
      caption: "Illustrative monthly breakdown — rates and tax bills vary by location and lender.",
      head: ["Component", "Monthly amount", "Notes"],
      rows: [
        ["Principal & interest", "$2,022", "Fixed-rate amortization on $320,000"],
        ["Property tax", "$410", "$4,920 annual tax ÷ 12"],
        ["Homeowners insurance", "$145", "Quote divided by 12"],
        ["PMI", "$0", "Waived with 20% down on many conventional loans"],
        ["Estimated PITI", "$2,577", "Sum before HOA or maintenance"],
      ],
    },
    {
      t: "h2",
      id: "amortization-total-interest",
      text: "Amortization and total interest",
    },
    {
      t: "p",
      text: "Amortization means each payment splits between interest and principal. Early checks mostly cover interest; later ones retire principal faster. On the example above, total interest over 30 years exceeds $408,000 — more than the original loan — which is why even a small rate reduction matters. A full amortization table shows how much interest you pay in years 1, 5, and 10, which helps you decide whether to buy points or make extra principal payments.",
    },
    {
      t: "h2",
      id: "pmi-and-insurance",
      text: "PMI, FHA insurance, and what calculators sometimes omit",
    },
    {
      t: "p",
      text: "Private mortgage insurance (PMI) on conventional loans typically applies when your down payment is under 20%. FHA loans carry an upfront and annual mortgage insurance premium with different rules. Online estimators may hide PMI behind an advanced toggle, so if you are putting 5% or 10% down, turn that field on or add a manual line item. Flood insurance in FEMA zones and umbrella liability policies are also outside basic PITI but belong in a complete housing budget.",
    },
    {
      t: "h2",
      id: "escrow-accounts",
      text: "Escrow accounts and why taxes feel ‘invisible’",
    },
    {
      t: "p",
      text: "Most U.S. lenders collect property taxes and homeowners insurance through an escrow account. You still pay monthly, but the servicer forwards lump sums to the county and insurer when bills are due. Escrow balances are analyzed once a year; shortages can raise your draft even if the note rate is fixed. When you model payments, use the annual tax bill from the listing or county assessor divided by twelve — not last year’s number if assessments are rising quickly in your market.",
    },
    {
      t: "h2",
      id: "fixed-vs-arm",
      text: "Fixed-rate loans vs. adjustable-rate mortgages (ARMs)",
    },
    {
      t: "p",
      text: "Fixed-rate mortgages keep the same P&I for the life of the loan, which makes budgeting straightforward. ARMs offer a lower initial rate for a set period — often 5, 7, or 10 years — then adjust on a schedule tied to an index plus a margin. The teaser payment can look affordable while the fully indexed rate would stress your budget. Stress-test ARMs by re-running your numbers at the cap rate shown in the loan documents, not just the start rate on the marketing flyer.",
    },
    {
      t: "figure",
      src: "/blog/mortgage-amortization-chart.svg",
      alt: "Chart showing mortgage loan balance declining over a 30-year term, with slow early progress.",
      caption: "Balance drops slowly at first because early payments are interest-heavy.",
      credit: "FinanceCalculator",
    },
    {
      t: "h2",
      id: "use-our-calculator",
      text: "How to use our online mortgage calculator",
    },
    {
      t: "p",
      text: "Open the mortgage calculator on this site, enter home price or loan amount, down payment, annual rate, and term. Toggle tax and insurance fields if you know local estimates; otherwise use county averages for a first pass. The page updates live in your browser — no sign-up — and you can switch scenarios in seconds.",
    },
    {
      t: "link",
      href: "/mortgage",
      label: "Open the free mortgage payment calculator",
      internal: true,
    },
    {
      t: "h2",
      id: "affordability-rules",
      text: "Affordability rules of thumb",
    },
    {
      t: "p",
      text: "Many planners cap housing near 28% of gross monthly income for PITI, and total debt payments near 36% including car loans and cards. These are starting points, not guarantees — high-cost markets, variable income, or aggressive savings goals may justify stricter personal limits. Run your estimate with conservative tax and insurance guesses so you are not surprised at closing.",
    },
    {
      t: "h2",
      id: "compare-loan-estimates",
      text: "Comparing Loan Estimates apples to apples",
    },
    {
      t: "p",
      text: "When two lenders quote different monthly payments, check whether each estimate includes the same tax and insurance assumptions, PMI, and HOA. Compare annual percentage rate (APR) and total closing costs, not just the payment on page one. A slightly higher rate with lower fees can beat a ‘teaser’ payment that balloons after discount points or escrow shortages. Save screenshots or PDFs so you can revisit the math after inspection negotiations change the price.",
    },
    {
      t: "h2",
      id: "common-mistakes",
      text: "Mistakes that skew calculator results",
    },
    {
      t: "p",
      text: "Skipping taxes and insurance, ignoring PMI with less than 20% down, or using the teaser rate instead of the APR-adjusted note rate are frequent errors. So is forgetting HOA fees, maintenance reserves, or assuming property taxes stay flat after purchase. For a deeper checklist, see our guide to common mortgage mistakes.",
    },
    {
      t: "link",
      href: "/blog/common-mortgage-mistakes-how-to-avoid",
      label: "10 common mortgage mistakes and how to avoid them",
      internal: true,
    },
    {
      t: "link",
      href: "https://www.consumerfinance.gov/owning-a-home/",
      label: "CFPB — Owning a Home (official borrower resources)",
      nofollow: true,
    },
    {
      t: "h2",
      id: "faq",
      text: "Frequently asked questions",
    },
    {
      t: "h3",
      id: "faq-what-is-piti",
      text: "What does PITI stand for in a monthly payment estimate?",
    },
    {
      t: "p",
      text: "PITI is Principal, Interest, Taxes, and Insurance — the four core pieces of a typical monthly housing payment. Some calculators add PMI, HOA dues, or flood insurance as separate lines.",
    },
    {
      t: "h3",
      id: "faq-down-payment",
      text: "How does down payment affect the monthly payment?",
    },
    {
      t: "p",
      text: "A larger down payment reduces the loan principal, which lowers P&I. It may also eliminate PMI on conventional loans when you reach 20% equity at closing, further shrinking the monthly bill.",
    },
    {
      t: "h3",
      id: "faq-include-taxes",
      text: "Should I include property taxes in the calculator?",
    },
    {
      t: "p",
      text: "Yes. Lenders escrow most tax bills, so your monthly draft includes a tax slice even though the county invoice arrives once or twice a year. Excluding taxes makes any online estimate unrealistically low.",
    },
    {
      t: "h3",
      id: "faq-fixed-vs-arm",
      text: "Can I use the same calculator for adjustable-rate mortgages?",
    },
    {
      t: "p",
      text: "You can model the initial fixed period, but ARMs reset after that window. Re-run your numbers with the new rate at each adjustment, and stress-test higher rates before you commit.",
    },
    {
      t: "h3",
      id: "faq-extra-payments",
      text: "Do extra principal payments change the schedule?",
    },
    {
      t: "p",
      text: "Yes. Additional principal reduces future interest and can shorten the term. Advanced calculator modes let you add one-time or recurring extra payments to see interest saved.",
    },
    {
      t: "h3",
      id: "faq-affordability",
      text: "What monthly payment is considered affordable?",
    },
    {
      t: "p",
      text: "Rules vary, but many lenders look for PITI under roughly 28% of gross income and total debts under 36%. Model conservative inputs, then compare the result with your actual budget and emergency fund goals.",
    },
    {
      t: "callout",
      variant: "disclaimer",
      title: "Disclaimer",
      text: "This article is educational, not lending advice. Rates, taxes, insurance, and underwriting standards change. Confirm figures with licensed professionals before making financial commitments.",
    },
  ],
  sources: [
    {
      title: "Consumer Financial Protection Bureau — Owning a Home",
      url: "https://www.consumerfinance.gov/owning-a-home/",
    },
    {
      title: "CFPB — How to decide how much to spend on a home",
      url: "https://www.consumerfinance.gov/ask-cfpb/how-to-decide-how-much-to-spend-on-a-home-en-1869/",
    },
  ],
  calcLink: "mortgage",
};
