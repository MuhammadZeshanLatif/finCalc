type VMsg = Record<string, string>;

type State = {
  principal: number;
  rate: number;
  time: number;
  initialDeposit: number;
  monthlyCont: number;
  depTerm: number;
  depTermUnit: "years" | "months";
  loanAmount: number;
  loanTerm: number;
  homeValue: number;
  downpayment: number;
  startDate: string;
  endDate: string;
  vatAmount: number;
  vatRate: number;
  emiPrincipal: number;
  emiRate: number;
  emiTenure: number;
  bmiWeight: number;
  bmiHeight: number;
  grossIncome: number;
  currAmount: number;
};

const MAX_MONEY = 1e15;
const MAX_RATE = 100;
const MAX_YEARS = 100;

function okMoney(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && n <= MAX_MONEY;
}

export function getCalculatorFieldErrors(id: string, s: State, m: VMsg): Record<string, string> {
  const e: Record<string, string> = {};

  const rateOk = (n: number, key: string) => {
    if (!Number.isFinite(n) || n < 0 || n > MAX_RATE) e[key] = m.rateRange;
  };
  const moneyOk = (n: number, key: string) => {
    if (!okMoney(n)) e[key] = m.moneyRange;
  };

  switch (id) {
    case "interest":
      moneyOk(s.principal, "principal");
      rateOk(s.rate, "rate");
      if (!Number.isFinite(s.time) || s.time < 0 || s.time > MAX_YEARS) e.time = m.yearsRange;
      break;
    case "deposit":
      moneyOk(s.initialDeposit, "initialDeposit");
      moneyOk(s.monthlyCont, "monthlyCont");
      rateOk(s.rate, "rate");
      if (!Number.isFinite(s.depTerm) || s.depTerm < 0) e.depTerm = m.termRange;
      else if (s.depTermUnit === "years" && s.depTerm > MAX_YEARS) e.depTerm = m.yearsRange;
      else if (s.depTermUnit === "months" && s.depTerm > 1200) e.depTerm = m.monthsRange;
      break;
    case "loan":
      moneyOk(s.loanAmount, "loanAmount");
      rateOk(s.rate, "rate");
      if (!Number.isFinite(s.loanTerm) || s.loanTerm <= 0 || s.loanTerm > MAX_YEARS) e.loanTerm = m.yearsRange;
      break;
    case "mortgage":
      moneyOk(s.homeValue, "homeValue");
      if (!Number.isFinite(s.downpayment) || s.downpayment < 0 || s.downpayment > 100) e.downpayment = m.downpaymentRange;
      rateOk(s.rate, "rate");
      if (!Number.isFinite(s.loanTerm) || s.loanTerm <= 0 || s.loanTerm > MAX_YEARS) e.loanTerm = m.yearsRange;
      break;
    case "days":
      if (!s.startDate) e.startDate = m.dateRequired;
      if (!s.endDate) e.endDate = m.dateRequired;
      if (s.startDate && s.endDate && new Date(s.endDate) < new Date(s.startDate)) e.endDate = m.datesOrder;
      break;
    case "vat":
      moneyOk(s.vatAmount, "vatAmount");
      if (!Number.isFinite(s.vatRate) || s.vatRate < 0 || s.vatRate > MAX_RATE) e.vatRate = m.rateRange;
      break;
    case "emi":
      moneyOk(s.emiPrincipal, "emiPrincipal");
      rateOk(s.emiRate, "emiRate");
      if (!Number.isFinite(s.emiTenure) || s.emiTenure < 1 || s.emiTenure > 600) e.emiTenure = m.monthsRange;
      break;
    case "bmi":
      if (!Number.isFinite(s.bmiWeight) || s.bmiWeight < 20 || s.bmiWeight > 500) e.bmiWeight = m.bmiWeight;
      if (!Number.isFinite(s.bmiHeight) || s.bmiHeight < 50 || s.bmiHeight > 300) e.bmiHeight = m.bmiHeight;
      break;
    case "tax":
      moneyOk(s.grossIncome, "grossIncome");
      break;
    case "currency":
      moneyOk(s.currAmount, "currAmount");
      break;
    default:
      break;
  }

  return e;
}
