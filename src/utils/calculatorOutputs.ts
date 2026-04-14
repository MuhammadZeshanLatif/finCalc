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

export type LoanEarlyRow = LoanRow & {
  extraPrincipal: number;
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

export function loanWithEarlyRepayment(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  firstPaymentDate: Date,
  opts?: {
    paymentType?: "annuity" | "differentiated";
    extraMonthly?: number;
    extraStartMonth?: number;
  },
): {
  plannedMonthly: number;
  totalInterest: number;
  totalPaid: number;
  endDate: Date;
  rows: LoanEarlyRow[];
  savedInterest: number;
  savedMonths: number;
} {
  const p = Math.max(0, principal);
  const n = Math.max(0, Math.floor(termMonths));
  const r = annualRatePct / 100 / 12;
  const paymentType = opts?.paymentType ?? "annuity";
  const extraMonthly = Math.max(0, opts?.extraMonthly ?? 0);
  const extraStartMonth = Math.max(1, Math.floor(opts?.extraStartMonth ?? 1));

  const annuityBase =
    r === 0 || n === 0 ? (n === 0 ? 0 : p / n) : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const diffPrincipalBase = n === 0 ? 0 : p / n;

  const simulate = (extra: number): { rows: LoanEarlyRow[]; totalInterest: number; totalPaid: number } => {
    if (p === 0 || n === 0) return { rows: [], totalInterest: 0, totalPaid: 0 };
    const rows: LoanEarlyRow[] = [];
    let bal = p;
    let totalInterest = 0;
    let i = 1;
    const hardLimit = Math.max(2, n) + 2400;

    while (bal > 1e-6 && i <= hardLimit) {
      const interest = bal * r;
      const regularPrincipalTarget =
        paymentType === "annuity"
          ? Math.max(0, annuityBase - interest)
          : diffPrincipalBase;
      const regularPrincipal = Math.min(bal, regularPrincipalTarget);
      const extraPrincipal = i >= extraStartMonth ? extra : 0;
      const principalPaid = Math.min(bal, regularPrincipal + extraPrincipal);
      const extraApplied = Math.max(0, principalPaid - regularPrincipal);
      const payment = interest + principalPaid;
      bal -= principalPaid;
      totalInterest += interest;
      if (bal < 1e-6) bal = 0;
      rows.push({
        n: i,
        date: addMonths(firstPaymentDate, i - 1),
        payment,
        interest,
        principal: principalPaid,
        extraPrincipal: extraApplied,
        balance: bal,
      });
      i += 1;
    }

    const totalPaid = rows.reduce((sum, row) => sum + row.payment, 0);
    return { rows, totalInterest, totalPaid };
  };

  const baseline = simulate(0);
  const withExtra = simulate(extraMonthly);
  const endDate = withExtra.rows.length ? withExtra.rows[withExtra.rows.length - 1]!.date : firstPaymentDate;
  const plannedMonthly =
    paymentType === "annuity"
      ? annuityBase
      : (p > 0 && n > 0 ? (p / n + p * r) : 0);

  return {
    plannedMonthly,
    totalInterest: withExtra.totalInterest,
    totalPaid: withExtra.totalPaid,
    endDate,
    rows: withExtra.rows,
    savedInterest: Math.max(0, baseline.totalInterest - withExtra.totalInterest),
    savedMonths: Math.max(0, baseline.rows.length - withExtra.rows.length),
  };
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
