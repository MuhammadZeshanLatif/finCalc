import type { AppLang } from "../utils/routes";

/** Short anchor labels for contextual + related links (not page titles). */
export const CALC_LINK_LABELS: Record<AppLang, Record<string, string>> = {
  en: {
    loan: "Loan Calculator",
    mortgage: "Mortgage Calculator",
    emi: "EMI Calculator",
    interest: "Compound Interest Calculator",
    deposit: "Deposit Calculator",
    tax: "Income Tax Calculator",
    vat: "VAT Calculator",
    salestax: "Sales Tax Calculator",
    currency: "Currency Converter",
    basic: "Scientific Calculator",
    days: "Date Difference Calculator",
    bmi: "BMI Calculator",
  },
  ru: {
    loan: "Кредитный калькулятор",
    mortgage: "Ипотечный калькулятор",
    emi: "EMI калькулятор",
    interest: "Калькулятор сложных процентов",
    deposit: "Калькулятор вклада",
    tax: "Налоговый калькулятор",
    vat: "Калькулятор НДС",
    salestax: "Калькулятор налога с продаж",
    currency: "Конвертер валют",
    basic: "Научный калькулятор",
    days: "Калькулятор дней между датами",
    bmi: "Калькулятор ИМТ",
  },
};

/** 2–4 contextual links inside main content (topical clusters). */
export const CONTEXTUAL_CALC_LINKS: Record<string, readonly string[]> = {
  loan: ["emi", "interest", "mortgage", "deposit"],
  mortgage: ["loan", "emi", "interest"],
  emi: ["loan", "mortgage", "interest"],
  interest: ["deposit", "loan", "emi"],
  deposit: ["interest", "loan", "mortgage"],
  tax: ["vat", "salestax"],
  vat: ["tax", "salestax"],
  salestax: ["vat", "tax"],
  currency: ["vat", "tax", "deposit"],
  basic: ["days", "currency"],
  days: ["basic", "loan"],
  bmi: [],
};

/** 3–5 links for the Related Calculators block (bottom of page). */
export const RELATED_CALCULATORS: Record<string, readonly string[]> = {
  loan: ["emi", "mortgage", "interest", "deposit"],
  mortgage: ["loan", "emi", "interest"],
  emi: ["loan", "mortgage", "interest"],
  interest: ["deposit", "loan", "emi"],
  deposit: ["interest", "loan", "mortgage"],
  tax: ["vat", "salestax"],
  vat: ["tax", "salestax"],
  salestax: ["vat", "tax"],
  currency: ["vat", "tax", "deposit"],
  basic: ["days", "currency"],
  days: ["basic", "loan"],
  /** Health page — utility tools only, no finance cluster bleed. */
  bmi: ["basic", "days"],
};

export const CONTEXTUAL_INTRO: Record<AppLang, Record<string, string>> = {
  en: {
    loan: "When you compare offers, pair this tool with our",
    mortgage: "Home loans share the same math as personal loans — also try our",
    emi: "EMI is the fixed payment view of the same amortization logic used in our",
    interest: "Savings and borrowing both depend on compounding — explore our",
    deposit: "Deposits grow with the same compounding ideas as our",
    tax: "For invoice and checkout math, see our",
    vat: "VAT and sales tax often appear together in pricing — compare with our",
    salestax: "Retail and invoice workflows also use our",
    currency: "Cross-border amounts often need tax context — useful companions include our",
    basic: "For date math and conversions, you may also use our",
    days: "Contract and loan timelines often start with our",
    bmi: "",
  },
  ru: {
    loan: "Сравнивая предложения, удобно использовать вместе с нашими",
    mortgage: "Ипотека использует ту же амортизацию — см. также",
    emi: "EMI — это фиксированный платёж по той же логике, что и в",
    interest: "Накопления и кредиты зависят от капитализации — см.",
    deposit: "Вклад растёт по тем же принципам, что и в",
    tax: "Для счетов и чеков см. также",
    vat: "НДС и налог с продаж часто идут в паре — сравните с",
    salestax: "Для розницы и счетов также пригодятся",
    currency: "Для сумм в разных валютах полезны",
    basic: "Для дат и конвертации также есть",
    days: "Сроки договоров и кредитов часто считают через",
    bmi: "",
  },
};

export function getRelatedSectionTitle(lang: AppLang, calcId: string): string {
  if (calcId === "bmi") {
    return lang === "ru" ? "Другие калькуляторы" : "Other Calculators";
  }
  return lang === "ru" ? "Похожие калькуляторы" : "Related Calculators";
}
