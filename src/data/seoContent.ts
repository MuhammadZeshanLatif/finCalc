import type { AppLang } from "../utils/routes";

export type SeoFaq = { q: string; a: string };
export type SeoHowTo = { name: string; description: string; steps: string[] };

const FAQ_EN: Record<string, SeoFaq[]> = {
  home: [
    {
      q: "What is FinanceCalculator?",
      a: "FinanceCalculator is a free suite of online financial and utility calculators—interest, loans, mortgage, EMI, VAT, tax estimates, currency, BMI, and a scientific calculator—available in English and Russian.",
    },
    {
      q: "Is FinanceCalculator free to use?",
      a: "Yes. All calculators on FinanceCalculator are free to use in your browser. We do not charge for access to the tools.",
    },
    {
      q: "Does FinanceCalculator provide financial or tax advice?",
      a: "No. Results are for educational and planning purposes only. Always confirm figures with a qualified professional before making financial or tax decisions.",
    },
  ],
  blog: [
    {
      q: "What topics does the FinanceCalculator blog cover?",
      a: "Long-form guides on saving, debt, mortgages, tax brackets, VAT, travel FX, and health-cost context for BMI—each with a table of contents, cited sources, optional video, and links to the matching free calculator.",
    },
    {
      q: "Are blog articles personalized advice?",
      a: "No. Posts are general information. Your situation may differ; use professionals for personal advice.",
    },
  ],
  contact: [
    {
      q: "How can I contact FinanceCalculator?",
      a: "Use the contact form on this page to send a message. We read feedback about bugs, ideas, and partnerships.",
    },
    {
      q: "Will you answer tax or investment questions by email?",
      a: "We cannot provide individualized financial, tax, or legal guidance. For those topics, consult a licensed professional.",
    },
  ],
  about: [
    {
      q: "What is FinanceCalculator?",
      a: "A free suite of online calculators for interest, loans, savings, mortgage, EMI, VAT, tax estimates, currency, BMI, and scientific math, with articles and bilingual English/Russian support.",
    },
    {
      q: "Does FinanceCalculator give financial advice?",
      a: "No. Tools and blog posts are for education and planning. Confirm important decisions with qualified professionals.",
    },
    {
      q: "How do I report a bug or suggest a feature?",
      a: "Use the Contact page to send a message. We appreciate concrete steps or screenshots when reporting issues.",
    },
  ],
  privacy: [
    {
      q: "What data does FinanceCalculator collect?",
      a: "This policy describes typical website data such as logs and cookies. See the full text on this page for details.",
    },
    {
      q: "Can I use FinanceCalculator without accepting marketing cookies?",
      a: "Core calculators work in your browser; third-party ad cookies depend on your browser settings and applicable consent flows.",
    },
  ],
  terms: [
    {
      q: "What are the FinanceCalculator terms of use?",
      a: "The terms explain acceptable use of the website, disclaimers, and limitations of liability. Read the full document on this page.",
    },
    {
      q: "Are calculation results guaranteed?",
      a: "No. Calculators use standard formulas and your inputs; real fees, rates, and rules may differ. Use results at your own discretion.",
    },
  ],
  basic: [
    {
      q: "What can the scientific calculator do?",
      a: "It supports arithmetic, powers, roots, factorial, trigonometry (degrees), logarithms, parentheses, memory keys, and history—results round to 15 decimal places.",
    },
    {
      q: "How do I enter expressions?",
      a: "Type with the keypad or keyboard, then press Calculate or Enter. Use × and ÷ or * and / as shown in the functions table.",
    },
    {
      q: "Is my calculation history stored on a server?",
      a: "History is kept in your browser session for convenience; it is not sent to FinanceCalculator as part of the calculator logic.",
    },
  ],
  interest: [
    {
      q: "What is compound interest?",
      a: "Compound interest is interest calculated on the initial principal and on accumulated interest from earlier periods, based on your compounding frequency.",
    },
    {
      q: "What does compounding frequency mean?",
      a: "It is how often interest is added to the balance—e.g. monthly, quarterly, or annually. More frequent compounding generally grows the balance faster at the same nominal rate.",
    },
    {
      q: "Will my bank match this exact number?",
      a: "Not necessarily. Banks may use different day-count conventions, fees, or rounding. Use FinanceCalculator for estimates, not binding quotes.",
    },
  ],
  deposit: [
    {
      q: "What does the deposit calculator estimate?",
      a: "It projects balance over time with an initial deposit, optional monthly contributions, interest rate, and term—using the schedule shown in the app.",
    },
    {
      q: "Are taxes on interest included?",
      a: "No. The projection is before tax unless you adjust inputs yourself. Tax rules vary by country and account type.",
    },
    {
      q: "Can I change the term unit?",
      a: "Yes. Choose years or months for the savings term to match how you think about the goal.",
    },
  ],
  loan: [
    {
      q: "What does the loan calculator show?",
      a: "It estimates payments and amortization for a fixed-rate loan using principal, annual rate, and term—plus schedules where available.",
    },
    {
      q: "Does it include insurance or fees?",
      a: "Unless you model them elsewhere, standard results focus on principal and interest. Add fees manually to your planning if needed.",
    },
    {
      q: "Is this an offer of credit?",
      a: "No. FinanceCalculator is not a lender. All numbers are illustrative.",
    },
  ],
  mortgage: [
    {
      q: "How is the mortgage payment estimated?",
      a: "Using home value, down payment %, interest rate, and loan term, the tool approximates monthly payment and related outputs shown on the page.",
    },
    {
      q: "What is PMI?",
      a: "Private mortgage insurance may apply when down payment is low; the optional checkbox lets you include a simple PMI-style estimate where implemented.",
    },
    {
      q: "Should I rely on this for a home purchase?",
      a: "Use it for planning only. Lenders use their own underwriting, escrows, and exact APR components.",
    },
  ],
  days: [
    {
      q: "How does the days calculator work?",
      a: "Pick a start and end date; the tool computes the difference in days and equivalent weeks and months.",
    },
    {
      q: "Are dates inclusive?",
      a: "The app follows the logic shown in results—check the labels on the page for how endpoints are counted.",
    },
    {
      q: "Does it handle time zones?",
      a: "Dates are treated as calendar dates without time-zone shifts unless specified in the UI.",
    },
  ],
  vat: [
    {
      q: "What is inclusive vs exclusive VAT?",
      a: "Inclusive means the amount you enter already contains VAT; exclusive means VAT is added on top. Choose the mode that matches your invoice.",
    },
    {
      q: "Are VAT rules the same in every country?",
      a: "No. Rates, exemptions, and rounding differ. This tool uses your entered rate for arithmetic only.",
    },
    {
      q: "Is this official tax filing software?",
      a: "No. It is a quick calculator, not a government filing tool.",
    },
  ],
  emi: [
    {
      q: "What is EMI?",
      a: "Equated Monthly Installment—a fixed payment each month toward principal and interest for a loan with the assumptions used in the calculator.",
    },
    {
      q: "Does EMI stay constant if rates float?",
      a: "The default model assumes a fixed rate. Floating-rate loans need different modeling.",
    },
    {
      q: "Does the table match my bank’s schedule exactly?",
      a: "Minor differences can come from rounding dates and bank policies. Use the table as a guide.",
    },
  ],
  bmi: [
    {
      q: "What is BMI?",
      a: "Body Mass Index is weight in kg divided by height in meters squared—a population screening metric, not a diagnosis.",
    },
    {
      q: "Should I use BMI alone for health decisions?",
      a: "No. Muscle mass, age, and other factors matter. Talk to a healthcare provider for personal guidance.",
    },
    {
      q: "Which units does FinanceCalculator use?",
      a: "Weight in kilograms and height in centimeters, as labeled in the form.",
    },
  ],
  tax: [
    {
      q: "What does the tax calculator estimate?",
      a: "It applies the simplified progressive model built into FinanceCalculator to your entered gross income—illustrative only.",
    },
    {
      q: "Will this match my real tax return?",
      a: "Unlikely. Real taxes depend on deductions, credits, filing status, and local rules not modeled here.",
    },
    {
      q: "Is this legal or tax advice?",
      a: "No. Consult a tax professional for compliance and planning.",
    },
  ],
  currency: [
    {
      q: "Where do exchange rates come from?",
      a: "Live reference rates load in your browser from Frankfurter (ECB data, no API key) or, if configured, ExchangeRate-API. If the network fails, a small demo table covers USD, EUR, and RUB only.",
    },
    {
      q: "Can I use this for trading or remittances?",
      a: "Only as a rough check. Banks and services quote their own spreads and fees.",
    },
    {
      q: "Which currencies are supported?",
      a: "The dropdown lists currencies from the active data source—typically dozens of majors with Frankfurter, or 160+ if you add an ExchangeRate-API key.",
    },
  ],
  ti84: [
    {
      q: "Is this TI-84 calculator online free?",
      a: "Yes. FinanceCalculator does not charge for this browser graphing tool. No account is required.",
    },
    {
      q: "Can I use it on the SAT or ACT instead of a real TI-84?",
      a: "No. Proctored tests require an approved physical device. Use this page to practice the layout and graphing flow before test day.",
    },
    {
      q: "Why is my graph blank?",
      a: "Usually the WINDOW is too small. Open window (top row), increase yMax or adjust xMin/xMax, then press graph again. Make sure Y1 is not empty.",
    },
    {
      q: "Does it support TI-BASIC or statistics apps?",
      a: "Not in this version. Core scientific math, Y= graphing, and WINDOW editing are supported; advanced TI menus and programming are not.",
    },
  ],
  desmos: [
    {
      q: "What is a graphing calculator?",
      a: "A graphing calculator plots equations and data so you can see functions visually. It goes beyond basic arithmetic: algebra, trig, statistics, and often programming. This page runs a free multi-layer graphing workspace in your browser.",
    },
    {
      q: "Is this the same as Desmos?",
      a: "It is an independent in-browser tool with a similar workflow: multiple expressions, zoom, pan, trace, tables, and fullscreen. It is not affiliated with Desmos.",
    },
    {
      q: "Can I use this on the SAT, ACT, or AP exams?",
      a: "No. Proctored exams require approved physical calculators. Use this page to practice graphing concepts and tables before test day.",
    },
    {
      q: "How do I graph an equation here?",
      a: "Tap + on the left, choose Expression f(x), type your formula (for example sin(x) or x^2/4-2), and view the Graph tab. Adjust zoom with the toolbar or scroll wheel, and drag to pan.",
    },
    {
      q: "Where can I read a full guide to graphing calculators?",
      a: "Open the FinanceCalculator blog article “What Is a Graphing Calculator? A Complete Guide” for hardware vs apps, popular models, exams, and troubleshooting.",
    },
  ],
  salestax: [
    {
      q: "What is sales tax?",
      a: "Sales tax is a government-imposed percentage added to the sale price of goods and services. The seller collects it at the point of sale and remits it to the tax authority.",
    },
    {
      q: "What is the difference between inclusive and exclusive sales tax?",
      a: "Exclusive (before tax): the price shown does not include tax — tax is added on top. Inclusive (tax included): the price already contains the tax and you need to extract it. Choose the mode that matches how your price is quoted.",
    },
    {
      q: "How do I calculate sales tax on a price?",
      a: "Multiply the pre-tax price by the tax rate divided by 100. For example, a $200 item at 8% sales tax: 200 x 0.08 = $16 tax, so the total is $216.",
    },
    {
      q: "How do I extract sales tax from a total price?",
      a: "Divide the total by (1 + rate/100), then subtract from the total. For a $216 total at 8%: pre-tax = 216 / 1.08 = $200, tax = $216 - $200 = $16.",
    },
    {
      q: "Is the result from this calculator legally accurate?",
      a: "No. This tool performs arithmetic only. Actual sales tax depends on your jurisdiction, product category, exemptions, and rounding rules. Always confirm with official sources.",
    },
  ],
};

const HOWTO_EN: Record<string, SeoHowTo | undefined> = {
  interest: {
    name: "How to use the interest calculator",
    description: "Estimate compound growth with principal, rate, time, and compounding frequency.",
    steps: [
      "Enter the principal amount in dollars.",
      "Enter the annual interest rate as a percentage.",
      "Set the time in years and choose compounding (monthly, quarterly, or annual).",
      "Read total balance, interest earned, and return % in the results panel.",
    ],
  },
  deposit: {
    name: "How to use the deposit calculator",
    description: "Project savings with optional monthly contributions.",
    steps: [
      "Enter initial deposit and optional monthly contribution.",
      "Set annual rate and savings term in years or months.",
      "Pick the opening date if shown for schedule context.",
      "Review projected value and growth schedule outputs.",
    ],
  },
  loan: {
    name: "How to use the loan calculator",
    description: "Estimate payments for a fixed-rate loan.",
    steps: [
      "Enter loan amount, annual interest rate, and term in years.",
      "Set the first payment date when available.",
      "Check monthly payment and amortization schedule.",
      "Remember: exclude fees unless you add them separately in your plan.",
    ],
  },
  mortgage: {
    name: "How to use the mortgage calculator",
    description: "Approximate a home loan payment from value, down payment, rate, and term.",
    steps: [
      "Enter home value and down payment percentage.",
      "Set interest rate and loan term in years.",
      "Toggle PMI if you want a simple insurance estimate when applicable.",
      "Review payment, totals, and charts for planning only.",
    ],
  },
  days: {
    name: "How to use the days between dates calculator",
    description: "Find the number of days between two calendar dates.",
    steps: [
      "Select the start date.",
      "Select the end date on or after the start date.",
      "Read total days and equivalent weeks and months.",
    ],
  },
  vat: {
    name: "How to use the VAT calculator",
    description: "Split or add VAT using inclusive or exclusive mode.",
    steps: [
      "Enter the amount you want to analyze.",
      "Set the VAT rate percentage.",
      "Choose inclusive (VAT inside the amount) or exclusive (VAT on top).",
      "Read VAT amount and totals as labeled.",
    ],
  },
  emi: {
    name: "How to use the EMI calculator",
    description: "Compute equated monthly installment for a loan.",
    steps: [
      "Enter principal, annual rate, and tenure in months.",
      "Set first payment date if the form asks for it.",
      "Review monthly EMI, total payment, and amortization table.",
    ],
  },
  bmi: {
    name: "How to use the BMI calculator",
    description: "Calculate Body Mass Index from metric inputs.",
    steps: [
      "Enter weight in kilograms.",
      "Enter height in centimeters.",
      "Read BMI score and category for screening context only.",
    ],
  },
  tax: {
    name: "How to use the income tax estimator",
    description: "See a simplified progressive tax illustration.",
    steps: [
      "Enter annual gross income.",
      "Review estimated tax due and net income from the built-in brackets.",
      "Use a professional for real filing—this is illustrative.",
    ],
  },
  currency: {
    name: "How to use the currency converter",
    description: "Convert between supported currencies with demo rates.",
    steps: [
      "Enter the amount to convert.",
      "Choose source and target currency.",
      "Read the converted amount as an estimate, not a live trading quote.",
    ],
  },
  basic: {
    name: "How to use the scientific calculator",
    description: "Evaluate expressions with advanced math functions.",
    steps: [
      "Build an expression with the keypad or keyboard.",
      "Use the function reference for powers, roots, trig, and memory keys.",
      "Press Calculate or Enter to evaluate.",
      "Use history lines to recall past results when needed.",
    ],
  },
  ti84: {
    name: "How to use this TI-84 Plus CE online calculator",
    description: "Graph functions and adjust the viewing window like a classroom TI-84.",
    steps: [
      "On the home screen, type an expression and press Enter (or use the on-screen enter). Use keyboard shortcuts shown under the display.",
      "Tap y=, pick Y1–Y6, and type a function of x (for example x^2-4). Press Enter to move down a row.",
      "Tap window and set xMin, xMax, yMin, yMax (tap a row, type a number, Enter).",
      "Tap graph to plot. Add more functions in Y2–Y6 for comparisons.",
      "Use 2nd for inverse trig, π, roots, and other blue labels; the key lights while 2nd is active.",
      "Press on to reset the home screen stack. Remember: practice only—exams require approved hardware.",
    ],
  },
  desmos: {
    name: "How to use this online graphing calculator",
    description: "Plot multiple functions, tables, and read values from the graph.",
    steps: [
      "Tap + in the Layers header and choose Expression f(x) or Table (x, y) to add a layer.",
      "Type a formula using x (for example sin(x), x^2, or log(x)). Use the Insert keypad when a layer row is focused.",
      "Open the Graph tab. Scroll to zoom, drag to pan, and hover near a curve to trace x and y.",
      "Switch to the Table tab to sample numeric y(x) for enabled expressions.",
      "Use fullscreen if you need more space. For exam rules, rely on approved handhelds—this page is for practice.",
    ],
  },
  salestax: {
    name: "How to calculate sales tax",
    description: "Add or remove sales tax from any price using a custom rate.",
    steps: [
      "Enter the price in the Price field.",
      "Enter the sales tax rate as a percentage (e.g. 8 for 8%).",
      "Select 'Before tax' if your price does not include tax, or 'Tax included' if it already does.",
      "Press Calculate — the tax amount, pre-tax price, and total are shown instantly.",
    ],
  },
};

export function getSeoFaqs(_lang: AppLang, page: string): SeoFaq[] {
  return FAQ_EN[page] ?? [];
}

export function getSeoHowTo(_lang: AppLang, page: string): SeoHowTo | null {
  return HOWTO_EN[page] ?? null;
}
