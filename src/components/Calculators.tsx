import { useState } from "react";
import { translations } from "../data/translations";

interface Props {
  id: string;
  lang: "en" | "ru";
}

export default function Calculators({ id, lang }: Props) {
  const t = translations[lang].calculators[id as keyof typeof translations.en.calculators] as any;

  // Common State
  const [result, setResult] = useState<any>(null);

  // Interest Calculator States
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(5);
  const [compounding, setCompounding] = useState(12);

  // Deposit States
  const [initialDeposit, setInitialDeposit] = useState(5000);
  const [monthlyCont, setMonthlyCont] = useState(200);

  // Loan States
  const [loanAmount, setLoanAmount] = useState(20000);
  const [loanTerm, setLoanTerm] = useState(5);

  // Mortgage States
  const [homeValue, setHomeValue] = useState(300000);
  const [downpayment, setDownpayment] = useState(20);
  const [pmi, setPmi] = useState(false);

  // Days States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // VAT States
  const [vatAmount, setVatAmount] = useState(100);
  const [vatRate, setVatRate] = useState(20);
  const [vatType, setVatType] = useState("inclusive");

  // EMI States
  const [emiPrincipal, setEmiPrincipal] = useState(50000);
  const [emiRate, setEmiRate] = useState(8);
  const [emiTenure, setEmiTenure] = useState(48);

  // BMI States
  const [bmiWeight, setBmiWeight] = useState(70);
  const [bmiHeight, setBmiHeight] = useState(175);

  // Tax States
  const [grossIncome, setGrossIncome] = useState(60000);

  // Currency States
  const [currAmount, setCurrAmount] = useState(100);
  const [currFrom, setCurrFrom] = useState("USD");
  const [currTo, setCurrTo] = useState("EUR");

  // Calculations
  const calculateInterest = (e: any) => {
    e.preventDefault();
    const p = principal;
    const r = rate / 100;
    const t_years = time;
    const n = compounding;

    const amount = p * Math.pow(1 + r / n, n * t_years);
    const totalInterest = amount - p;

    setResult({
      totalBalance: amount.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    });
  };

  const calculateDeposit = (e: any) => {
    e.preventDefault();
    const p = initialDeposit;
    const m = monthlyCont;
    const r = rate / 100 / 12;
    const totalMonths = time * 12;

    let total = p;
    for (let i = 0; i < totalMonths; i++) {
      total = total * (1 + r) + m;
    }

    setResult({
      projected: total.toFixed(2),
    });
  };

  const calculateLoan = (e: any) => {
    e.preventDefault();
    const p = loanAmount;
    const r = rate / 100 / 12;
    const n = loanTerm * 12;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInt = totalPayable - p;

    setResult({
      monthly: emi.toFixed(2),
      totalInterest: totalInt.toFixed(2),
    });
  };

  const calculateMortgage = (e: any) => {
    e.preventDefault();
    const p = homeValue * (1 - downpayment / 100);
    const r = rate / 100 / 12;
    const n = loanTerm * 12;

    let emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    if (pmi) emi += 150; // simulated tax/insurance

    setResult({
      monthly: emi.toFixed(2),
    });
  };

  const calculateDays = (e: any) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = (diffDays / 7).toFixed(1);
    const months = (diffDays / 30.4).toFixed(1);

    setResult({
      totalDays: diffDays,
      weeks,
      months,
    });
  };

  const calculateVat = (e: any) => {
    e.preventDefault();
    const amt = vatAmount;
    const rt = vatRate;

    if (vatType === "inclusive") {
      const base = amt / (1 + rt / 100);
      const vat = amt - base;
      setResult({
        calculatedVat: vat.toFixed(2),
        totalAmount: amt.toFixed(2),
      });
    } else {
      const vat = amt * (rt / 100);
      const total = amt + vat;
      setResult({
        calculatedVat: vat.toFixed(2),
        totalAmount: total.toFixed(2),
      });
    }
  };

  const calculateEmi = (e: any) => {
    e.preventDefault();
    const p = emiPrincipal;
    const r = emiRate / 100 / 12;
    const n = emiTenure;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;

    setResult({
      monthlyEmi: emi.toFixed(2),
      totalPayment: totalPayable.toFixed(2),
    });
  };

  const calculateBmi = (e: any) => {
    e.preventDefault();
    const htInMeter = bmiHeight / 100;
    const bmi = bmiWeight / (htInMeter * htInMeter);
    let cat = "Normal";

    if (lang === "en") {
      if (bmi < 18.5) cat = "Underweight";
      else if (bmi < 25) cat = "Normal";
      else if (bmi < 30) cat = "Overweight";
      else cat = "Obese";
    } else {
      if (bmi < 18.5) cat = "Дефицит веса";
      else if (bmi < 25) cat = "Норма";
      else if (bmi < 30) cat = "Избыточный вес";
      else cat = "Ожирение";
    }

    setResult({
      score: bmi.toFixed(1),
      category: cat,
    });
  };

  const calculateTax = (e: any) => {
    e.preventDefault();
    const income = grossIncome;
    let tax = 0;

    if (income <= 15000) {
      tax = income * 0.1;
    } else if (income <= 50000) {
      tax = 1500 + (income - 15000) * 0.15;
    } else {
      tax = 1500 + 5250 + (income - 50000) * 0.25;
    }

    setResult({
      calculatedTax: tax.toFixed(2),
      netIncome: (income - tax).toFixed(2),
    });
  };

  const calculateCurrency = (e: any) => {
    e.preventDefault();
    const amt = currAmount;
    let rateFactor = 1.0;

    if (currFrom === currTo) rateFactor = 1.0;
    else if (currFrom === "USD" && currTo === "EUR") rateFactor = 0.92;
    else if (currFrom === "EUR" && currTo === "USD") rateFactor = 1.08;
    else if (currFrom === "USD" && currTo === "RUB") rateFactor = 90.5;
    else if (currFrom === "RUB" && currTo === "USD") rateFactor = 0.011;
    else if (currFrom === "EUR" && currTo === "RUB") rateFactor = 98.2;
    else if (currFrom === "RUB" && currTo === "EUR") rateFactor = 0.01;

    setResult({
      convertedAmount: (amt * rateFactor).toFixed(2),
    });
  };

  return (
    <div className="card shadow-sm p-4 bg-white mb-5">
      <div className="border-bottom pb-2 mb-4">
        <h2 className="text-primary d-flex align-items-center">
          <i className="fa-solid fa-calculator me-2"></i> {t.title}
        </h2>
        <p className="text-muted">{t.desc}</p>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <h5 className="mb-3 text-secondary">{translations[lang].instructions}</h5>

          {id === "interest" && (
            <form onSubmit={calculateInterest}>
              <div className="mb-3">
                <label className="form-label">{t.principal}</label>
                <input type="number" className="form-control" value={principal} onChange={e => setPrincipal(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.rate}</label>
                <input type="number" step="0.1" className="form-control" value={rate} onChange={e => setRate(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.time}</label>
                <input type="number" className="form-control" value={time} onChange={e => setTime(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.compounding}</label>
                <select className="form-select" value={compounding} onChange={e => setCompounding(Number(e.target.value))}>
                  <option value={12}>Monthly</option>
                  <option value={4}>Quarterly</option>
                  <option value={1}>Annually</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "deposit" && (
            <form onSubmit={calculateDeposit}>
              <div className="mb-3">
                <label className="form-label">{t.initial}</label>
                <input type="number" className="form-control" value={initialDeposit} onChange={e => setInitialDeposit(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.monthly}</label>
                <input type="number" className="form-control" value={monthlyCont} onChange={e => setMonthlyCont(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.rate}</label>
                <input type="number" step="0.1" className="form-control" value={rate} onChange={e => setRate(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.time}</label>
                <input type="number" className="form-control" value={time} onChange={e => setTime(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "loan" && (
            <form onSubmit={calculateLoan}>
              <div className="mb-3">
                <label className="form-label">{t.amount}</label>
                <input type="number" className="form-control" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.rate}</label>
                <input type="number" step="0.1" className="form-control" value={rate} onChange={e => setRate(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.term}</label>
                <input type="number" className="form-control" value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "mortgage" && (
            <form onSubmit={calculateMortgage}>
              <div className="mb-3">
                <label className="form-label">{t.homeValue}</label>
                <input type="number" className="form-control" value={homeValue} onChange={e => setHomeValue(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.downpayment}</label>
                <input type="number" className="form-control" value={downpayment} onChange={e => setDownpayment(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.rate}</label>
                <input type="number" step="0.1" className="form-control" value={rate} onChange={e => setRate(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.term}</label>
                <input type="number" className="form-control" value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))} />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="pmi" checked={pmi} onChange={e => setPmi(e.target.checked)} />
                <label className="form-check-label" htmlFor="pmi">{t.pmi}</label>
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "days" && (
            <form onSubmit={calculateDays}>
              <div className="mb-3">
                <label className="form-label">{t.startDate}</label>
                <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.endDate}</label>
                <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "vat" && (
            <form onSubmit={calculateVat}>
              <div className="mb-3">
                <label className="form-label">{t.amount}</label>
                <input type="number" className="form-control" value={vatAmount} onChange={e => setVatAmount(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.rate}</label>
                <input type="number" className="form-control" value={vatRate} onChange={e => setVatRate(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.type}</label>
                <select className="form-select" value={vatType} onChange={e => setVatType(e.target.value)}>
                  <option value="inclusive">{t.inclusive}</option>
                  <option value="exclusive">{t.exclusive}</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "emi" && (
            <form onSubmit={calculateEmi}>
              <div className="mb-3">
                <label className="form-label">{t.principal}</label>
                <input type="number" className="form-control" value={emiPrincipal} onChange={e => setEmiPrincipal(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.rate}</label>
                <input type="number" step="0.1" className="form-control" value={emiRate} onChange={e => setEmiRate(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.tenure}</label>
                <input type="number" className="form-control" value={emiTenure} onChange={e => setEmiTenure(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "bmi" && (
            <form onSubmit={calculateBmi}>
              <div className="mb-3">
                <label className="form-label">{t.weight}</label>
                <input type="number" className="form-control" value={bmiWeight} onChange={e => setBmiWeight(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.height}</label>
                <input type="number" className="form-control" value={bmiHeight} onChange={e => setBmiHeight(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "tax" && (
            <form onSubmit={calculateTax}>
              <div className="mb-3">
                <label className="form-label">{t.grossIncome}</label>
                <input type="number" className="form-control" value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}

          {id === "currency" && (
            <form onSubmit={calculateCurrency}>
              <div className="mb-3">
                <label className="form-label">{t.amount}</label>
                <input type="number" className="form-control" value={currAmount} onChange={e => setCurrAmount(Number(e.target.value))} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t.from}</label>
                <select className="form-select" value={currFrom} onChange={e => setCurrFrom(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t.to}</label>
                <select className="form-select" value={currTo} onChange={e => setCurrTo(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">{t.calculate}</button>
            </form>
          )}
        </div>

        <div className="col-lg-6">
          <div className="bg-light p-4 rounded border mb-4">
            <h5 className="text-dark d-flex align-items-center">
              <i className="fa-solid fa-square-poll-vertical me-2 text-success"></i> {t.results}
            </h5>
            <hr />
            {result ? (
              <div>
                {Object.keys(result).map((key) => (
                  <div key={key} className="d-flex justify-content-between mb-2">
                    <span className="text-capitalize text-secondary">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <strong className="text-dark">{result[key]}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small m-0">Enter values and click calculate to view detailed results.</p>
            )}
          </div>

          <div className="p-3 bg-light rounded border">
            <h6 className="d-flex align-items-center mb-2">
              <i className="fa-solid fa-book-open me-2 text-info"></i> {translations[lang].howToUse}
            </h6>
            <p className="small text-muted">{t.how}</p>

            <h6 className="d-flex align-items-center mt-3 mb-2">
              <i className="fa-solid fa-scale-balanced me-2 text-warning"></i> {translations[lang].financialImpact}
            </h6>
            <p className="small text-muted">{t.finance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
