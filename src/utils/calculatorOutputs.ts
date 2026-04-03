export function addMonths(d: Date, months: number): Date {
  const x = new Date(d.getTime());
  x.setMonth(x.getMonth() + months);
  return x;
}

export type LoanRow = {
  n: number;
  date: Date;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

export function loanAmortization(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  firstPaymentDate: Date,
  paymentAddon = 0,
): { monthly: number; totalInterest: number; totalPaid: number; endDate: Date; rows: LoanRow[] } {
  const p = Math.max(0, principal);
  const n = Math.max(0, Math.floor(termMonths));
  const r = annualRatePct / 100 / 12;
  if (p === 0 || n === 0) {
    return { monthly: 0, totalInterest: 0, totalPaid: 0, endDate: firstPaymentDate, rows: [] };
  }
  const basePmt = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const pmt = basePmt + paymentAddon;
  const rows: LoanRow[] = [];
  let bal = p;
  let totalInt = 0;
  for (let i = 1; i <= n; i++) {
    const interest = bal * r;
    let princ = pmt - interest;
    if (princ > bal) princ = bal;
    const actualPmt = interest + princ;
    bal -= princ;
    totalInt += interest;
    if (bal < 1e-6) bal = 0;
    rows.push({
      n: i,
      date: addMonths(firstPaymentDate, i - 1),
      payment: actualPmt,
      interest,
      principal: princ,
      balance: bal,
    });
  }
  const totalPaid = rows.reduce((s, x) => s + x.payment, 0);
  const endDate = rows.length ? rows[rows.length - 1]!.date : firstPaymentDate;
  return { monthly: pmt, totalInterest: totalInt, totalPaid, endDate, rows };
}

export type DepositRow = {
  n: number;
  date: Date;
  accrued: number;
  balance: number;
};

export function depositSchedule(
  initial: number,
  monthlyContrib: number,
  annualRatePct: number,
  totalMonths: number,
  opening: Date,
): { final: number; totalInterest: number; rows: DepositRow[] } {
  const m = Math.max(0, Math.floor(totalMonths));
  const rm = annualRatePct / 100 / 12;
  let bal = Math.max(0, initial);
  const rows: DepositRow[] = [];
  let totalInt = 0;
  for (let i = 1; i <= m; i++) {
    const accrued = bal * rm;
    bal += accrued + monthlyContrib;
    totalInt += accrued;
    rows.push({ n: i, date: addMonths(opening, i), accrued, balance: bal });
  }
  return { final: bal, totalInterest: totalInt, rows };
}

export type InterestPeriodRow = {
  n: number;
  balance: number;
  interest: number;
};

export function compoundByPeriod(
  principal: number,
  annualRatePct: number,
  years: number,
  periodsPerYear: number,
): { final: number; totalInterest: number; rows: InterestPeriodRow[] } {
  const p = Math.max(0, principal);
  const totalPeriods = Math.max(0, Math.floor(years * periodsPerYear));
  const r = annualRatePct / 100 / periodsPerYear;
  let bal = p;
  const rows: InterestPeriodRow[] = [];
  for (let i = 1; i <= totalPeriods; i++) {
    const int = bal * r;
    bal += int;
    rows.push({ n: i, balance: bal, interest: int });
  }
  return { final: bal, totalInterest: bal - p, rows };
}

export type TaxBracketRow = { band: string; taxable: number; ratePct: number; tax: number };

export function progressiveTaxRows(gross: number): { rows: TaxBracketRow[]; totalTax: number } {
  const g = Math.max(0, gross);
  const rows: TaxBracketRow[] = [];
  let tax = 0;
  let left = g;
  const b1 = Math.min(left, 15000);
  if (b1 > 0) {
    const t = b1 * 0.1;
    tax += t;
    rows.push({ band: "0 – 15,000 @ 10%", taxable: b1, ratePct: 10, tax: t });
    left -= b1;
  }
  const b2 = Math.min(left, 35000);
  if (b2 > 0) {
    const t = b2 * 0.15;
    tax += t;
    rows.push({ band: "15,001 – 50,000 @ 15%", taxable: b2, ratePct: 15, tax: t });
    left -= b2;
  }
  if (left > 0) {
    const t = left * 0.25;
    tax += t;
    rows.push({ band: "50,001+ @ 25%", taxable: left, ratePct: 25, tax: t });
  }
  return { rows, totalTax: tax };
}
