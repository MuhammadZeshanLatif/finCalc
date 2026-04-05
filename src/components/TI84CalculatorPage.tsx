import { useState, useRef, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";

type ScreenMode = "home" | "yeq" | "graph" | "table";
interface TextLine { text: string; align: "left" | "right"; dim?: boolean; color?: string; }
interface Win { xMin: number; xMax: number; xScale: number; yMin: number; yMax: number; yScale: number; }

const GRAPH_COLORS = ["#2563EB", "#DC2626", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
const DEFAULT_WIN: Win = { xMin: -10, xMax: 10, xScale: 1, yMin: -10, yMax: 10, yScale: 1 };

function safeEval(expr: string, scope: Record<string, number> = {}): number | null {
  try {
    const r = evaluate(expr, scope);
    return typeof r === "number" && isFinite(r) ? r : null;
  } catch { return null; }
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1e10 || (Math.abs(n) < 1e-9 && n !== 0))
    return n.toExponential(6).toUpperCase();
  return parseFloat(n.toPrecision(10)).toString();
}

// ─── Graph Canvas ────────────────────────────────────────
function GraphCanvas({ fns, win }: { fns: string[]; win: Win }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    const tx = (x: number) => ((x - win.xMin) / (win.xMax - win.xMin)) * W;
    const ty = (y: number) => H - ((y - win.yMin) / (win.yMax - win.yMin)) * H;

    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 0.8;
    for (let x = Math.ceil(win.xMin / win.xScale) * win.xScale; x <= win.xMax; x += win.xScale) {
      ctx.beginPath(); ctx.moveTo(tx(x), 0); ctx.lineTo(tx(x), H); ctx.stroke();
    }
    for (let y = Math.ceil(win.yMin / win.yScale) * win.yScale; y <= win.yMax; y += win.yScale) {
      ctx.beginPath(); ctx.moveTo(0, ty(y)); ctx.lineTo(W, ty(y)); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5;
    const ay = ty(0); if (ay >= 0 && ay <= H) { ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke(); }
    const ax = tx(0); if (ax >= 0 && ax <= W) { ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke(); }

    // tick marks + labels
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 1;
    ctx.fillStyle = "#6b7280"; ctx.font = "9px Arial";
    for (let x = Math.ceil(win.xMin / win.xScale) * win.xScale; x <= win.xMax; x += win.xScale) {
      const cx = tx(x); const clampY = Math.max(0, Math.min(H, ay));
      ctx.beginPath(); ctx.moveTo(cx, clampY - 4); ctx.lineTo(cx, clampY + 4); ctx.stroke();
      if (x !== 0) ctx.fillText(String(x), cx - 6, clampY + 14);
    }
    for (let y = Math.ceil(win.yMin / win.yScale) * win.yScale; y <= win.yMax; y += win.yScale) {
      const cy = ty(y); const clampX = Math.max(0, Math.min(W, ax));
      ctx.beginPath(); ctx.moveTo(clampX - 4, cy); ctx.lineTo(clampX + 4, cy); ctx.stroke();
      if (y !== 0) ctx.fillText(String(y), clampX + 6, cy + 4);
    }

    // plot functions
    fns.forEach((fn, idx) => {
      if (!fn.trim()) return;
      ctx.strokeStyle = GRAPH_COLORS[idx % GRAPH_COLORS.length];
      ctx.lineWidth = 2.2; ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= W * 2; i++) {
        const x = win.xMin + (i / (W * 2)) * (win.xMax - win.xMin);
        const y = safeEval(fn, { x });
        if (y === null) { pen = false; continue; }
        const cx = (i / (W * 2)) * W, cy = ty(y);
        if (!pen) { ctx.moveTo(cx, cy); pen = true; } else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    });
  }, [fns, win]);

  return <canvas ref={ref} width={290} height={170} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ─── Main Component ──────────────────────────────────────
export default function TI84CalculatorPage() {
  const [screen, setScreen] = useState<ScreenMode>("home");
  const [is2nd, setIs2nd]   = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [expr, setExpr]     = useState("");
  const [lines, setLines]   = useState<TextLine[]>([
    { text: "TI-84 Plus CE", align: "left", dim: true },
    { text: "5.7.2.0016", align: "right", dim: true },
    { text: "", align: "left" },
    { text: "RAM Cleared", align: "right" },
  ]);
  const [ans, setAns]       = useState<number | null>(null);
  const [yFns, setYFns]     = useState(["x^2", "", "", "", "", ""]);
  const [ySel, setYSel]     = useState(0);
  const [win, setWin]       = useState<Win>(DEFAULT_WIN);
  const [winEdit, setWinEdit] = useState<Record<string, string>>({});
  const [winEditing, setWinEditing] = useState<string | null>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  // ── Core actions ─────────────────────────────────────────
  const typeChar = useCallback((ch: string) => {
    if (screen === "yeq") {
      setYFns(p => { const n = [...p]; n[ySel] += ch; return n; });
    } else {
      setExpr(p => p + ch);
    }
    setIs2nd(false); setIsAlpha(false);
  }, [screen, ySel]);

  const doDelete = useCallback(() => {
    if (screen === "yeq") setYFns(p => { const n = [...p]; n[ySel] = n[ySel].slice(0, -1); return n; });
    else setExpr(p => p.slice(0, -1));
  }, [screen, ySel]);

  const doClear = useCallback(() => {
    if (screen === "yeq") setYFns(p => { const n = [...p]; n[ySel] = ""; return n; });
    else if (expr) setExpr("");
    else setLines([]);
    setIs2nd(false); setIsAlpha(false);
  }, [screen, ySel, expr]);

  const doEnter = useCallback(() => {
    if (screen === "yeq") { setYSel(s => Math.min(5, s + 1)); return; }
    if (screen === "graph" || screen === "table") return;
    if (!expr.trim()) return;
    const ev = expr.replace(/Ans/g, ans !== null ? String(ans) : "0");
    const result = safeEval(ev);
    const newLines: TextLine[] = [
      ...lines.slice(-8),
      { text: expr, align: "left" },
      result !== null
        ? { text: fmt(result), align: "right" }
        : { text: "ERR:SYNTAX", align: "right", color: "#ef4444" },
    ];
    setLines(newLines);
    if (result !== null) setAns(result);
    setExpr("");
  }, [screen, expr, ans, lines]);

  const press = useCallback((primary: string, secondary?: string, alpha?: string) => {
    const val = (is2nd && secondary) ? secondary : (isAlpha && alpha) ? alpha : primary;
    typeChar(val);
  }, [is2nd, isAlpha, typeChar]);

  // ── Keyboard support ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key;
      if (k === "Enter" || k === "=") { e.preventDefault(); doEnter(); return; }
      if (k === "Backspace") { e.preventDefault(); doDelete(); return; }
      if (k === "Escape" || k === "Delete") { e.preventDefault(); doClear(); return; }
      if (k === "ArrowUp")   { e.preventDefault(); if (screen === "yeq") setYSel(s => Math.max(0, s - 1)); return; }
      if (k === "ArrowDown") { e.preventDefault(); if (screen === "yeq") setYSel(s => Math.min(5, s + 1)); return; }
      // digits, operators, parens, dot
      if (/^[0-9]$/.test(k))              { e.preventDefault(); typeChar(k); return; }
      if (k === "." || k === ",")         { e.preventDefault(); typeChar("."); return; }
      if (k === "+")                      { e.preventDefault(); typeChar("+"); return; }
      if (k === "-")                      { e.preventDefault(); typeChar("-"); return; }
      if (k === "*")                      { e.preventDefault(); typeChar("*"); return; }
      if (k === "/")                      { e.preventDefault(); typeChar("/"); return; }
      if (k === "^")                      { e.preventDefault(); typeChar("^"); return; }
      if (k === "(")                      { e.preventDefault(); typeChar("("); return; }
      if (k === ")")                      { e.preventDefault(); typeChar(")"); return; }
      // letter shortcuts
      if (k.toLowerCase() === "s")        { e.preventDefault(); typeChar(e.shiftKey ? "sin(" : "sin("); return; }
      if (k.toLowerCase() === "c")        { e.preventDefault(); typeChar("cos("); return; }
      if (k.toLowerCase() === "t")        { e.preventDefault(); typeChar("tan("); return; }
      if (k.toLowerCase() === "l")        { e.preventDefault(); typeChar(e.shiftKey ? "log(" : "log("); return; }
      if (k.toLowerCase() === "n")        { e.preventDefault(); typeChar("ln("); return; }
      if (k.toLowerCase() === "r")        { e.preventDefault(); typeChar("sqrt("); return; }
      if (k.toLowerCase() === "p")        { e.preventDefault(); typeChar("pi"); return; }
      if (k.toLowerCase() === "e")        { e.preventDefault(); typeChar("e"); return; }
      if (k.toLowerCase() === "x")        { e.preventDefault(); typeChar("x"); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doEnter, doDelete, doClear, typeChar, screen]);

  // ── Screen renderer ──────────────────────────────────────
  const renderScreen = () => {
    if (screen === "graph") return (
      <div className="ti84-screen ti84-screen--graph">
        <GraphCanvas fns={yFns} win={win} />
      </div>
    );

    if (screen === "yeq") return (
      <div className="ti84-screen ti84-screen--text">
        <div className="ti84-screen-title">Y= FUNCTIONS</div>
        {yFns.map((fn, i) => (
          <div key={i} className={`ti84-yeq-row${i === ySel ? " ti84-yeq-row--active" : ""}`} onClick={() => setYSel(i)}>
            <span className="ti84-yeq-label" style={{ color: GRAPH_COLORS[i] }}>Y{i + 1}=</span>
            <span className="ti84-yeq-fn">{fn}</span>
            {i === ySel && <span className="ti84-cur">█</span>}
          </div>
        ))}
      </div>
    );

    if (screen === "table") {
      const fields: (keyof Win)[] = ["xMin", "xMax", "xScale", "yMin", "yMax", "yScale"];
      return (
        <div className="ti84-screen ti84-screen--text">
          <div className="ti84-screen-title">WINDOW</div>
          {fields.map(f => (
            <div key={f} className="ti84-win-row" onClick={() => { setWinEditing(f); setWinEdit(p => ({ ...p, [f]: String(win[f]) })); }}>
              <span className="ti84-win-label">{f}=</span>
              {winEditing === f
                ? <input autoFocus className="ti84-win-input" value={winEdit[f] ?? ""} onChange={e => setWinEdit(p => ({ ...p, [f]: e.target.value }))} onBlur={() => { const v = parseFloat(winEdit[f] ?? ""); if (!isNaN(v)) setWin(p => ({ ...p, [f]: v })); setWinEditing(null); }} onKeyDown={e => { if (e.key === "Enter") { const v = parseFloat(winEdit[f] ?? ""); if (!isNaN(v)) setWin(p => ({ ...p, [f]: v })); setWinEditing(null); } }} />
                : <span className="ti84-win-val">{win[f]}</span>}
            </div>
          ))}
        </div>
      );
    }

    // home
    const display = [...lines.slice(-7)];
    while (display.length < 7) display.unshift({ text: "", align: "left" });
    return (
      <div className="ti84-screen ti84-screen--text">
        {display.map((ln, i) => (
          <div key={i} className={`ti84-line ti84-line--${ln.align}${ln.dim ? " ti84-line--dim" : ""}`} style={ln.color ? { color: ln.color } : {}}>
            {ln.text}
          </div>
        ))}
        <div className="ti84-input-row">
          <span className="ti84-input-expr">{expr}</span>
          <span className="ti84-cur">█</span>
        </div>
      </div>
    );
  };

  // ── Key button component ─────────────────────────────────
  const K = ({
    label, top, alpha: al, v = "dark", wide, onClick,
  }: {
    label: React.ReactNode; top?: string; alpha?: string;
    v?: "dark"|"num"|"op"|"blue"|"green"|"enter"|"fkey"|"on";
    wide?: boolean; onClick: () => void;
  }) => (
    <button className={`ti84k ti84k--${v}${wide ? " ti84k--wide" : ""}`} onClick={onClick} type="button">
      {(top || al) && (
        <span className="ti84k-top">
          {top && <span className="ti84k-top-blue">{top}</span>}
          {al  && <span className="ti84k-top-green">{al}</span>}
        </span>
      )}
      <span className="ti84k-label">{label}</span>
    </button>
  );

  return (
    <div className="ti84-page" ref={calcRef} tabIndex={0}>
      <div className="ti84-calc">

        {/* Brand */}
        <div className="ti84-brand">
          <div className="ti84-brand-left">
            <svg width="20" height="16" viewBox="0 0 20 16">
              <ellipse cx="10" cy="8" rx="9" ry="7" fill="none" stroke="#fff" strokeWidth="1.3"/>
              <path d="M4 10 Q10 4 16 10" fill="none" stroke="#fff" strokeWidth="1.3"/>
              <path d="M3 12 Q10 16 17 12" fill="none" stroke="#fff" strokeWidth="1.3"/>
              <line x1="10" y1="1" x2="10" y2="15" stroke="#fff" strokeWidth="0.8"/>
            </svg>
            <span className="ti84-brand-ti">TEXAS INSTRUMENTS</span>
          </div>
          <div className="ti84-brand-model">
            <span className="ti84-brand-num">TI-84 Plus</span>
            <span className="ti84-brand-ce"> CE</span>
          </div>
        </div>

        {/* Status */}
        <div className="ti84-status">
          <span>NORMAL</span><span>FLOAT</span><span>AUTO</span>
          <span>REAL</span><span>RADIAN</span><span>MP</span>
          <span className="ti84-bat"><span className="ti84-bat-fill"/></span>
        </div>

        {renderScreen()}

        {/* Keyboard hint */}
        <div className="ti84-kb-hint">
          ⌨ Type digits, +−×÷^()  |  s=sin  c=cos  t=tan  l=log  n=ln  r=√  x=x  p=π  Enter=calc
        </div>

        {/* Keys */}
        <div className="ti84-kb">

          {/* F-key row */}
          <div className="ti84-row">
            {[
              { top: "statplt f1", label: "y=",     act: screen==="yeq",   fn: () => setScreen("yeq") },
              { top: "tblset f2",  label: "window",  act: screen==="table", fn: () => setScreen("table") },
              { top: "format f3",  label: "zoom",    act: false,            fn: () => {} },
              { top: "calc f4",    label: "trace",   act: false,            fn: () => {} },
              { top: "table f5",   label: "graph",   act: screen==="graph", fn: () => setScreen("graph") },
            ].map(k => (
              <button key={k.label} type="button"
                className={`ti84k ti84k--fkey${k.act ? " ti84k--fkey-active" : ""}`}
                onClick={k.fn}>
                <span className="ti84k-fkey-top">{k.top}</span>
                <span className="ti84k-label">{k.label}</span>
              </button>
            ))}
          </div>

          {/* 2nd/mode/del + D-pad */}
          <div className="ti84-split-row">
            <div className="ti84-split-left">
              <div className="ti84-row">
                <button type="button" className={`ti84k ti84k--blue${is2nd?" ti84k--lit":""}`}
                  onClick={() => { setIs2nd(p=>!p); setIsAlpha(false); }}>
                  <span className="ti84k-label">2nd</span>
                </button>
                <K label="mode" top="quit"  v="dark" onClick={() => { setScreen("home"); setExpr(""); setIs2nd(false); setIsAlpha(false); }} />
                <K label="del"  top="ins"   v="dark" onClick={doDelete} />
              </div>
              <div className="ti84-row">
                <button type="button" className={`ti84k ti84k--green${isAlpha?" ti84k--lit":""}`}
                  onClick={() => { setIsAlpha(p=>!p); setIs2nd(false); }}>
                  <span className="ti84k-top"><span className="ti84k-top-green">A-lock</span></span>
                  <span className="ti84k-label">alpha</span>
                </button>
                <K label="X,T,θ,n" top="link" al="S" v="dark" onClick={() => press("x", undefined, "S")} />
                <K label="stat"     top="list"          v="dark" onClick={() => typeChar("stat")} />
              </div>
            </div>

            {/* D-pad */}
            <div className="ti84-dpad">
              <div className="ti84-dpad-ring">
                <button type="button" className="ti84-dpad-btn ti84-dpad-up"    onClick={() => screen==="yeq" && setYSel(s=>Math.max(0,s-1))}>▲</button>
                <button type="button" className="ti84-dpad-btn ti84-dpad-right" onClick={() => {}}>▶</button>
                <button type="button" className="ti84-dpad-btn ti84-dpad-down"  onClick={() => screen==="yeq" && setYSel(s=>Math.min(5,s+1))}>▼</button>
                <button type="button" className="ti84-dpad-btn ti84-dpad-left"  onClick={() => {}}>◀</button>
                <button type="button" className="ti84-dpad-center" onClick={doEnter} />
              </div>
            </div>
          </div>

          {/* math apps prgm vars clear */}
          <div className="ti84-row">
            <K label="math"  top="test"  al="A" v="dark" onClick={() => typeChar("math(")} />
            <K label="apps"  top="angle" al="B" v="dark" onClick={() => typeChar("")} />
            <K label="prgm"  top="draw"  al="C" v="dark" onClick={() => typeChar("")} />
            <K label="vars"  top="distr"         v="dark" onClick={() => typeChar("")} />
            <K label="clear"                      v="dark" onClick={doClear} />
          </div>

          {/* x⁻¹ sin cos tan ^ */}
          <div className="ti84-row">
            <K label="x⁻¹"  top="matrix" al="D" v="dark" onClick={() => press("^(-1)")} />
            <K label="sin"   top="sin⁻¹"  al="E" v="dark" onClick={() => press("sin(", "asin(", "E")} />
            <K label="cos"   top="cos⁻¹"  al="F" v="dark" onClick={() => press("cos(", "acos(", "F")} />
            <K label="tan"   top="tan⁻¹"  al="G" v="dark" onClick={() => press("tan(", "atan(", "G")} />
            <K label="^"     top="π"       al="H" v="dark" onClick={() => press("^",    "pi",    "H")} />
          </div>

          {/* x² , ( ) ÷ */}
          <div className="ti84-row">
            <K label="x²"  top="√"   al="I" v="dark" onClick={() => press("^2", "sqrt(", "I")} />
            <K label=","    top="EE"  al="J" v="dark" onClick={() => press(",",  undefined, "J")} />
            <K label="("    top="{"   al="K" v="dark" onClick={() => press("(",  undefined, "K")} />
            <K label=")"    top="}"   al="L" v="dark" onClick={() => press(")",  undefined, "L")} />
            <K label="÷"    top="e"   al="M" v="op"  onClick={() => typeChar("/")} />
          </div>

          {/* log 7 8 9 × */}
          <div className="ti84-row">
            <K label="log"  top="10ˣ" al="N" v="dark" onClick={() => press("log10(", "10^(", "N")} />
            <K label="7"    top="u"   al="O" v="num"  onClick={() => press("7")} />
            <K label="8"    top="v"   al="P" v="num"  onClick={() => press("8")} />
            <K label="9"    top="w"   al="Q" v="num"  onClick={() => press("9")} />
            <K label="×"    top="["   al="R" v="op"   onClick={() => typeChar("*")} />
          </div>

          {/* ln 4 5 6 − */}
          <div className="ti84-row">
            <K label="ln"   top="eˣ"  al="S" v="dark" onClick={() => press("log(",  "exp(", "S")} />
            <K label="4"    top="L4"  al="T" v="num"  onClick={() => press("4")} />
            <K label="5"    top="L5"  al="U" v="num"  onClick={() => press("5")} />
            <K label="6"    top="L6"  al="V" v="num"  onClick={() => press("6")} />
            <K label="−"               al="W" v="op"   onClick={() => typeChar("-")} />
          </div>

          {/* sto→ 1 2 3 + */}
          <div className="ti84-row">
            <K label="sto→" top="rcl" al="X" v="dark" onClick={() => typeChar("→")} />
            <K label="1"    top="L1"  al="Y" v="num"  onClick={() => press("1")} />
            <K label="2"    top="L2"  al="Z" v="num"  onClick={() => press("2")} />
            <K label="3"    top="L3"  al="θ" v="num"  onClick={() => press("3")} />
            <K label="+"    top="mem" al={'"'} v="op"  onClick={() => typeChar("+")} />
          </div>

          {/* on 0 . (-) enter */}
          <div className="ti84-row">
            <K label="on"   top="off"     v="on"    onClick={() => {
              setExpr(""); setLines([{ text: "TI-84 Plus CE", align:"left", dim:true }, { text:"5.7.2.0016", align:"right", dim:true }, { text:"", align:"left" }, { text:"RAM Cleared", align:"right" }]);
              setAns(null); setIs2nd(false); setIsAlpha(false); setScreen("home");
            }} />
            <K label="0"   top="catalog" al="i"    v="num" onClick={() => press("0")} />
            <K label="."   top=","       al=":"    v="num" onClick={() => press(".")} />
            <K label="(-)" top="ans"     al="?"    v="num" onClick={() => press("(-", ans!==null ? String(ans) : "Ans", "?")} />
            <K label="enter" top="entry" al="solve" v="enter" wide onClick={doEnter} />
          </div>
        </div>

        {/* Mode indicator */}
        {(is2nd || isAlpha) && (
          <div className={`ti84-mode-pill ti84-mode-pill--${is2nd ? "blue" : "green"}`}>
            {is2nd ? "2ND" : "ALPHA"} — press a key
          </div>
        )}
      </div>
    </div>
  );
}
