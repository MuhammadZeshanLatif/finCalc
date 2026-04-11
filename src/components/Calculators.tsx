import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { translations } from "../data/translations";
import { useLiveFx } from "../hooks/useLiveFx";
import BasicCalculatorPage from "./BasicCalculatorPage";
import NumericInput from "./calc/NumericInput";
import { CalcField, MoneyInput, MoInput, PctInput, YrsInput } from "./calc/CalcFormFields";
import { CalculatorRichArticle } from "./calc/CalculatorRichArticle";
import { DonutChart, LineAreaChart, ScheduleTable, TruncatedText } from "./calc/CalcVisuals";
import {
  compoundByPeriod,
  depositSchedule,
  loanAmortization,
  progressiveTaxRows,
} from "../utils/calculatorOutputs";
import { getCalculatorFieldErrors } from "../utils/calcFieldValidation";
import { staticDemoFactor } from "../utils/exchangeRates";

function currencyOptionLabel(code: string, lang: "en" | "ru"): string {
  try {
    const loc = lang === "ru" ? "ru-RU" : "en-US";
    const dn = new Intl.DisplayNames([loc, "en"], { type: "currency", fallback: "code" });
    const name = dn.of(code);
    return name && name !== code ? `${code} — ${name}` : code;
  } catch {
    return code;
  }
}

interface Props {
  id: string;
  lang: "en" | "ru";
}

const resultLabels: Record<string, string> = {
  totalBalance: "Total Balance",
  totalInterest: "Interest Earned",
  monthly: "Monthly Payment",
  projected: "Projected Value",
  totalDays: "Total Days",
  weeks: "Equivalent Weeks",
  months: "Equivalent Months",
  calculatedVat: "VAT Amount",
  totalAmount: "Total Amount",
  monthlyEmi: "Monthly EMI",
  totalPayment: "Total Payment",
  score: "BMI Score",
  category: "BMI Category",
  calculatedTax: "Tax Due",
  netIncome: "Net Income",
  convertedAmount: "Converted Amount",
  endDate: "Payoff date",
  totalRepaid: "Total repaid",
  totalContributed: "Total deposited",
  increasePct: "Return (%)",
  closingDate: "Closing date",
  baseAmount: "Net / base amount",
  salesTaxAmount: "Tax Amount",
  totalAfterTax: "Total (after tax)",
  preTaxPrice: "Pre-tax Price",
};

const monetaryKeys = [
  "totalBalance", "totalInterest", "monthly", "projected",
  "calculatedVat", "totalAmount", "monthlyEmi", "totalPayment",
  "calculatedTax", "netIncome", "totalRepaid", "totalContributed",
  "baseAmount", "salesTaxAmount", "totalAfterTax", "preTaxPrice",
];

const pctKeys = ["increasePct"];

type ResultInsight = { icon: string; value: string; label: string };

const bmiBadgeSlug: Record<string, string> = {
  Underweight: "underweight",
  "Дефицит веса": "underweight",
  Normal: "normal",
  Норма: "normal",
  Overweight: "overweight",
  "Избыточный вес": "overweight",
  Obese: "obese",
  Ожирение: "obese",
};

const calcIcons: Record<string, string> = {
  basic: "fa-calculator",
  interest: "fa-chart-line",
  deposit: "fa-piggy-bank",
  loan: "fa-hand-holding-dollar",
  mortgage: "fa-house",
  days: "fa-calendar-days",
  vat: "fa-receipt",
  emi: "fa-credit-card",
  bmi: "fa-weight-scale",
  tax: "fa-file-invoice-dollar",
  currency: "fa-money-bill-transfer",
  salestax: "fa-tags",
};

type ScheduleBlock = {
  title: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  totalRow?: Record<string, string | number>;
};

type ChartBlock =
  | {
      kind: "donut";
      title: string;
      parts: { label: string; value: number; color: string }[];
      center: string;
      sub?: string;
    }
  | {
      kind: "line";
      title: string;
      points: { x: number; y: number }[];
      color?: string;
    };

function FinancialCalculator({ id, lang }: Props) {
  const t = translations[lang].calculators[id as keyof typeof translations.en.calculators] as Record<string, string>;
  const gl = translations[lang];
  const sl = (gl as { schedule: Record<string, string> }).schedule;
  const locale = lang === "ru" ? "ru-RU" : "en-US";
  const today = new Date().toISOString().slice(0, 10);

  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(5);
  const [compounding, setCompounding] = useState(12);

  const [initialDeposit, setInitialDeposit] = useState(5000);
  const [monthlyCont, setMonthlyCont] = useState(200);
  const [depTerm, setDepTerm] = useState(5);
  const [depTermUnit, setDepTermUnit] = useState<"years" | "months">("years");
  const [depOpenDate, setDepOpenDate] = useState(today);

  const [loanAmount, setLoanAmount] = useState(20000);
  const [loanTerm, setLoanTerm] = useState(5);
  const [loanStartDate, setLoanStartDate] = useState(today);

  const [homeValue, setHomeValue] = useState(300000);
  const [downpayment, setDownpayment] = useState(20);
  const [pmi, setPmi] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [vatAmount, setVatAmount] = useState(100);
  const [vatRate, setVatRate] = useState(20);
  const [vatType, setVatType] = useState("inclusive");

  const [emiPrincipal, setEmiPrincipal] = useState(50000);
  const [emiRate, setEmiRate] = useState(8);
  const [emiTenure, setEmiTenure] = useState(48);

  const [bmiWeight, setBmiWeight] = useState(70);
  const [bmiHeight, setBmiHeight] = useState(175);

  const [grossIncome, setGrossIncome] = useState(60000);

  const [currAmount, setCurrAmount] = useState(100);
  const [currFrom, setCurrFrom] = useState("USD");
  const [currTo, setCurrTo] = useState("EUR");
  const [resultViewCompact, setResultViewCompact] = useState(false);

  const {
    codes: fxCodes,
    rates: fxRates,
    banner: fxBanner,
    loading: fxLoading,
    refresh: fxRefresh,
  } = useLiveFx(currFrom, id === "currency");

  useEffect(() => {
    if (id !== "currency" || fxCodes.length === 0) return;
    if (!fxCodes.includes(currFrom)) {
      setCurrFrom(fxCodes.includes("USD") ? "USD" : fxCodes[0]);
    }
  }, [id, fxCodes, currFrom]);

  useEffect(() => {
    if (id !== "currency" || fxCodes.length === 0) return;
    if (!fxCodes.includes(currTo)) {
      const pick = fxCodes.find(c => c !== currFrom) ?? fxCodes[0];
      setCurrTo(pick);
    }
  }, [id, fxCodes, currTo, currFrom]);

  const validationMsgs = gl.validation;

  const fieldErrors = useMemo(
    () =>
      getCalculatorFieldErrors(id, {
        principal,
        rate,
        time,
        initialDeposit,
        monthlyCont,
        depTerm,
        depTermUnit,
        loanAmount,
        loanTerm,
        homeValue,
        downpayment,
        startDate,
        endDate,
        vatAmount,
        vatRate,
        emiPrincipal,
        emiRate,
        emiTenure,
        bmiWeight,
        bmiHeight,
        grossIncome,
        currAmount,
      }, validationMsgs),
    [
      id,
      principal,
      rate,
      time,
      initialDeposit,
      monthlyCont,
      depTerm,
      depTermUnit,
      loanAmount,
      loanTerm,
      homeValue,
      downpayment,
      startDate,
      endDate,
      vatAmount,
      vatRate,
      emiPrincipal,
      emiRate,
      emiTenure,
      bmiWeight,
      bmiHeight,
      grossIncome,
      currAmount,
      validationMsgs,
    ],
  );

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const [decimalSyntaxBad, setDecimalSyntaxBad] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDecimalSyntaxBad({});
  }, [id]);

  const setSyntaxField = useCallback((key: string, bad: boolean) => {
    setDecimalSyntaxBad(prev => {
      if (bad) {
        if (prev[key]) return prev;
        return { ...prev, [key]: true };
      }
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const hasSyntaxErrors = Object.keys(decimalSyntaxBad).length > 0;
  const hasInputErrors = hasFieldErrors || hasSyntaxErrors;

  const decErr = (key: string) =>
    decimalSyntaxBad[key] ? validationMsgs.invalidCharacters : fieldErrors[key];
  const decInv = (key: string) => !!(decimalSyntaxBad[key] || fieldErrors[key]);

  const computed = useMemo(() => {
    const schedules: ScheduleBlock[] = [];
    const charts: ChartBlock[] = [];

    const fmtMoney = (n: number) =>
      `$${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtDate = (d: Date) => d.toLocaleDateString(locale);

    const formatValue = (key: string, value: string) => {
      if (monetaryKeys.includes(key)) {
        const num = parseFloat(value);
        return `$${num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (pctKeys.includes(key)) return `${value}%`;
      if (key === "convertedAmount") {
        if (value === "—") return "—";
        const num = parseFloat(value);
        if (!Number.isFinite(num)) return "—";
        return `${num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currTo}`;
      }
      if (key === "totalDays") return `${value} ${lang === "ru" ? "дн." : "days"}`;
      if (key === "weeks") return `${value} ${lang === "ru" ? "нед." : "weeks"}`;
      if (key === "months") return `${value} ${lang === "ru" ? "мес." : "months"}`;
      return value;
    };

    if (hasInputErrors) {
      return { result: null, insights: [] as ResultInsight[], schedules, charts, formatValue };
    }

    if (id === "interest") {
      const { final, totalInterest, rows } = compoundByPeriod(principal, rate, time, compounding);
      const result = {
        totalBalance: final.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        increasePct: principal > 0 ? ((totalInterest / principal) * 100).toFixed(2) : "0",
      };
      schedules.push({
        title: sl.interestTitle,
        columns: [
          { key: "no", label: sl.colNo },
          { key: "int", label: sl.colAccrued },
          { key: "bal", label: sl.colEndBal },
        ],
        rows: rows.map(r => ({
          no: r.n,
          int: fmtMoney(r.interest),
          bal: fmtMoney(r.balance),
        })),
        totalRow: {
          no: sl.total,
          int: fmtMoney(totalInterest),
          bal: fmtMoney(final),
        },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: sl.colPrincipal, value: principal, color: "#10B981" },
          { label: sl.colInterest, value: Math.max(0, totalInterest), color: "#F59E0B" },
        ],
        center: fmtMoney(final),
        sub: sl.colEndBal,
      });
      charts.push({
        kind: "line",
        title: sl.balanceChart,
        points: rows.map(r => ({ x: r.n, y: r.balance })),
        color: "#3B72C4",
      });
      const apy =
        compounding > 0 && Number.isFinite(rate)
          ? (Math.pow(1 + rate / 100 / compounding, compounding) - 1) * 100
          : 0;
      const insights: ResultInsight[] = [
        { icon: "fa-chart-line", value: `${apy.toFixed(2)}%`, label: gl.insightApy },
      ];
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "deposit") {
      const totalMonths = depTermUnit === "years" ? Math.round(depTerm * 12) : Math.round(depTerm);
      const open = new Date(depOpenDate + "T12:00:00");
      const { final, totalInterest, rows } = depositSchedule(initialDeposit, monthlyCont, rate, totalMonths, open);
      const contributed = initialDeposit + monthlyCont * totalMonths;
      const close = rows.length ? rows[rows.length - 1]!.date : open;
      const result = {
        projected: final.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalContributed: contributed.toFixed(2),
        increasePct: contributed > 0 ? ((totalInterest / contributed) * 100).toFixed(2) : "0",
        closingDate: fmtDate(close),
      };
      schedules.push({
        title: sl.depositTitle,
        columns: [
          { key: "no", label: sl.colNo },
          { key: "dt", label: sl.colDate },
          { key: "ac", label: sl.colAccrued },
          { key: "bal", label: sl.colEndBal },
        ],
        rows: rows.map(r => ({
          no: r.n,
          dt: fmtDate(r.date),
          ac: fmtMoney(r.accrued),
          bal: fmtMoney(r.balance),
        })),
        totalRow: {
          no: sl.total,
          dt: "—",
          ac: fmtMoney(totalInterest),
          bal: fmtMoney(final),
        },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: sl.colPrincipal, value: contributed, color: "#10B981" },
          { label: sl.colInterest, value: Math.max(0, totalInterest), color: "#FBBF24" },
        ],
        center: fmtMoney(final),
        sub: sl.colEndBal,
      });
      charts.push({
        kind: "line",
        title: sl.balanceChart,
        points: rows.map(r => ({ x: r.n, y: r.balance })),
        color: "#059669",
      });
      const insights: ResultInsight[] = [];
      if (final > 0 && totalInterest >= 0) {
        insights.push({
          icon: "fa-chart-pie",
          value: `${((totalInterest / final) * 100).toFixed(1)}%`,
          label: gl.insightInterestOfFinal,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "loan") {
      const n = Math.max(0, Math.round(loanTerm * 12));
      const start = new Date(loanStartDate + "T12:00:00");
      const { monthly, totalInterest, totalPaid, endDate, rows } = loanAmortization(loanAmount, rate, n, start, 0);
      const result = {
        monthly: monthly.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalRepaid: totalPaid.toFixed(2),
        endDate: fmtDate(endDate),
      };
      schedules.push({
        title: sl.paymentTitle,
        columns: [
          { key: "no", label: sl.colNo },
          { key: "dt", label: sl.colDate },
          { key: "pay", label: sl.colPayment },
          { key: "int", label: sl.colInterest },
          { key: "pr", label: sl.colPrincipal },
          { key: "bal", label: sl.colBalance },
        ],
        rows: rows.map(r => ({
          no: r.n,
          dt: fmtDate(r.date),
          pay: fmtMoney(r.payment),
          int: fmtMoney(r.interest),
          pr: fmtMoney(r.principal),
          bal: fmtMoney(r.balance),
        })),
        totalRow: {
          no: sl.total,
          dt: "—",
          pay: fmtMoney(totalPaid),
          int: fmtMoney(totalInterest),
          pr: fmtMoney(loanAmount),
          bal: "—",
        },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: sl.colPrincipal, value: loanAmount, color: "#10B981" },
          { label: sl.colInterest, value: Math.max(0, totalInterest), color: "#F472B6" },
        ],
        center: fmtMoney(totalPaid),
        sub: sl.totalRepaid,
      });
      charts.push({
        kind: "line",
        title: sl.balanceChart,
        points: rows.map(r => ({ x: r.n, y: r.balance })),
        color: "#EC4899",
      });
      charts.push({
        kind: "line",
        title: sl.interestPrincipalChart,
        points: rows.map(r => ({ x: r.n, y: r.interest })),
        color: "#F59E0B",
      });
      const insights: ResultInsight[] = [];
      if (loanAmount > 0) {
        insights.push({
          icon: "fa-scale-balanced",
          value: `${((totalInterest / loanAmount) * 100).toFixed(1)}%`,
          label: gl.insightInterestVsPrincipal,
        });
      }
      if (rows[0] && rows[0].payment > 0) {
        insights.push({
          icon: "fa-calendar-day",
          value: `${((rows[0].interest / rows[0].payment) * 100).toFixed(1)}%`,
          label: gl.insightFirstPayInterest,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "mortgage") {
      const principalM = homeValue * (1 - downpayment / 100);
      const n = Math.max(0, Math.round(loanTerm * 12));
      const start = new Date(loanStartDate + "T12:00:00");
      const addon = pmi ? 150 : 0;
      const { monthly, totalInterest, totalPaid, endDate, rows } = loanAmortization(principalM, rate, n, start, addon);
      const result = {
        monthly: monthly.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalRepaid: totalPaid.toFixed(2),
        endDate: fmtDate(endDate),
      };
      schedules.push({
        title: sl.paymentTitle,
        columns: [
          { key: "no", label: sl.colNo },
          { key: "dt", label: sl.colDate },
          { key: "pay", label: sl.colPayment },
          { key: "int", label: sl.colInterest },
          { key: "pr", label: sl.colPrincipal },
          { key: "bal", label: sl.colBalance },
        ],
        rows: rows.map(r => ({
          no: r.n,
          dt: fmtDate(r.date),
          pay: fmtMoney(r.payment),
          int: fmtMoney(r.interest),
          pr: fmtMoney(r.principal),
          bal: fmtMoney(r.balance),
        })),
        totalRow: {
          no: sl.total,
          dt: "—",
          pay: fmtMoney(totalPaid),
          int: fmtMoney(totalInterest),
          pr: fmtMoney(principalM),
          bal: "—",
        },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: sl.colPrincipal, value: principalM, color: "#10B981" },
          { label: sl.colInterest, value: Math.max(0, totalInterest), color: "#F472B6" },
        ],
        center: fmtMoney(totalPaid),
        sub: sl.totalRepaid,
      });
      charts.push({
        kind: "line",
        title: sl.balanceChart,
        points: rows.map(r => ({ x: r.n, y: r.balance })),
        color: "#7C3AED",
      });
      const insights: ResultInsight[] = [];
      if (principalM > 0) {
        insights.push({
          icon: "fa-scale-balanced",
          value: `${((totalInterest / principalM) * 100).toFixed(1)}%`,
          label: gl.insightInterestVsPrincipal,
        });
      }
      if (homeValue > 0) {
        insights.push({
          icon: "fa-house",
          value: `${((principalM / homeValue) * 100).toFixed(1)}%`,
          label: gl.insightFinancedShare,
        });
      }
      if (rows[0] && rows[0].payment > 0) {
        insights.push({
          icon: "fa-calendar-day",
          value: `${((rows[0].interest / rows[0].payment) * 100).toFixed(1)}%`,
          label: gl.insightFirstPayInterest,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "days") {
      if (!startDate || !endDate) {
        return { result: null, insights: [] as ResultInsight[], schedules, charts, formatValue };
      }
      const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const result = {
        totalDays: String(diffDays),
        weeks: (diffDays / 7).toFixed(1),
        months: (diffDays / 30.4).toFixed(1),
      };
      const insights: ResultInsight[] = [
        {
          icon: "fa-earth-americas",
          value: `${(diffDays / 365.25).toFixed(2)}`,
          label: gl.insightApproxYears,
        },
      ];
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "vat") {
      let base: number;
      let vat: number;
      let total: number;
      if (vatType === "inclusive") {
        total = vatAmount;
        base = vatAmount / (1 + vatRate / 100);
        vat = vatAmount - base;
      } else {
        base = vatAmount;
        vat = vatAmount * (vatRate / 100);
        total = vatAmount + vat;
      }
      const result = {
        calculatedVat: vat.toFixed(2),
        totalAmount: total.toFixed(2),
        baseAmount: base.toFixed(2),
      };
      schedules.push({
        title: sl.vatTitle,
        columns: [
          { key: "k", label: "" },
          { key: "v", label: sl.colEndBal },
        ],
        rows: [
          { k: sl.colBase, v: fmtMoney(base) },
          { k: sl.colVat, v: fmtMoney(vat) },
        ],
        totalRow: { k: sl.total, v: fmtMoney(total) },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: sl.colBase, value: base, color: "#3B72C4" },
          { label: sl.colVat, value: vat, color: "#F59E0B" },
        ],
        center: fmtMoney(total),
        sub: sl.colEndBal,
      });
      const insights: ResultInsight[] = [];
      if (total > 0) {
        insights.push({
          icon: "fa-receipt",
          value: `${((vat / total) * 100).toFixed(1)}%`,
          label: gl.insightVatShare,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "emi") {
      const n = Math.max(0, Math.round(emiTenure));
      const start = new Date(loanStartDate + "T12:00:00");
      const { monthly, totalInterest, totalPaid, endDate, rows } = loanAmortization(emiPrincipal, emiRate, n, start, 0);
      const result = {
        monthlyEmi: monthly.toFixed(2),
        totalPayment: totalPaid.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        endDate: fmtDate(endDate),
      };
      schedules.push({
        title: sl.paymentTitle,
        columns: [
          { key: "no", label: sl.colNo },
          { key: "dt", label: sl.colDate },
          { key: "pay", label: sl.colPayment },
          { key: "int", label: sl.colInterest },
          { key: "pr", label: sl.colPrincipal },
          { key: "bal", label: sl.colBalance },
        ],
        rows: rows.map(r => ({
          no: r.n,
          dt: fmtDate(r.date),
          pay: fmtMoney(r.payment),
          int: fmtMoney(r.interest),
          pr: fmtMoney(r.principal),
          bal: fmtMoney(r.balance),
        })),
        totalRow: {
          no: sl.total,
          dt: "—",
          pay: fmtMoney(totalPaid),
          int: fmtMoney(totalInterest),
          pr: fmtMoney(emiPrincipal),
          bal: "—",
        },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: sl.colPrincipal, value: emiPrincipal, color: "#4338CA" },
          { label: sl.colInterest, value: Math.max(0, totalInterest), color: "#F472B6" },
        ],
        center: fmtMoney(totalPaid),
        sub: sl.totalRepaid,
      });
      charts.push({
        kind: "line",
        title: sl.balanceChart,
        points: rows.map(r => ({ x: r.n, y: r.balance })),
        color: "#4338CA",
      });
      const insights: ResultInsight[] = [];
      if (emiPrincipal > 0) {
        insights.push({
          icon: "fa-scale-balanced",
          value: `${((totalInterest / emiPrincipal) * 100).toFixed(1)}%`,
          label: gl.insightInterestVsPrincipal,
        });
      }
      if (rows[0] && rows[0].payment > 0) {
        insights.push({
          icon: "fa-calendar-day",
          value: `${((rows[0].interest / rows[0].payment) * 100).toFixed(1)}%`,
          label: gl.insightFirstPayInterest,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "bmi") {
      const htM = bmiHeight / 100;
      const bmi = bmiWeight / (htM * htM);
      const cat = lang === "en"
        ? (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese")
        : (bmi < 18.5 ? "Дефицит веса" : bmi < 25 ? "Норма" : bmi < 30 ? "Избыточный вес" : "Ожирение");
      const wLo = 18.5 * htM * htM;
      const wHi = 24.99 * htM * htM;
      const result = { score: bmi.toFixed(1), category: cat };
      const insights: ResultInsight[] = [
        {
          icon: "fa-heart-pulse",
          value: `${wLo.toFixed(1)}–${wHi.toFixed(1)} kg`,
          label: gl.insightHealthyBmiRange,
        },
      ];
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "tax") {
      const { rows, totalTax } = progressiveTaxRows(grossIncome);
      const net = grossIncome - totalTax;
      const result = { calculatedTax: totalTax.toFixed(2), netIncome: net.toFixed(2) };
      schedules.push({
        title: sl.taxTitle,
        columns: [
          { key: "band", label: sl.colBand },
          { key: "txb", label: sl.colTaxable },
          { key: "rt", label: sl.colRate },
          { key: "tx", label: sl.colTax },
        ],
        rows: rows.map(r => ({
          band: r.band,
          txb: fmtMoney(r.taxable),
          rt: `${r.ratePct}%`,
          tx: fmtMoney(r.tax),
        })),
        totalRow: {
          band: sl.total,
          txb: fmtMoney(grossIncome),
          rt: "—",
          tx: fmtMoney(totalTax),
        },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: resultLabels.netIncome, value: Math.max(0, net), color: "#10B981" },
          { label: resultLabels.calculatedTax, value: Math.max(0, totalTax), color: "#EF4444" },
        ],
        center: fmtMoney(grossIncome),
        sub: lang === "ru" ? "Доход" : "Gross income",
      });
      const insights: ResultInsight[] = [];
      if (grossIncome > 0) {
        insights.push({
          icon: "fa-percent",
          value: `${((totalTax / grossIncome) * 100).toFixed(2)}%`,
          label: gl.insightEffectiveTax,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "currency") {
      let factor: number | null = null;
      let rateSource: "api" | "static" = "api";
      if (currFrom === currTo) {
        factor = 1;
      } else {
        const r = fxRates[currTo];
        if (r != null && r > 0) {
          factor = r;
          rateSource = "api";
        } else {
          const s = staticDemoFactor(currFrom, currTo);
          if (s != null) {
            factor = s;
            rateSource = "static";
          }
        }
      }
      const conv = factor != null && Number.isFinite(factor) ? currAmount * factor : NaN;
      const result = {
        convertedAmount: Number.isFinite(conv) ? conv.toFixed(2) : "—",
      };
      const insights: ResultInsight[] = [];
      if (factor != null && currFrom !== currTo && factor > 0) {
        const inv = 1 / factor;
        insights.push({
          icon: "fa-right-left",
          value: `1 ${currTo} = ${inv.toLocaleString(locale, { maximumFractionDigits: 6 })} ${currFrom}`,
          label: gl.insightInverseRate,
        });
        const rateLabel =
          rateSource === "static"
            ? gl.insightDemoMid
            : fxBanner?.type === "cache"
              ? gl.insightCachedMid
              : gl.insightLiveMid;
        insights.push({
          icon: "fa-tag",
          value: `1 ${currFrom} = ${factor.toLocaleString(locale, { maximumFractionDigits: 6 })} ${currTo}`,
          label: rateLabel,
        });
      } else if (!Number.isFinite(conv)) {
        insights.push({
          icon: "fa-triangle-exclamation",
          value: "—",
          label: gl.fxPairUnavailable,
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    if (id === "salestax") {
      let base: number;
      let stax: number;
      let total: number;
      if (vatType === "inclusive") {
        total = vatAmount;
        base = vatAmount / (1 + vatRate / 100);
        stax = vatAmount - base;
      } else {
        base = vatAmount;
        stax = vatAmount * (vatRate / 100);
        total = vatAmount + stax;
      }
      const result = {
        salesTaxAmount: stax.toFixed(2),
        totalAfterTax: total.toFixed(2),
        preTaxPrice: base.toFixed(2),
      };
      schedules.push({
        title: sl.vatTitle,
        columns: [
          { key: "k", label: "" },
          { key: "v", label: sl.colEndBal },
        ],
        rows: [
          { k: lang === "ru" ? "Цена без налога" : "Pre-tax price", v: fmtMoney(base) },
          { k: lang === "ru" ? "Налог с продаж" : "Sales tax", v: fmtMoney(stax) },
        ],
        totalRow: { k: sl.total, v: fmtMoney(total) },
      });
      charts.push({
        kind: "donut",
        title: sl.ratioDonut,
        parts: [
          { label: lang === "ru" ? "Цена без налога" : "Pre-tax", value: base, color: "#3B72C4" },
          { label: lang === "ru" ? "Налог" : "Tax", value: stax, color: "#F59E0B" },
        ],
        center: fmtMoney(total),
        sub: lang === "ru" ? "Итого с налогом" : "Total after tax",
      });
      const insights: ResultInsight[] = [];
      if (total > 0) {
        insights.push({
          icon: "fa-tags",
          value: `${((stax / total) * 100).toFixed(1)}%`,
          label: lang === "ru" ? "Налог % от итога" : "Tax % of total",
        });
      }
      return { result, insights, schedules, charts, formatValue };
    }

    return { result: null, insights: [] as ResultInsight[], schedules, charts, formatValue };
  }, [
    id, lang, locale, gl, principal, rate, time, compounding,
    initialDeposit, monthlyCont, depTerm, depTermUnit, depOpenDate,
    loanAmount, loanTerm, loanStartDate, homeValue, downpayment, pmi,
    startDate, endDate, vatAmount, vatRate, vatType,
    emiPrincipal, emiRate, emiTenure, bmiWeight, bmiHeight, grossIncome,
    currAmount, currFrom, currTo, sl,
    hasInputErrors,
    fxRates,
    fxBanner,
  ]);

  const { result, insights, schedules, charts, formatValue } = computed;
  const icon = calcIcons[id] ?? "fa-calculator";

  return (
    <div className="fc-calc-page">
      <div className="fc-calc-header">
        <h1>
          <i className={`fa-solid ${icon} me-2 fc-calc-header-icon`}></i>
          {t.title}
        </h1>
        <p>{t.desc}</p>
      </div>

      <div className="row g-0">
        <div className="col-lg-6 fc-form-section">
          <p className="fc-section-label">
            <i className="fa-solid fa-sliders"></i>
            {gl.instructions}
          </p>
          <p className="fc-live-hint">{gl.liveResultsHint}</p>

          {id === "interest" && (
            <div>
              <CalcField label={t.principal} error={decErr("principal")}>
                <MoneyInput
                  value={principal}
                  onChange={setPrincipal}
                  invalid={decInv("principal")}
                  onDecimalSyntaxBad={bad => setSyntaxField("principal", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("rate")}>
                <PctInput
                  value={rate}
                  onChange={setRate}
                  invalid={decInv("rate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("rate", bad)}
                />
              </CalcField>
              <CalcField label={t.time} error={decErr("time")}>
                <YrsInput
                  value={time}
                  onChange={setTime}
                  invalid={decInv("time")}
                  onDecimalSyntaxBad={bad => setSyntaxField("time", bad)}
                />
              </CalcField>
              <CalcField label={t.compounding}>
                <select className="form-select" value={compounding} onChange={e => setCompounding(Number(e.target.value))}>
                  <option value={12}>{lang === "ru" ? "Ежемесячно" : "Monthly"}</option>
                  <option value={4}>{lang === "ru" ? "Ежеквартально" : "Quarterly"}</option>
                  <option value={1}>{lang === "ru" ? "Ежегодно" : "Annually"}</option>
                </select>
              </CalcField>
            </div>
          )}

          {id === "deposit" && (
            <div>
              <CalcField label={t.initial} error={decErr("initialDeposit")}>
                <MoneyInput
                  value={initialDeposit}
                  onChange={setInitialDeposit}
                  invalid={decInv("initialDeposit")}
                  onDecimalSyntaxBad={bad => setSyntaxField("initialDeposit", bad)}
                />
              </CalcField>
              <CalcField label={t.monthly} error={decErr("monthlyCont")}>
                <MoneyInput
                  value={monthlyCont}
                  onChange={setMonthlyCont}
                  invalid={decInv("monthlyCont")}
                  onDecimalSyntaxBad={bad => setSyntaxField("monthlyCont", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("rate")}>
                <PctInput
                  value={rate}
                  onChange={setRate}
                  invalid={decInv("rate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("rate", bad)}
                />
              </CalcField>
              <CalcField label={sl.depositTerm} error={decErr("depTerm")}>
                <div className="d-flex gap-2 flex-wrap">
                  <div className={clsx("fc-igroup fc-igroup--grow", decInv("depTerm") && "fc-igroup--invalid")}>
                    <NumericInput
                      value={depTerm}
                      onChange={setDepTerm}
                      invalid={decInv("depTerm")}
                      onDecimalSyntaxBad={bad => setSyntaxField("depTerm", bad)}
                    />
                  </div>
                  <select className="form-select fc-select-term-unit" value={depTermUnit} onChange={e => setDepTermUnit(e.target.value as "years" | "months")}>
                    <option value="years">{sl.years}</option>
                    <option value="months">{sl.months}</option>
                  </select>
                </div>
              </CalcField>
              <CalcField label={sl.openingDate}>
                <input type="date" className="form-control" value={depOpenDate} onChange={e => setDepOpenDate(e.target.value)} />
              </CalcField>
            </div>
          )}

          {id === "loan" && (
            <div>
              <CalcField label={t.amount} error={decErr("loanAmount")}>
                <MoneyInput
                  value={loanAmount}
                  onChange={setLoanAmount}
                  invalid={decInv("loanAmount")}
                  onDecimalSyntaxBad={bad => setSyntaxField("loanAmount", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("rate")}>
                <PctInput
                  value={rate}
                  onChange={setRate}
                  invalid={decInv("rate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("rate", bad)}
                />
              </CalcField>
              <CalcField label={t.term} error={decErr("loanTerm")}>
                <YrsInput
                  value={loanTerm}
                  onChange={setLoanTerm}
                  invalid={decInv("loanTerm")}
                  onDecimalSyntaxBad={bad => setSyntaxField("loanTerm", bad)}
                />
              </CalcField>
              <CalcField label={sl.firstPayment}>
                <input type="date" className="form-control" value={loanStartDate} onChange={e => setLoanStartDate(e.target.value)} />
              </CalcField>
            </div>
          )}

          {id === "mortgage" && (
            <div>
              <CalcField label={t.homeValue} error={decErr("homeValue")}>
                <MoneyInput
                  value={homeValue}
                  onChange={setHomeValue}
                  invalid={decInv("homeValue")}
                  onDecimalSyntaxBad={bad => setSyntaxField("homeValue", bad)}
                />
              </CalcField>
              <CalcField label={t.downpayment} error={decErr("downpayment")}>
                <PctInput
                  value={downpayment}
                  onChange={setDownpayment}
                  step="1"
                  invalid={decInv("downpayment")}
                  onDecimalSyntaxBad={bad => setSyntaxField("downpayment", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("rate")}>
                <PctInput
                  value={rate}
                  onChange={setRate}
                  invalid={decInv("rate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("rate", bad)}
                />
              </CalcField>
              <CalcField label={t.term} error={decErr("loanTerm")}>
                <YrsInput
                  value={loanTerm}
                  onChange={setLoanTerm}
                  invalid={decInv("loanTerm")}
                  onDecimalSyntaxBad={bad => setSyntaxField("loanTerm", bad)}
                />
              </CalcField>
              <CalcField label={sl.firstPayment}>
                <input type="date" className="form-control" value={loanStartDate} onChange={e => setLoanStartDate(e.target.value)} />
              </CalcField>
              <div className="fc-form-group">
                <label className="fc-pmi-check" onClick={() => setPmi(!pmi)}>
                  <input type="checkbox" checked={pmi} onChange={e => setPmi(e.target.checked)} onClick={e => e.stopPropagation()} />
                  <span>{t.pmi}</span>
                </label>
              </div>
            </div>
          )}

          {id === "days" && (
            <div>
              <CalcField label={t.startDate} error={fieldErrors.startDate}>
                <input
                  type="date"
                  className={clsx("form-control", fieldErrors.startDate && "is-invalid")}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </CalcField>
              <CalcField label={t.endDate} error={fieldErrors.endDate}>
                <input
                  type="date"
                  className={clsx("form-control", fieldErrors.endDate && "is-invalid")}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </CalcField>
            </div>
          )}

          {id === "vat" && (
            <div>
              <CalcField label={t.amount} error={decErr("vatAmount")}>
                <MoneyInput
                  value={vatAmount}
                  onChange={setVatAmount}
                  invalid={decInv("vatAmount")}
                  onDecimalSyntaxBad={bad => setSyntaxField("vatAmount", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("vatRate")}>
                <PctInput
                  value={vatRate}
                  onChange={setVatRate}
                  step="1"
                  invalid={decInv("vatRate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("vatRate", bad)}
                />
              </CalcField>
              <CalcField label={t.type}>
                <select className="form-select" value={vatType} onChange={e => setVatType(e.target.value)}>
                  <option value="inclusive">{t.inclusive}</option>
                  <option value="exclusive">{t.exclusive}</option>
                </select>
              </CalcField>
            </div>
          )}

          {id === "emi" && (
            <div>
              <CalcField label={t.principal} error={decErr("emiPrincipal")}>
                <MoneyInput
                  value={emiPrincipal}
                  onChange={setEmiPrincipal}
                  invalid={decInv("emiPrincipal")}
                  onDecimalSyntaxBad={bad => setSyntaxField("emiPrincipal", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("emiRate")}>
                <PctInput
                  value={emiRate}
                  onChange={setEmiRate}
                  invalid={decInv("emiRate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("emiRate", bad)}
                />
              </CalcField>
              <CalcField label={t.tenure} error={decErr("emiTenure")}>
                <MoInput
                  value={emiTenure}
                  onChange={setEmiTenure}
                  invalid={decInv("emiTenure")}
                  onDecimalSyntaxBad={bad => setSyntaxField("emiTenure", bad)}
                />
              </CalcField>
              <CalcField label={sl.firstPayment}>
                <input type="date" className="form-control" value={loanStartDate} onChange={e => setLoanStartDate(e.target.value)} />
              </CalcField>
            </div>
          )}

          {id === "bmi" && (
            <div>
              <CalcField label={t.weight} error={decErr("bmiWeight")}>
                <div className={clsx("fc-igroup", decInv("bmiWeight") && "fc-igroup--invalid")}>
                  <NumericInput
                    value={bmiWeight}
                    onChange={setBmiWeight}
                    invalid={decInv("bmiWeight")}
                    onDecimalSyntaxBad={bad => setSyntaxField("bmiWeight", bad)}
                  />
                  <span className="ig-addon suffix">kg</span>
                </div>
              </CalcField>
              <CalcField label={t.height} error={decErr("bmiHeight")}>
                <div className={clsx("fc-igroup", decInv("bmiHeight") && "fc-igroup--invalid")}>
                  <NumericInput
                    value={bmiHeight}
                    onChange={setBmiHeight}
                    invalid={decInv("bmiHeight")}
                    onDecimalSyntaxBad={bad => setSyntaxField("bmiHeight", bad)}
                  />
                  <span className="ig-addon suffix">cm</span>
                </div>
              </CalcField>
            </div>
          )}

          {id === "tax" && (
            <div>
              <CalcField label={t.grossIncome} error={decErr("grossIncome")}>
                <MoneyInput
                  value={grossIncome}
                  onChange={setGrossIncome}
                  invalid={decInv("grossIncome")}
                  onDecimalSyntaxBad={bad => setSyntaxField("grossIncome", bad)}
                />
              </CalcField>
            </div>
          )}

          {id === "salestax" && (
            <div>
              <CalcField label={t.amount} error={decErr("vatAmount")}>
                <MoneyInput
                  value={vatAmount}
                  onChange={setVatAmount}
                  invalid={decInv("vatAmount")}
                  onDecimalSyntaxBad={bad => setSyntaxField("vatAmount", bad)}
                />
              </CalcField>
              <CalcField label={t.rate} error={decErr("vatRate")}>
                <PctInput
                  value={vatRate}
                  onChange={setVatRate}
                  step="1"
                  invalid={decInv("vatRate")}
                  onDecimalSyntaxBad={bad => setSyntaxField("vatRate", bad)}
                />
              </CalcField>
              <CalcField label={t.type}>
                <select className="form-select" value={vatType} onChange={e => setVatType(e.target.value)}>
                  <option value="exclusive">{t.exclusive}</option>
                  <option value="inclusive">{t.inclusive}</option>
                </select>
              </CalcField>
            </div>
          )}

          {id === "currency" && (
            <div>
              {fxLoading ? (
                <div className="alert alert-secondary py-2 px-3 small mb-3 d-flex align-items-center gap-2" role="status">
                  <span className="spinner-border spinner-border-sm" aria-hidden />
                  {gl.fxRatesLoading}
                </div>
              ) : fxBanner ? (
                <div
                  className={clsx(
                    "alert py-2 px-3 small mb-3",
                    fxBanner.type === "live" && "alert-success",
                    fxBanner.type === "cache" && "alert-warning text-dark",
                    fxBanner.type === "demo" && "alert-info text-dark",
                  )}
                >
                  {fxBanner.type === "live" && (
                    <>
                      {gl.fxRatesLive.replace("{date}", fxBanner.date)}{" "}
                      <span className="opacity-75">
                        (
                        {fxBanner.source === "exchangerate-api"
                          ? gl.fxSourceExchangerateApi
                          : gl.fxSourceFrankfurter}
                        )
                      </span>
                    </>
                  )}
                  {fxBanner.type === "cache" && gl.fxRatesCached.replace("{date}", fxBanner.date)}
                  {fxBanner.type === "demo" && gl.fxRatesDemo}
                </div>
              ) : null}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => fxRefresh()}
                  disabled={fxLoading}
                >
                  <i className="fa-solid fa-rotate me-1" aria-hidden />
                  {gl.fxRefresh}
                </button>
              </div>
              <CalcField label={t.amount} error={decErr("currAmount")}>
                <NumericInput
                  value={currAmount}
                  onChange={setCurrAmount}
                  invalid={decInv("currAmount")}
                  onDecimalSyntaxBad={bad => setSyntaxField("currAmount", bad)}
                />
              </CalcField>
              <CalcField label={t.from}>
                <select className="form-select" value={currFrom} onChange={e => setCurrFrom(e.target.value)}>
                  {fxCodes.map(code => (
                    <option key={code} value={code}>
                      {currencyOptionLabel(code, lang)}
                    </option>
                  ))}
                </select>
              </CalcField>
              <CalcField label={t.to}>
                <select className="form-select" value={currTo} onChange={e => setCurrTo(e.target.value)}>
                  {fxCodes.map(code => (
                    <option key={code} value={code}>
                      {currencyOptionLabel(code, lang)}
                    </option>
                  ))}
                </select>
              </CalcField>
            </div>
          )}
        </div>

        <div className="col-lg-6 fc-results-section">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 fc-results-toolbar">
            <p className="fc-section-label mb-0">
              <i className="fa-solid fa-square-poll-vertical"></i>
              {t.results}
            </p>
            {result ? (
              <div className="btn-group btn-group-sm fc-result-view-toggle" role="group" aria-label={lang === "ru" ? "Вид результатов" : "Results layout"}>
                <button
                  type="button"
                  className={clsx("btn", !resultViewCompact ? "btn-primary" : "btn-outline-secondary")}
                  onClick={() => setResultViewCompact(false)}
                >
                  {gl.resultsViewComfortable}
                </button>
                <button
                  type="button"
                  className={clsx("btn", resultViewCompact ? "btn-primary" : "btn-outline-secondary")}
                  onClick={() => setResultViewCompact(true)}
                >
                  {gl.resultsViewCompact}
                </button>
              </div>
            ) : null}
          </div>

          {result ? (
            <div className={clsx("fc-result-box fc-animate", resultViewCompact && "fc-result-box--compact")}>
              {Object.keys(result).map(key => (
                <div key={key} className="fc-result-metric">
                  <span className="metric-label">
                    {resultLabels[key] ?? key.replace(/([A-Z])/g, " $1")}
                  </span>
                  {key === "category" ? (
                    <span className={`fc-bmi-badge badge rounded-pill px-3 py-2 fc-bmi-badge--${bmiBadgeSlug[result[key]] ?? "default"}`}>
                      {result[key]}
                    </span>
                  ) : (
                    <TruncatedText text={formatValue(key, result[key])} className="metric-value" />
                  )}
                </div>
              ))}
              {id === "bmi" && result.score && (
                <div className="fc-form-group mt-2 mb-0">
                  <div className="fc-bmi-scale">
                    <div
                      className="fc-bmi-scale-marker"
                      style={{ left: `${Math.min(100, Math.max(0, ((parseFloat(result.score) - 15) / 25) * 100))}%` }}
                    />
                  </div>
                  <div className="small text-muted mt-1">15 — 40 BMI</div>
                </div>
              )}
              {insights.length > 0 ? (
                <div className="fc-result-insights" aria-label={lang === "ru" ? "Дополнительные показатели" : "Extra insights"}>
                  {insights.map((ins, i) => (
                    <div key={i} className="fc-result-insight">
                      <span className="fc-result-insight__icon" aria-hidden>
                        <i className={`fa-solid ${ins.icon}`}></i>
                      </span>
                      <div className="fc-result-insight__text">
                        <span className="fc-result-insight__val">{ins.value}</span>
                        <span className="fc-result-insight__lbl">{ins.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="fc-result-box">
              <div className="fc-result-empty">
                <span className="empty-icon">
                  <i className={`fa-solid ${icon}`}></i>
                </span>
                <p>
                  {hasInputErrors
                    ? gl.validationSummary
                    : id === "days"
                      ? (lang === "ru" ? "Укажите обе даты, чтобы увидеть результат." : "Enter both dates to see results.")
                      : (lang === "ru" ? "Введите данные слева." : "Enter values on the left.")}
                </p>
              </div>
            </div>
          )}

          <div className="fc-info-box">
            <div className="fc-info-title">
              <i className="fa-solid fa-book-open fc-info-icon--sky"></i>
              {gl.howToUse}
            </div>
            <p>{t.how}</p>
          </div>

          <div className="fc-info-box">
            <div className="fc-info-title">
              <i className="fa-solid fa-scale-balanced fc-info-icon--amber"></i>
              {gl.financialImpact}
            </div>
            <p>{t.finance}</p>
          </div>
        </div>
      </div>

      {result && (charts.length > 0 || schedules.length > 0) && (
        <div className="fc-calc-detail">
          <div className="fc-calc-detail__title">{sl.heading}</div>

          {charts.length > 0 && (
            <div className="fc-calc-charts-row">
              {charts.map((c, i) => (
                <div key={i} className="fc-calc-chart-card">
                  <h5>{c.title}</h5>
                  {c.kind === "donut" ? (
                    <DonutChart parts={c.parts} centerLabel={c.center} centerSub={c.sub} />
                  ) : (
                    <LineAreaChart points={c.points} color={c.color} />
                  )}
                </div>
              ))}
            </div>
          )}

          {id === "emi" && (
            <p className="small text-muted mb-3">{sl.emiNote}</p>
          )}

          {schedules.map((s, i) => (
            <div key={i} className="mb-4">
              <h5 className="fc-calc-detail__title" style={{ textTransform: "none", fontSize: "0.88rem", letterSpacing: "0.02em" }}>
                {s.title}
              </h5>
              <ScheduleTable columns={s.columns} rows={s.rows} totalRow={s.totalRow} />
            </div>
          ))}
        </div>
      )}

      <CalculatorRichArticle id={id} lang={lang} />
    </div>
  );
}

/** Basic calculator is a separate subtree so hooks here always run in a fixed order (not after an early return). */
export default function Calculators({ id, lang }: Props) {
  if (id === "basic") {
    return <BasicCalculatorPage lang={lang} />;
  }
  return <FinancialCalculator id={id} lang={lang} />;
}
