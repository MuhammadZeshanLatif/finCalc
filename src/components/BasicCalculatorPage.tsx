import { useCallback, useRef, useState } from "react";
import { translations } from "../data/translations";
import { evaluateExpression, roundDisplay } from "../utils/basicCalcEngine";
import { CalculatorRichArticle } from "./calc/CalculatorRichArticle";
import { AdBanner } from "./ads/AdBanner";
import { TruncatedText } from "./calc/CalcVisuals";

interface Props { lang: "en" | "ru"; }

type KeyVariant = "num" | "op" | "eq" | "fn" | "sci";

export default function BasicCalculatorPage({ lang }: Props) {
  const t  = translations[lang].calculators.basic as typeof translations.en.calculators.basic;
  const gl = translations[lang];
  const inputRef = useRef<HTMLInputElement>(null);

  const [expr,      setExpr]      = useState("");
  const [result,    setResult]    = useState<string | null>(null);
  const [err,       setErr]       = useState<string | null>(null);
  const [history,   setHistory]   = useState<string[]>([]);
  const [memory,    setMemory]    = useState(0);
  const [lastValue, setLastValue] = useState<number | null>(null);

  const append = useCallback((s: string) => {
    setErr(null); setResult(null);
    const el = inputRef.current;
    if (el && typeof el.selectionStart === "number") {
      const start = el.selectionStart!, end = el.selectionEnd ?? start;
      setExpr(v => v.slice(0, start) + s + v.slice(end));
      requestAnimationFrame(() => { el.focus(); const p = start + s.length; el.setSelectionRange(p, p); });
    } else {
      setExpr(e => e + s);
    }
  }, [expr]);

  const clearAll = () => { setExpr(""); setResult(null); setErr(null); };

  const back = () => {
    setErr(null); setResult(null);
    const el = inputRef.current;
    if (el && el.selectionStart === el.selectionEnd && el.selectionStart! > 0) {
      const p = el.selectionStart!;
      setExpr(e => e.slice(0, p - 1) + e.slice(p));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(p - 1, p - 1); });
    } else {
      setExpr(e => e.slice(0, -1));
    }
  };

  const runEval = () => {
    setErr(null);
    const r = evaluateExpression(expr);
    if (!r.ok) { setResult(null); setErr(r.message); return; }
    const shown = roundDisplay(r.value);
    setResult(shown);
    setLastValue(r.value);
    setHistory(h => [`${expr} = ${shown}`, ...h].slice(0, 25));
    setExpr(shown);
    requestAnimationFrame(() => { const el = inputRef.current; if (el) { el.focus(); el.setSelectionRange(shown.length, shown.length); } });
  };

  const Btn = ({
    children, onClick, variant = "num",
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: KeyVariant;
  }) => (
    <button type="button" className={`fc-basic-key fc-basic-key--${variant}`} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <div className="fc-calc-page">
      <div className="fc-calc-header">
        <h2>
          <i className="fa-solid fa-calculator me-2 fc-calc-header-icon"></i>
          {t.title}
        </h2>
        <p>{t.desc}</p>
      </div>

      <AdBanner slot="calc-basic" />

      <div className="row g-0">
        <div className="col-lg-6 fc-form-section">
          <div className="fc-basic-display">
            {err ? (
              <div className="fc-basic-display__line fc-basic-display__line--err">⚠ {err}</div>
            ) : result ? (
              <div className="fc-basic-display__line fc-basic-display__line--ok">
                = <TruncatedText text={result} />
              </div>
            ) : null}
            <input
              ref={inputRef}
              type="text"
              className={`fc-basic-display__input${err ? " fc-basic-display__input--err" : ""}`}
              value={expr}
              placeholder="0"
              onChange={e => { setErr(null); setResult(null); setExpr(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); runEval(); } }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="fc-basic-sci-row">
            <Btn variant="fn" onClick={() => setMemory(0)}>MC</Btn>
            <Btn variant="fn" onClick={() => { setExpr(roundDisplay(memory)); setErr(null); setResult(null); }}>MR</Btn>
            <Btn variant="fn" onClick={() => lastValue !== null && setMemory(m => m + lastValue)}>M+</Btn>
            <Btn variant="fn" onClick={() => lastValue !== null && setMemory(m => m - lastValue)}>M−</Btn>
            <Btn variant="fn" onClick={clearAll}>C</Btn>
            <Btn variant="fn" onClick={back}>
              <i className="fa-solid fa-delete-left fc-basic-back-icon"></i>
            </Btn>
          </div>

          <div className="fc-basic-divider"></div>

          <div className="fc-basic-sci-row">
            <Btn variant="sci" onClick={() => append("sin(")}>sin</Btn>
            <Btn variant="sci" onClick={() => append("cos(")}>cos</Btn>
            <Btn variant="sci" onClick={() => append("tan(")}>tan</Btn>
            <Btn variant="sci" onClick={() => append("log(")}>log</Btn>
            <Btn variant="sci" onClick={() => append("ln(")}>ln</Btn>
          </div>

          <div className="fc-basic-sci-row">
            <Btn variant="sci" onClick={() => append("sqrt(")}>√</Btn>
            <Btn variant="sci" onClick={() => append("pct(")}>pct</Btn>
            <Btn variant="op"  onClick={() => append("^")}>x^n</Btn>
            <Btn variant="op"  onClick={() => append("!")}>n!</Btn>
            <Btn variant="op"  onClick={() => append("(")}>(</Btn>
            <Btn variant="op"  onClick={() => append(")")}>)</Btn>
          </div>

          <div className="fc-basic-sci-row">
            <Btn variant="fn"  onClick={() => append("pi")}>π</Btn>
            <Btn variant="fn"  onClick={() => append("e")}>e</Btn>
            <Btn variant="op"  onClick={() => append("×")}>×</Btn>
            <Btn variant="op"  onClick={() => append("÷")}>÷</Btn>
            <Btn variant="op"  onClick={() => append("%")}>%</Btn>
          </div>

          <div className="fc-basic-divider fc-basic-divider--spaced"></div>

          <div className="fc-basic-num-row">
            <Btn onClick={() => append("7")}>7</Btn>
            <Btn onClick={() => append("8")}>8</Btn>
            <Btn onClick={() => append("9")}>9</Btn>
            <Btn variant="op" onClick={() => append("−")}>−</Btn>
          </div>
          <div className="fc-basic-num-row">
            <Btn onClick={() => append("4")}>4</Btn>
            <Btn onClick={() => append("5")}>5</Btn>
            <Btn onClick={() => append("6")}>6</Btn>
            <Btn variant="op" onClick={() => append("+")}>+</Btn>
          </div>
          <div className="fc-basic-num-row">
            <Btn onClick={() => append("1")}>1</Btn>
            <Btn onClick={() => append("2")}>2</Btn>
            <Btn onClick={() => append("3")}>3</Btn>
            <Btn variant="op" onClick={() => append("÷")}>÷</Btn>
          </div>

          <div className="fc-basic-num-row-bottom">
            <Btn onClick={() => append("0")}>0</Btn>
            <Btn onClick={() => append(".")}>.</Btn>
            <Btn variant="eq" onClick={runEval}>
              <i className="fa-solid fa-equals me-1 fc-basic-eq-icon"></i>
              {t.calculate}
            </Btn>
          </div>

          <CalculatorRichArticle id="basic" lang={lang} />
        </div>

        <div className="col-lg-6 fc-results-section">
          <p className="fc-section-label">
            <i className="fa-solid fa-square-poll-vertical"></i>
            {t.results}
          </p>

          {result !== null && !err ? (
            <div className="fc-result-box fc-animate mb-3">
              <div className="fc-result-metric">
                <span className="metric-label">{lang === "ru" ? "Значение" : "Value"}</span>
                <TruncatedText text={result} className="metric-value fc-basic-metric-value" />
              </div>
              {memory !== 0 && (
                <div className="fc-result-metric fc-basic-memory-metric">
                  <span className="metric-label">Memory (M)</span>
                  <TruncatedText text={roundDisplay(memory)} className="metric-value fc-basic-memory-value" />
                </div>
              )}
            </div>
          ) : (
            <div className="fc-result-box mb-3">
              <div className="fc-result-empty">
                <span className="empty-icon"><i className="fa-solid fa-calculator"></i></span>
                <p>{lang === "ru" ? "Введите выражение и нажмите Вычислить." : "Enter an expression and press Calculate."}</p>
              </div>
            </div>
          )}

          <div className="fc-info-box mb-3 fc-basic-func-box">
            <div className="fc-basic-func-head">
              <i className="fa-solid fa-table-list"></i>
              {t.funcTitle}
            </div>
            <div className="fc-basic-func-scroll">
              <table className="fc-basic-func-table">
                <tbody>
                  {t.funcRows.map((row, i) => (
                    <tr key={i}>
                      <td className="fc-basic-func-sym">{row.sym}</td>
                      <td className="fc-basic-func-desc">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="fc-basic-func-foot">{t.funcFoot}</div>
          </div>

          <div className="fc-basic-history-bar">
            <span className="fc-section-label mb-0 fc-basic-section-label-plain">
              <i className="fa-solid fa-clock-rotate-left"></i>
              {t.history}
            </span>
            {history.length > 0 && (
              <button type="button" className="fc-basic-clear-history" onClick={() => setHistory([])}>
                {t.clearHistory}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="fc-basic-history-empty">
              <p>{lang === "ru" ? "История пуста" : "No history yet"}</p>
            </div>
          ) : (
            <div className="fc-basic-history-list">
              {history.map((line, i) => (
                <div
                  key={i}
                  className="fc-basic-history-item"
                  onClick={() => {
                    const val = line.split(" = ").pop() ?? "";
                    setExpr(val); setErr(null); setResult(null);
                  }}
                >
                  <i className="fa-solid fa-clock-rotate-left me-2 fc-basic-history-item-icon"></i>
                  <TruncatedText text={line} className="fc-basic-history-item-text" />
                </div>
              ))}
            </div>
          )}

          <div className="fc-info-box mt-3">
            <div className="fc-info-title">
              <i className="fa-solid fa-book-open fc-info-icon--sky"></i>
              {gl.howToUse}
            </div>
            <p>{t.how}</p>
          </div>

          <AdBanner slot="calc-basic-mid" />
        </div>
      </div>
    </div>
  );
}
