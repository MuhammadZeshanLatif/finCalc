/**
 * Long-form visible copy per calculator to avoid thin pages. Unique per tool; not keyword stuffing.
 */
import type { AppLang } from "../utils/routes";

const EN: Record<string, string[]> = {
  interest: [
    "Compound interest is the mechanism by which money grows on both your original principal and the interest that has already been credited. The more often interest is compounded within a year—monthly versus annually, for example—the faster the balance increases, all else equal. Our calculator applies standard periodic compounding formulas so you can compare scenarios side by side before you commit to a real product.",
    "When you plan with this tool, treat the annual rate as the nominal rate quoted by a bank or bond, and align the compounding dropdown with how the product actually credits interest. Real institutions may use different day-count conventions (365 vs 360), fees, tiered rates, or taxes that are not modeled here. The output is best understood as a clean mathematical baseline, not a binding quote.",
    "Investors often use a compound-interest view to internalize how starting early beats chasing slightly higher rates later. Savers may check how a recurring deposit changes the curve. Whatever your goal, write down the assumptions you used (principal, rate, years, frequency) so you can revisit them when market conditions or your budget changes.",
  ],
  deposit: [
    "This savings projection combines an opening balance with optional equal monthly contributions and a constant annual rate over the term you specify. It is suited to modeling disciplined saving toward a down payment, emergency fund, or medium-term objective where you want a smooth curve rather than volatile market returns.",
    "Banks advertise annual percentage yields that may already reflect compounding frequency; here you choose term units (years or months) and the tool builds a schedule-style view where available. Taxes on interest, account fees, promotional rate expirations, and withdrawal penalties are not included unless you mentally adjust for them. If your institution compounds daily but quotes an APY, your real path may sit close to—but not exactly on—the line shown.",
    "Use the results to stress-test commitment: try a lower rate to see downside, or a shorter term to see how much you must contribute to hit a target. Pair numbers with a separate inflation check if the goal is far in the future, because purchasing power is a different question from nominal balance.",
  ],
  loan: [
    "An amortizing loan splits each payment into interest on the remaining balance and principal that reduces what you owe. Over time, the interest portion shrinks and the principal portion grows—a pattern this calculator illustrates when schedules are available. The classic use case is comparing offers on personal or auto loans where the headline rate and term drive affordability.",
    "Lenders may add origination fees, insurance bundles, or variable rates that change your true cost of borrowing. This interface assumes a stable annual rate and regular payments without prepayment for simplicity. If you plan extra principal payments, your actual payoff date and total interest will be lower than shown; use the table as a starting conversation with the lender’s official disclosure.",
    "Keeping total debt service within common budgeting guidelines (often discussed as a percentage of gross income) is a personal choice, not a rule enforced here. The value of the tool is transparency: you see how much of each currency unit goes to interest versus principal over the life of the loan.",
  ],
  mortgage: [
    "A mortgage blends the same amortization logic as smaller loans with larger principals and longer horizons. Down payment percentage immediately changes the borrowed amount and, indirectly, whether ancillary costs like mortgage insurance might apply in real life. Our optional PMI-style toggle is a simplified hint only; actual insurance rules depend on jurisdiction, lender, and loan program.",
    "Property taxes, homeowners insurance, and escrow handling vary enormously by location. Unless explicitly separated in your workflow, treat the monthly payment shown as principal-and-interest focused. Closing costs, points, and adjustable-rate features are also outside the default model. Always validate against a Loan Estimate or equivalent document before signing.",
    "Long-term homeowners may use the calculator to see how a few basis points on the rate or a slightly larger down payment shifts lifetime interest. That sensitivity analysis helps you negotiate or choose between products without relying on a single quoted payment.",
  ],
  days: [
    "Counting days between calendar dates is foundational for contracts, rental prorations, project timelines, and interest accrual windows. This tool focuses on whole calendar dates; it does not shift for business-day calendars, holidays, or time zones unless you interpret the output that way yourself.",
    "When legal language says “inclusive” or “exclusive” of endpoints, the counted days can differ by one. Check the on-screen labels and your jurisdiction’s norms. For payroll or bond accrual, professionals often follow industry-specific conventions this general-purpose calculator does not enforce.",
    "The weeks and months equivalents are intuitive approximations for communication, not precise astronomical intervals. Use exact day counts when stakes are high, and document the start and end dates you entered.",
  ],
  vat: [
    "Value-added tax appears in invoices either baked into the price (inclusive) or added at checkout (exclusive). Choosing the wrong mode is one of the most common data-entry mistakes; match the mode to how your supplier or customer quotes amounts. The math here is straight percentage arithmetic on your inputs.",
    "Rates and exemptions differ by country, product category, and whether the buyer is a business reclaiming input VAT. Cross-border sales add complexity. This calculator does not file returns, validate invoices, or choose the correct legal rate—you must supply the percentage that applies to your situation.",
    "Operators use quick VAT splits to sanity-check receipts, proposals, and expense reports. If a figure feels off, re-check inclusive vs exclusive, rounding rules (line vs invoice), and whether discounts were applied before or after tax in the source document.",
  ],
  emi: [
    "Equated monthly installment plans express borrowing as a fixed payment each period, which is how many consumer and education loans are marketed. Behind the constant EMI, the internal split between interest and principal still moves exactly like standard amortization. Reviewing the table helps you see how much early payments service interest.",
    "Floating-rate loans, step-up schedules, moratoriums, and balloon payments require different mathematics. This model assumes a fixed annual rate translated into the schedule the app uses, with equal installments through the tenure you enter. Banks may round per period or adjust the last payment by a few units of currency.",
    "Use EMI outputs to budget cash flow, not to replace the formal repayment schedule from your lender. If you prepay, EMI might stay constant while tenure shortens, or the bank might recalculate—policies vary.",
  ],
  bmi: [
    "Body Mass Index is weight in kilograms divided by height in meters squared. It correlates with population-level health risk categories but does not measure body fat percentage, bone density, or muscle mass. Athletes with high lean mass may land in a high category without the same metabolic risks as sedentary individuals at the same index.",
    "FinanceCalculator uses metric inputs only (kilograms and centimeters) to avoid silent unit errors. If you only know imperial measurements, convert carefully before typing. The category bands shown follow common WHO-style breakpoints used for screening, not diagnosis.",
    "Never use BMI alone to change medication, diet, or exercise plans. Pair screening tools with clinical advice, waist circumference, blood pressure, glucose, lipids, and personal history when evaluating health.",
  ],
  tax: [
    "Progressive taxation means higher slices of income can face higher marginal rates while lower slices still enjoy lower brackets. Our built-in estimator applies a simplified bracket stack to gross income for illustration. It does not know your filing status, dependents, deductions, credits, local taxes, or payroll items like retirement deferrals.",
    "Real tax systems may tax ordinary income, dividends, and capital gains differently. Self-employment adds layers. Treat the output as an educational visualization: it shows how bracket mechanics feel, not what you owe a revenue authority.",
    "If you compare countries or years, remember that bracket widths and rates change with legislation. Update your mental model when laws change; static demo parameters in any web tool can go stale.",
  ],
  currency: [
    "Currency conversion multiplies your amount by the ratio between two units. By default FinanceCalculator loads live reference rates in the browser: free ECB-based data via Frankfurter (no key), or—if you set VITE_EXCHANGE_RATE_API_KEY—broader coverage via ExchangeRate-API. These are still not your bank’s bid/ask, card FX markup, or wire desk quotes. For travel, trading, or invoicing, confirm with your institution.",
    "Retail conversions embed spreads and fees that widen the gap from the theoretical number. When reconciling accounts, always trace back to the statement line, not to a demo calculator.",
    "If you test scenarios (for example USD to EUR to RUB), you are exploring arithmetic relationships, not executing a chain hedge. Multi-leg conversions in the real world may not be transitive at identical rates because each leg is priced separately.",
  ],
  ti84: [
    "This page is a TI-84 Plus CE–style graphing workspace: home-screen math, a Y= editor for up to six functions, a WINDOW screen for xMin, xMax, yMin, yMax, and scales, plus GRAPH to plot on a grid. It is built for homework and review when you do not have the physical device—keyboard shortcuts mirror common classroom workflows (type x for the graphing variable, p for π, s/c/t for trig).",
    "Expressions use math.js for evaluation, with radian mode on the status bar like many calculus courses. Inverse sine, cosine, and tangent are available via 2nd + sin/cos/tan. For degree problems, convert inside the argument (for example multiply degrees by pi/180) so the value matches what your teacher expects.",
    "The emulator is not a byte-perfect clone: TI-BASIC programs, statistics apps, data lists, and some menus are not implemented. Zoom/Trace/Calc on the top row are placeholders today—use WINDOW to frame the graph and edit Y= to change functions. If a graph is blank, widen yMax or shift xMin/xMax; that is the same troubleshooting flow as on hardware.",
    "SAT, ACT, AP, and other tests require an approved handheld calculator on exam day; this tool is for practice only. FinanceCalculator is not affiliated with Texas Instruments. For official menus and every feature, use Texas Instruments’ guide PDF; for rules, read the current calculator policy from the testing organization.",
  ],
  basic: [
    "This scientific calculator is designed for expressive formulas: nested parentheses, transcendental functions, factorial on integers, and memory keys for repeated sub-expressions. Results round for display to fifteen decimal places to reduce runaway floating noise in long chains, though underlying IEEE binary floats still apply beneath the hood.",
    "The percent key behavior follows the documented rules: between two numbers it acts as remainder (modulo), while pct(x) turns a literal percentage into a decimal factor. Trigonometric functions expect degrees, not radians, which matches many classroom settings but differs from some engineering tools—always confirm the angular mode when mixing sources.",
    "History and memory live in your browser session for convenience. They are not a substitute for version-controlled worksheets or audited computation logs when correctness must be provable. For financial or safety-critical figures, cross-check with an independent method.",
  ],
  about: [
    "FinanceCalculator is a free, browser-based collection of financial and everyday calculators—compound interest, savings, loans, mortgages, EMI, VAT, tax estimates, currency conversion, BMI, and a full scientific keypad. The site is built for quick what-if checks and learning, with clear labels so you can see which assumptions drive each result.",
    "We publish short articles on the blog that tie real scenarios to the tools: when a metric matters, how to read an amortization table, and what typical calculators leave out (fees, taxes, floating rates, jurisdiction-specific rules). Nothing here replaces licensed tax, legal, or investment advice; use professionals when decisions have material consequences.",
    "FinanceCalculator runs in English and Russian with matching URLs so you can share links in either language. If you spot a bug, have a feature idea, or want to report unclear copy, use the contact page—we read feedback even when we cannot answer individualized planning questions by email.",
  ],
  salestax: [
    "Sales tax is a consumption tax levied by a government on the sale of goods and services. Unlike VAT—which is collected at each stage of production—sales tax is typically applied only at the final point of sale to the end consumer. Rates vary widely: in the United States, for example, combined state and local rates range from 0% in states with no sales tax to over 10% in some jurisdictions.",
    "The key distinction in any sales tax calculation is whether the quoted price already includes tax (inclusive) or whether tax will be added on top (exclusive). Retailers often display exclusive prices so the sticker price looks lower, while some markets quote inclusive prices for transparency. This calculator handles both modes: enter the price, pick the mode, enter the rate, and the math is done instantly.",
    "For sellers, correctly computing sales tax prevents under-collection (which creates a liability with the tax authority) and over-collection (which creates customer trust issues). For buyers, knowing the after-tax price before reaching the register helps with budgeting—especially for large purchases or business expense tracking. This tool is for arithmetic only; tax authority rules, exemptions, and filing requirements vary by location and must be confirmed independently.",
  ],
};

export function getRichParagraphs(_lang: AppLang, calculatorId: string): string[] {
  return EN[calculatorId] ?? [];
}
