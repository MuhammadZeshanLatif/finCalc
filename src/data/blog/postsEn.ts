import type { BlogArticle } from "./types";

/** English articles — editorial tone: specific, cited, no filler. */
export const BLOG_POSTS_EN: BlogArticle[] = [
  {
    topicKey: "compound-interest",
    slug: "compound-interest-guide",
    title: "Compound interest: how timing and frequency change real returns",
    metaTitle: "Compound interest explained: formula, frequency & early saving | FinCalc",
    metaDescription:
      "How compound interest builds wealth, why APY matters, and how to sanity-check projections before you invest. With sources from the SEC and practical examples.",
    keywords:
      "compound interest, APY, compounding frequency, savings growth, investment calculator, SEC investor bulletin",
    excerpt:
      "Small differences in when you start and how often interest compounds can outweigh chasing an extra fraction of a percent on the rate.",
    datePublished: "2026-01-15",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 9,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Compound_interest.svg/960px-Compound_interest.svg.png",
      alt: "Chart comparing linear growth versus compound growth over the same time period",
      caption: "The gap between straight-line savings and compounding widens as time passes.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Compound_interest.svg",
    },
    video: {
      youtubeId: "BFN9fUGmwEY",
      title: "Khan Academy — introduction to compound interest (educational)",
    },
    keyPhrases: [
      "compound interest definition",
      "annual percentage yield APY",
      "compounding monthly vs annually",
      "starting early vs higher rate",
    ],
    blocks: [
      {
        t: "p",
        text: "Compound interest means you earn returns on both your original principal and interest that was added in earlier periods. The longer the runway, the more the curve bends upward—assuming the rate holds and you leave balances in place.",
      },
      {
        t: "h2",
        id: "what-compounding-changes",
        text: "What actually changes your outcome",
      },
      {
        t: "ul",
        items: [
          "Time in the market: more periods mean more chances for interest-on-interest.",
          "Nominal annual rate and compounding frequency (daily, monthly, annually).",
          "Contributions or withdrawals: steady deposits accelerate the curve; pulling money out flattens it.",
          "Taxes, fees, and inflation: none of these appear in a textbook graph but they decide your spendable result.",
        ],
      },
      {
        t: "h2",
        id: "apy-vs-quoted-rate",
        text: "APY vs. a quoted annual rate",
      },
      {
        t: "p",
        text: "Banks often advertise annual percentage yield (APY) on savings products because it reflects what you would earn if interest stayed in the account for a year, including the effect of intra-year compounding. A nominal “annual rate” with monthly compounding can produce a slightly higher APY than the same nominal rate compounded once per year.",
      },
      {
        t: "table",
        caption: "Illustrative: same nominal 5% annual rate, different compounding (not a product offer)",
        head: ["Compounding", "End balance on $10,000 after 1 year (illustrative)"],
        rows: [
          ["Once per year", "$10,500.00"],
          ["Monthly", "$10,511.62"],
          ["Daily", "$10,512.67"],
        ],
      },
      {
        t: "callout",
        variant: "disclaimer",
        title: "Not investment advice",
        text: "Numbers here are simplified teaching examples. Real accounts have tiered rates, minimum balances, taxes, and changing market conditions. Confirm any decision with disclosures from your institution or a licensed adviser.",
      },
      {
        t: "h2",
        id: "early-start-vs-higher-rate",
        text: "Starting earlier often beats chasing a slightly higher rate",
      },
      {
        t: "p",
        text: "If two people save the same monthly amount but one starts ten years sooner, the early starter typically ends with a larger balance even when the late starter uses a marginally higher rate. The FinCalc interest calculator is useful for printing two scenarios side by side with the same compounding assumptions so you can see where your plan is sensitive.",
      },
      {
        t: "h2",
        id: "sources-and-tools",
        text: "Authoritative reading and next step",
      },
      {
        t: "p",
        text: "Use the interest calculator on this site to plug in principal, rate, time, and compounding frequency you see in a prospectus or savings disclosure. Compare the output to what the institution states; if they diverge, ask which day-count or fee assumptions differ.",
      },
    ],
    sources: [
      {
        title: "U.S. SEC — interest, compound interest, and APY overview",
        url: "https://www.investor.gov/additional-resources/information/your-money/investing-basics",
      },
      {
        title: "CFPB — what is APY?",
        url: "https://www.consumerfinance.gov/ask-cfpb/what-is-apy-en-106/",
      },
    ],
    calcLink: "interest",
  },
  {
    topicKey: "mortgage-mistakes",
    slug: "mortgage-mistakes-down-payment-piti",
    title: "Mortgage mistakes that survive closing: PITI, PMI, and the payment you feel",
    metaTitle: "Common mortgage mistakes: PITI, PMI & payment shock | FinCalc Blog",
    metaDescription:
      "Before you sign, separate the lender’s principal-and-interest quote from taxes, insurance, and possible PMI. How to model it with a mortgage calculator.",
    keywords:
      "mortgage payment, PITI, PMI, down payment, mortgage calculator, home loan affordability",
    excerpt:
      "The number on the marketing flyer is rarely the full monthly housing cash outflow.",
    datePublished: "2026-02-01",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 8,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Subprime_Mortgage_Market_Diagram.png/640px-Subprime_Mortgage_Market_Diagram.png",
      alt: "Diagram of mortgage market participants and cash flows",
      caption: "Mortgage products connect borrowers, servicers, and investors; your statement reflects only your piece of that chain.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Subprime_Mortgage_Market_Diagram.png",
    },
    video: { youtubeId: "zQVUk1oTNdk", title: "Choosing a mortgage — educational overview (YouTube)" },
    keyPhrases: ["PITI meaning", "PMI when down payment under 20%", "fixed vs adjustable considerations", "total housing cost"],
    blocks: [
      {
        t: "p",
        text: "A mortgage approval focuses on debt ratios and credit, but your household budget cares about cash leaving the checking account every month. Confusing the two is how buyers end up “approved yet stressed.”",
      },
      {
        t: "h2",
        id: "piti-breakdown",
        text: "What PITI includes",
      },
      {
        t: "ul",
        items: [
          "Principal: the part of the payment that reduces the loan balance.",
          "Interest: the cost of borrowing the remaining balance.",
          "Taxes: often escrowed property taxes unless you waive escrow (where allowed).",
          "Insurance: homeowner’s hazard insurance; flood or wind coverage may be extra depending on location.",
        ],
      },
      {
        t: "h2",
        id: "pmi-and-down-payment",
        text: "PMI and small down payments",
      },
      {
        t: "p",
        text: "When equity at closing is below conventional thresholds, lenders often require private mortgage insurance until loan-to-value improves. Our mortgage calculator includes a simplified PMI toggle so you can stress-test what happens to the monthly line item if home value or down payment assumptions move.",
      },
      {
        t: "h2",
        id: "rate-quotes",
        text: "Reading a rate quote",
      },
      {
        t: "p",
        text: "APR attempts to bundle some lender fees into the rate for comparison, but it still will not capture every future tax reassessment or insurance renewal. Build a table: lender quote, your modeled PITI, plus maintenance and utilities you already pay elsewhere.",
      },
      {
        t: "callout",
        variant: "note",
        title: "Practical check",
        text: "If the proposed payment is more than about 28–36% of gross income (rules of thumb vary by lender and market), pause and model a smaller loan amount before you waive contingencies.",
      },
    ],
    sources: [
      { title: "CFPB — compare loan estimates", url: "https://www.consumerfinance.gov/owning-a-home/compare/" },
      { title: "HUD — homeownership resources", url: "https://www.hud.gov/buying" },
    ],
    calcLink: "mortgage",
  },
  {
    topicKey: "emi-strategy",
    slug: "emi-prepayment-strategy",
    title: "EMI loans: where prepayments actually cut interest",
    metaTitle: "EMI prepayment strategy: cut tenure or payment? | FinCalc",
    metaDescription:
      "How equated monthly installments split interest and principal, and why extra payments toward principal change the total interest more than rounding up EMI alone.",
    keywords: "EMI calculator, loan prepayment, amortization, principal payment, reducing balance loan",
    excerpt: "Extra money sent to principal attacks the balance that tomorrow’s interest is calculated on.",
    datePublished: "2026-02-12",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 7,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Money_in_a_jar.jpg/640px-Money_in_a_jar.jpg",
      alt: "Coins and banknotes stored in a glass jar",
      caption: "Prepaying principal is a deliberate choice; document it with your lender’s rules.",
      credit: "Wikimedia Commons — Money in a jar",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Money_in_a_jar.jpg",
    },
    keyPhrases: ["EMI formula intuition", "amortization schedule", "principal vs interest share", "prepayment penalties"],
    blocks: [
      {
        t: "p",
        text: "An EMI keeps the installment constant while the internal split between interest and principal shifts every month. Early in the loan, interest dominates; later, principal dominates. That is normal amortizing math, not a bank trick.",
      },
      {
        t: "h2",
        id: "why-prepay-principal",
        text: "Why principal prepayment works",
      },
      {
        t: "p",
        text: "Interest accrues on the remaining balance. Any payment labeled as principal reduction lowers that balance immediately, so the next period’s interest accrues on a smaller number. Use the EMI calculator here to add an extra principal line and compare total interest paid against the baseline schedule.",
      },
      {
        t: "h2",
        id: "watch-for-restrictions",
        text: "Watch for lender rules",
      },
      {
        t: "ul",
        items: [
          "Some loans charge prepayment fees or apply partial payments to future EMIs unless you specify principal.",
          "Re-amortization policies differ: your EMI might stay flat while tenure shortens, or the bank might recalculate EMI.",
        ],
      },
    ],
    sources: [
      { title: "RBI — fair practices / loan servicing (India context)", url: "https://www.rbi.org.in/" },
    ],
    calcLink: "emi",
  },
  {
    topicKey: "emergency-fund",
    slug: "emergency-fund-high-yield-savings",
    title: "Emergency funds: liquidity first, yield second",
    metaTitle: "Emergency fund size, liquidity & deposit growth | FinCalc Blog",
    metaDescription:
      "How many months of expenses to hold, where people keep cash, and how to model growth with a deposit calculator without pretending volatility is gone.",
    keywords: "emergency fund, high yield savings, deposit calculator, liquidity, rainy day fund",
    excerpt: "The job of emergency cash is to be there when income stops—not to beat the stock market.",
    datePublished: "2026-02-20",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 6,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Piggy_bank_DSC08605.jpg/640px-Piggy_bank_DSC08605.jpg",
      alt: "Ceramic piggy bank on a table",
      caption: "Psychological barriers to spending matter as much as yield for emergency cash.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Piggy_bank_DSC08605.jpg",
    },
    keyPhrases: ["three to six months rule", "joint account access", "FDIC insurance limits", "inflation vs cash"],
    blocks: [
      {
        t: "p",
        text: "Guidelines like three to six months of essential expenses are starting points. Self-employed households, single-income families, or anyone with high fixed costs may rationally hold more. The deposit calculator helps translate “I can save $X per month at Y%” into a future balance under steady assumptions.",
      },
      {
        t: "h2",
        id: "where-to-hold",
        text: "Where people hold emergency money",
      },
      {
        t: "ul",
        items: [
          "Insured bank or credit union savings (check coverage limits in your jurisdiction).",
          "Money market funds or cash management accounts—read prospectuses for stability mechanisms.",
          "Short-term treasuries—more steps to sell in a crisis, not always ideal for same-day bills.",
        ],
      },
      {
        t: "callout",
        variant: "disclaimer",
        text: "FinCalc deposit projections assume constant rates; promotional teaser rates and tiered balances are common in real banks.",
      },
    ],
    sources: [
      { title: "CFPB — building an emergency fund", url: "https://www.consumerfinance.gov/start-small-save-up/" },
    ],
    calcLink: "deposit",
  },
  {
    topicKey: "tax-brackets",
    slug: "progressive-tax-brackets-net-income",
    title: "Progressive tax brackets: why a raise does not tax your whole paycheck",
    metaTitle: "How tax brackets work: marginal vs average rate | FinCalc",
    metaDescription:
      "Marginal bands, effective rates, and how our simplified tax estimator visualizes bracket stacking—without replacing a CPA.",
    keywords: "tax brackets, marginal tax rate, effective tax rate, income tax estimator, progressive tax",
    excerpt: "Only the dollars inside a band are taxed at that band’s rate in a classic stair-step model.",
    datePublished: "2026-02-25",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 7,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/US_Federal_Leviathan_2016.png/640px-US_Federal_Leviathan_2016.png",
      alt: "Infographic-style chart of U.S. federal spending categories",
      caption: "Tax policy is political; your paycheck math is arithmetic—keep the two separate when planning.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:US_Federal_Leviathan_2016.png",
    },
    keyPhrases: ["marginal rate definition", "effective rate", "deductions vs credits", "FinCalc demo brackets"],
    blocks: [
      {
        t: "p",
        text: "A progressive system applies higher rates only to income above each threshold. Moving into a higher bracket raises tax on the dollars in that bracket—not retroactively on every dollar you earned below it.",
      },
      {
        t: "h2",
        id: "marginal-vs-effective",
        text: "Marginal vs. effective rate",
      },
      {
        t: "p",
        text: "Your marginal rate is the rate on the next dollar of ordinary income. Your effective (average) rate is total tax divided by total income. FinCalc’s tax tool uses a simplified stairstep so you can feel the difference; it does not know your filing status, credits, or local taxes.",
      },
      {
        t: "table",
        caption: "Toy example: brackets are illustrative, not real law",
        head: ["Taxable slice", "Rate (demo)", "Tax on slice"],
        rows: [
          ["$0 – $10,000", "10%", "$1,000"],
          ["Next $30,000", "15%", "$4,500"],
        ],
      },
    ],
    sources: [
      { title: "IRS — tax basics (U.S.)", url: "https://www.irs.gov/filing" },
    ],
    calcLink: "tax",
  },
  {
    topicKey: "currency-travel",
    slug: "currency-exchange-travel-budget",
    title: "Travel FX: bank spreads, not mid-market memes",
    metaTitle: "Currency exchange for travel: spreads, timing & tools | FinCalc",
    metaDescription:
      "Why airport kiosks cost more, how mid-market rates differ from what you pay, and how to use a live converter before you trip-plan.",
    keywords: "currency exchange, travel money, FX spread, mid-market rate, currency converter",
    excerpt: "The rate on Google is not the rate at the departures hall ATM.",
    datePublished: "2026-03-01",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 7,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Euro_coins_and_banknotes.jpg/640px-Euro_coins_and_banknotes.jpg",
      alt: "Euro banknotes and coins arranged on a surface",
      caption: "Physical cash is only one piece of cross-border spending; cards embed their own conversion layers.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Euro_coins_and_banknotes.jpg",
    },
    keyPhrases: ["mid-market vs retail FX", "DCC dynamic currency conversion", "ATM foreign fees", "live ECB reference rates"],
    blocks: [
      {
        t: "p",
        text: "Retail currency purchases include spread, sometimes commission, and often poor airport economics. A mid-market reference—such as ECB data surfaced through public APIs—helps you see the gap between the interbank story and the price you pay.",
      },
      {
        t: "h2",
        id: "live-widget-below",
        text: "Check live reference crosses while you read",
      },
      {
        t: "p",
        text: "This article’s layout includes a live snippet (USD/EUR/GBP) pulled from the same Frankfurter source as our converter. It updates when you load or refresh; your bank still sets the tradable price.",
      },
      {
        t: "h2",
        id: "card-payments",
        text: "Card payments abroad",
      },
      {
        t: "p",
        text: "Dynamic currency conversion (paying in home currency at a foreign terminal) is convenient but often expensive. Compare the terminal’s implied rate to what your issuer would charge in local currency.",
      },
    ],
    sources: [
      { title: "ECB — euro foreign exchange reference rates", url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/" },
      { title: "Frankfurter API (open data)", url: "https://www.frankfurter.app/" },
    ],
    calcLink: "currency",
    hasLiveRates: true,
  },
  {
    topicKey: "bmi-insurance",
    slug: "bmi-insurance-premiums-health-costs",
    title: "BMI screening and insurance pricing: what the number does and does not prove",
    metaTitle: "BMI, health screening & insurance costs | FinCalc Blog",
    metaDescription:
      "Why insurers use BMI as a coarse risk signal, what WHO-style categories mean, and limits of using any single metric for health or money decisions.",
    keywords: "BMI calculator, health insurance underwriting, obesity risk factors, WHO BMI categories",
    excerpt: "BMI is cheap to measure at scale; it is not a full clinical picture.",
    datePublished: "2026-03-05",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 6,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bathroom_scale.jpg/640px-Bathroom_scale.jpg",
      alt: "Analog bathroom scale on a tile floor",
      caption: "Weight alone ignores body composition—actuaries still use coarse filters for population risk.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Bathroom_scale.jpg",
    },
    keyPhrases: ["BMI formula metric", "underwriting wellness programs", "waist circumference", "FinCalc metric-only tool"],
    blocks: [
      {
        t: "p",
        text: "Body mass index is weight divided by height squared (kg/m²). Epidemiologists use it because it correlates with some population-level risks and is easy to collect. Clinicians supplement it with blood pressure, lipids, sleep, and family history.",
      },
      {
        t: "h2",
        id: "insurance-use",
        text: "Why insurers reference weight categories",
      },
      {
        t: "p",
        text: "Group insurers sometimes offer premium incentives tied to wellness metrics. Rules vary by country and employer. Our BMI tool is metric (kg, cm) to avoid silent imperial/metric errors; always confirm medical decisions with professionals.",
      },
      {
        t: "callout",
        variant: "disclaimer",
        text: "FinCalc does not provide medical advice. Categories shown follow common screening breakpoints, not a diagnosis.",
      },
    ],
    sources: [
      { title: "WHO — BMI classification", url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" },
    ],
    calcLink: "bmi",
  },
  {
    topicKey: "vat-invoicing",
    slug: "vat-gst-invoicing-inclusive-exclusive",
    title: "VAT on invoices: inclusive vs exclusive in the real world",
    metaTitle: "VAT inclusive vs exclusive pricing for invoices | FinCalc Blog",
    metaDescription:
      "How to split VAT from a gross price, common invoice mistakes, and when rounding breaks tie-breakers in audits.",
    keywords: "VAT calculator, inclusive exclusive VAT, small business invoicing, tax invoice",
    excerpt: "Mixing inclusive and exclusive modes is the fastest way to misstate both revenue and tax owed.",
    datePublished: "2026-03-10",
    dateModified: "2026-04-03",
    author: "FinCalc Editorial",
    readingTimeMinutes: 6,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/ReceiptSwiss.jpg/640px-ReceiptSwiss.jpg",
      alt: "Paper receipt showing line items and totals",
      caption: "Receipts should show tax base, rate, and total unambiguously—your software should match.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:ReceiptSwiss.jpg",
    },
    keyPhrases: ["VAT inclusive formula", "reverse charge", "rounding per line vs invoice", "B2B quotes"],
    blocks: [
      {
        t: "p",
        text: "Inclusive pricing embeds tax inside the sticker price consumers see. Exclusive pricing adds tax at checkout. B2B quotes often switch modes between jurisdictions; your accounting export must stay consistent.",
      },
      {
        t: "h2",
        id: "splitting-vat",
        text: "Splitting VAT from a gross amount",
      },
      {
        t: "p",
        text: "If the total includes VAT at rate r%, the net base equals total ÷ (1 + r/100). The VAT portion is total minus net. FinCalc’s VAT tool toggles modes so you can match how your invoice PDF reads.",
      },
      {
        t: "ul",
        items: [
          "Confirm whether discounts apply before or after tax in your contracts.",
          "Decide rounding rules (line-level vs invoice-level) and document them.",
          "Keep source documents for audit trails—spreadsheets alone are weak evidence.",
        ],
      },
    ],
    sources: [
      { title: "EU — VAT basics (official portal)", url: "https://taxation-customs.ec.europa.eu/vat_en" },
    ],
    calcLink: "vat",
  },
];
