import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { evaluate } from "mathjs";
import { buildPathname } from "../utils/routes";

const GRAPHING_GUIDE_BLOG_SLUG = {
  en: "what-is-graphing-calculator",
  ru: "chto-takoe-graficheskiy-kalkulyator",
} as const;

// ── Constants ─────────────────────────────────────────────────
const COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2"];
const DEFAULT_WIN = { xMin: -10, xMax: 10, yMin: -7, yMax: 7 };
const MAX_TABLE_POINTS_DRAW = 4000;
const FS_HINT_SESSION_KEY = "finCalc_dg_fs_hint_v1";

type Win = typeof DEFAULT_WIN;
type TracePoint = { x: number; y: number; ci: number } | null;

type TablePointCell = { id: string; x: string; y: string };
type LayerExprRow = { id: string; kind: "expr"; expr: string; enabled: boolean };
type LayerTableRow = { id: string; kind: "table"; enabled: boolean; points: TablePointCell[] };
type LayerRow = LayerExprRow | LayerTableRow;

type InferenceId =
  | "prob-dist"
  | "z-test"
  | "t-test"
  | "z-prop"
  | "chi2-indep"
  | "chi2-gof";

function newRowId(): string {
  return `r${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseTablePoint(p: { x: string; y: string }): { x: number; y: number } | null {
  const x = parseFloat(p.x.trim());
  const y = parseFloat(p.y.trim());
  if (!isFinite(x) || !isFinite(y)) return null;
  return { x, y };
}

function newPointCell(x = "", y = ""): TablePointCell {
  return { id: newRowId(), x, y };
}

/** mathjs may return number, BigNumber, Fraction, etc. */
function asFiniteNumber(val: unknown): number | null {
  if (typeof val === "number" && isFinite(val)) return val;
  if (val != null && typeof val === "object" && "toNumber" in val && typeof (val as { toNumber: () => unknown }).toNumber === "function") {
    try {
      const n = (val as { toNumber: () => number }).toNumber();
      return typeof n === "number" && isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
  const n = Number(val);
  return isFinite(n) ? n : null;
}

const WIN_MIN_SPAN = 1e-6;

function normalizeWin(w: Win): Win {
  let { xMin, xMax, yMin, yMax } = w;
  if (![xMin, xMax, yMin, yMax].every(v => isFinite(v))) return DEFAULT_WIN;
  if (xMin > xMax) [xMin, xMax] = [xMax, xMin];
  if (yMin > yMax) [yMin, yMax] = [yMax, yMin];
  if (xMax - xMin < WIN_MIN_SPAN) {
    const c = (xMin + xMax) / 2;
    xMin = c - 0.01;
    xMax = c + 0.01;
  }
  if (yMax - yMin < WIN_MIN_SPAN) {
    const c = (yMin + yMax) / 2;
    yMin = c - 0.01;
    yMax = c + 0.01;
  }
  return { xMin, xMax, yMin, yMax };
}

// ── Helpers ───────────────────────────────────────────────────
function safeY(expr: string, x: number): number | null {
  if (!expr.trim()) return null;
  try {
    const r = evaluate(expr, { x });
    return asFiniteNumber(r);
  } catch { return null; }
}

function niceStep(range: number): number {
  if (!range || !isFinite(range)) return 1;
  const raw = Math.abs(range) / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}

function fmt(n: number): string {
  if (!isFinite(n)) return "undef";
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-4 && n !== 0))
    return n.toExponential(3);
  return parseFloat(n.toPrecision(6)).toString();
}

function traceLabel(rows: LayerRow[], ci: number, isRu: boolean): string {
  const r = rows[ci];
  if (!r) return "";
  if (r.kind === "expr") {
    const n = rows.slice(0, ci + 1).filter(x => x.kind === "expr").length;
    return `y${n}`;
  }
  const n = rows.slice(0, ci + 1).filter(x => x.kind === "table").length;
  return isRu ? `Табл.${n}` : `Tbl${n}`;
}

// ── Main Component ────────────────────────────────────────────
export default function DesmosCalculatorPage({
  lang,
  onNavigate,
}: {
  lang: "en" | "ru";
  onNavigate?: (page: string, opts?: { blogSlug?: string | null }) => void;
}) {
  const isRu = lang === "ru";

  const [rows, setRows] = useState<LayerRow[]>(() => [
    { id: newRowId(), kind: "expr", expr: "sin(x)", enabled: true },
    { id: newRowId(), kind: "expr", expr: "x^2 / 4 - 2", enabled: true },
  ]);
  const [win, setWin]             = useState<Win>(DEFAULT_WIN);
  const [trace, setTrace]         = useState<TracePoint>(null);
  const [isFullscreen, setIsFs]   = useState(false);
  const [tab, setTab]             = useState<"graph" | "table">("graph");
  const [tableStart, setTblStart] = useState("-5");
  const [tableStep, setTblStep]   = useState("1");
  const [tableRows, setTblRows]   = useState("15");
  const [winEdit, setWinEdit]     = useState<Record<string, string>>({});
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 480 });
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [inferenceSidebarOpen, setInferenceSidebarOpen] = useState(false);
  const [selectedInference, setSelectedInference] = useState<InferenceId | null>(null);
  const [fsHintActive, setFsHintActive] = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const pageRef      = useRef<HTMLDivElement>(null);
  const addMenuRef   = useRef<HTMLDivElement>(null);
  const inferenceRef = useRef<HTMLDivElement>(null);
  const dragRef      = useRef<{ cx: number; cy: number; win: Win } | null>(null);
  const touchRef     = useRef<{ x: number; y: number; dist: number; win: Win } | null>(null);
  const inputRefs    = useRef<Record<string, HTMLInputElement | null>>({});

  const activeExprRow = useMemo(
    () => rows.find(r => r.id === activeRowId && r.kind === "expr") as LayerExprRow | undefined,
    [rows, activeRowId],
  );

  // Keep view window numerically valid (avoid NaN / zero-width / inverted axes)
  useEffect(() => {
    const n = normalizeWin(win);
    if (
      n.xMin !== win.xMin ||
      n.xMax !== win.xMax ||
      n.yMin !== win.yMin ||
      n.yMax !== win.yMax
    ) {
      setWin(n);
    }
  }, [win]);

  // ── Resize observer → sync canvas dimensions ─────────────────
  useEffect(() => {
    if (tab !== "graph") return;
    const el = wrapRef.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      const fw = Math.floor(w);
      const fh = Math.floor(h);
      if (fw > 0 && fh > 0) setCanvasSize({ w: fw, h: fh });
    };
    apply(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(entries => {
      const e = entries[0];
      if (e) apply(e.contentRect.width, e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  // ── Escape key ────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFs(false);
        setAddMenuOpen(false);
        setInferenceSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Close add menu on outside click ───────────────────────────
  useEffect(() => {
    if (!addMenuOpen) return;
    const fn = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [addMenuOpen]);

  useEffect(() => {
    if (!inferenceSidebarOpen) return;
    inferenceRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [inferenceSidebarOpen]);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(FS_HINT_SESSION_KEY)) setFsHintActive(true);
    } catch {
      setFsHintActive(true);
    }
  }, []);

  const dismissFsHint = useCallback(() => {
    try {
      sessionStorage.setItem(FS_HINT_SESSION_KEY, "1");
    } catch { /* ignore */ }
    setFsHintActive(false);
  }, []);

  useEffect(() => {
    if (!fsHintActive || isFullscreen) return;
    const id = window.setTimeout(() => dismissFsHint(), 28000);
    return () => clearTimeout(id);
  }, [fsHintActive, isFullscreen, dismissFsHint]);

  // ── Canvas draw ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;

    const tx = (x: number) => ((x - win.xMin) / (win.xMax - win.xMin)) * W;
    const ty = (y: number) => H - ((y - win.yMin) / (win.yMax - win.yMin)) * H;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    const xStep = niceStep(win.xMax - win.xMin);
    const yStep = niceStep(win.yMax - win.yMin);
    ctx.lineWidth = 1;

    for (let x = Math.ceil(win.xMin / xStep) * xStep; x <= win.xMax + xStep * 0.01; x += xStep) {
      const px = tx(x);
      ctx.strokeStyle = Math.abs(x) < xStep * 0.01 ? "#334155" : "#1e293b";
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let y = Math.ceil(win.yMin / yStep) * yStep; y <= win.yMax + yStep * 0.01; y += yStep) {
      const py = ty(y);
      ctx.strokeStyle = Math.abs(y) < yStep * 0.01 ? "#334155" : "#1e293b";
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5;
    const ay = ty(0);
    if (ay >= 0 && ay <= H) { ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke(); }
    const ax = tx(0);
    if (ax >= 0 && ax <= W) { ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke(); }

    const fontSize = Math.max(10, Math.min(12, W / 65));
    ctx.fillStyle = "#475569";
    ctx.font = `${fontSize}px system-ui, sans-serif`;

    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let x = Math.ceil(win.xMin / xStep) * xStep; x <= win.xMax + xStep * 0.01; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue;
      const px = tx(x);
      if (px < 16 || px > W - 16) continue;
      ctx.fillText(fmt(x), px, Math.min(H - fontSize - 2, Math.max(2, ay + 3)));
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let y = Math.ceil(win.yMin / yStep) * yStep; y <= win.yMax + yStep * 0.01; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue;
      const py = ty(y);
      if (py < 8 || py > H - 8) continue;
      ctx.fillText(fmt(y), Math.max(fontSize * 3, Math.min(ax - 3, W - fontSize)), py);
    }

    const STEPS = Math.max(600, W * 1.5);
    rows.forEach((row, ci) => {
      if (!row.enabled) return;
      const col = COLORS[ci % COLORS.length];

      if (row.kind === "expr") {
        const expr = row.expr;
        if (!expr.trim()) return;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.beginPath();
        let pen = false;
        let prevPy: number | null = null;
        for (let i = 0; i <= STEPS; i++) {
          const x = win.xMin + (i / STEPS) * (win.xMax - win.xMin);
          const y = safeY(expr, x);
          if (y === null) { pen = false; prevPy = null; continue; }
          const px = (i / STEPS) * W;
          const py = ty(y);
          if (prevPy !== null && Math.abs(py - prevPy) > H * 1.5) { pen = false; }
          if (!pen) { ctx.moveTo(px, py); pen = true; }
          else ctx.lineTo(px, py);
          prevPy = py;
        }
        ctx.stroke();
        return;
      }

      const pts = row.points
        .map(parseTablePoint)
        .filter((v): v is { x: number; y: number } => v !== null)
        .slice(0, MAX_TABLE_POINTS_DRAW);
      if (pts.length === 0) return;

      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      pts.forEach((p, j) => {
        const px = tx(p.x);
        const py = ty(p.y);
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      ctx.fillStyle = col;
      for (const p of pts) {
        const px = tx(p.x);
        const py = ty(p.y);
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    if (trace) {
      const px = tx(trace.x);
      const py = ty(trace.y);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COLORS[trace.ci % COLORS.length];
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    }
  }, [rows, win, trace, canvasSize]);

  // ── Passive wheel fix ─────────────────────────────────────────
  useEffect(() => {
    if (tab !== "graph") return;
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const factor = e.deltaY > 0 ? 1.18 : 1 / 1.18;
      setWin(w => {
        const xR = w.xMax - w.xMin;
        const yR = w.yMax - w.yMin;
        const cx = w.xMin + mx * xR;
        const cy = w.yMin + (1 - my) * yR;
        return {
          xMin: cx - mx * xR * factor,
          xMax: cx + (1 - mx) * xR * factor,
          yMin: cy - (1 - my) * yR * factor,
          yMax: cy + my * yR * factor,
        };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [tab]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { cx: e.clientX, cy: e.clientY, win: { ...win } };
  }, [win]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const W = rect.width; const H = rect.height;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.cx;
      const dy = e.clientY - dragRef.current.cy;
      const dxM = -(dx / W) * (dragRef.current.win.xMax - dragRef.current.win.xMin);
      const dyM = (dy / H) * (dragRef.current.win.yMax - dragRef.current.win.yMin);
      setWin({
        xMin: dragRef.current.win.xMin + dxM,
        xMax: dragRef.current.win.xMax + dxM,
        yMin: dragRef.current.win.yMin + dyM,
        yMax: dragRef.current.win.yMax + dyM,
      });
      return;
    }

    const mathX = win.xMin + (mx / W) * (win.xMax - win.xMin);
    let best: TracePoint = null;
    let bestDist = 36;
    rows.forEach((row, ci) => {
      if (!row.enabled) return;
      if (row.kind === "expr") {
        if (!row.expr.trim()) return;
        const y = safeY(row.expr, mathX);
        if (y === null) return;
        const pyPx = H - ((y - win.yMin) / (win.yMax - win.yMin)) * H;
        const dist = Math.abs(pyPx - my);
        if (dist < bestDist) { bestDist = dist; best = { x: mathX, y, ci }; }
        return;
      }
      for (const p of row.points) {
        const pt = parseTablePoint(p);
        if (!pt) continue;
        const pxX = ((pt.x - win.xMin) / (win.xMax - win.xMin)) * W;
        const pyPx = H - ((pt.y - win.yMin) / (win.yMax - win.yMin)) * H;
        const dist = Math.hypot(pxX - mx, pyPx - my);
        if (dist < bestDist) { bestDist = dist; best = { x: pt.x, y: pt.y, ci }; }
      }
    });
    setTrace(best);
  }, [win, rows]);

  const onMouseUp   = useCallback(() => { dragRef.current = null; }, []);
  const onMouseLeave = useCallback(() => { dragRef.current = null; setTrace(null); }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0, win: { ...win } };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist: Math.sqrt(dx * dx + dy * dy),
        win: { ...win },
      };
    }
  }, [win]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchRef.current) return;
    const el = wrapRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const W = rect.width; const H = rect.height;

    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      const dxM = -(dx / W) * (touchRef.current.win.xMax - touchRef.current.win.xMin);
      const dyM = (dy / H) * (touchRef.current.win.yMax - touchRef.current.win.yMin);
      setWin({
        xMin: touchRef.current.win.xMin + dxM,
        xMax: touchRef.current.win.xMax + dxM,
        yMin: touchRef.current.win.yMin + dyM,
        yMax: touchRef.current.win.yMax + dyM,
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = touchRef.current.dist / (dist || 1);
      const xR = touchRef.current.win.xMax - touchRef.current.win.xMin;
      const yR = touchRef.current.win.yMax - touchRef.current.win.yMin;
      const mx = (touchRef.current.x - rect.left) / W;
      const my = (touchRef.current.y - rect.top) / H;
      const cx = touchRef.current.win.xMin + mx * xR;
      const cy = touchRef.current.win.yMin + (1 - my) * yR;
      setWin({
        xMin: cx - mx * xR * factor,
        xMax: cx + (1 - mx) * xR * factor,
        yMin: cy - (1 - my) * yR * factor,
        yMax: cy + my * yR * factor,
      });
    }
  }, []);

  const onTouchEnd = useCallback(() => { touchRef.current = null; }, []);

  const zoomIn = () => setWin(w => {
    const cx = (w.xMin + w.xMax) / 2; const cy = (w.yMin + w.yMax) / 2;
    const xR = (w.xMax - w.xMin) / 2; const yR = (w.yMax - w.yMin) / 2;
    return { xMin: cx - xR / 1.6, xMax: cx + xR / 1.6, yMin: cy - yR / 1.6, yMax: cy + yR / 1.6 };
  });

  const zoomOut = () => setWin(w => {
    const cx = (w.xMin + w.xMax) / 2; const cy = (w.yMin + w.yMax) / 2;
    const xR = (w.xMax - w.xMin) / 2; const yR = (w.yMax - w.yMin) / 2;
    return { xMin: cx - xR * 1.6, xMax: cx + xR * 1.6, yMin: cy - yR * 1.6, yMax: cy + yR * 1.6 };
  });

  const applyPreset = (preset: string) => {
    if (preset === "standard") setWin({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    else if (preset === "trig")    setWin({ xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -4, yMax: 4 });
    else if (preset === "decimal") setWin({ xMin: -4.7, xMax: 4.7, yMin: -3.1, yMax: 3.1 });
    else if (preset === "integer") setWin({ xMin: -47, xMax: 47, yMin: -31, yMax: 31 });
  };

  const insertText = (text: string) => {
    if (!activeRowId) return;
    const row = rows.find(r => r.id === activeRowId);
    if (!row || row.kind !== "expr") return;
    const input = inputRefs.current[activeRowId];
    if (!input) {
      setRows(prev => prev.map(r => (r.id === activeRowId && r.kind === "expr" ? { ...r, expr: r.expr + text } : r)));
      return;
    }
    const s = input.selectionStart ?? input.value.length;
    const e2 = input.selectionEnd ?? input.value.length;
    const newVal = input.value.slice(0, s) + text + input.value.slice(e2);
    setRows(prev => prev.map(r => (r.id === activeRowId && r.kind === "expr" ? { ...r, expr: newVal } : r)));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(s + text.length, s + text.length);
    });
  };

  const addExpression = () => {
    const id = newRowId();
    setRows(prev => [...prev, { id, kind: "expr", expr: "", enabled: true }]);
    setActiveRowId(id);
    setAddMenuOpen(false);
  };

  const addDataTable = () => {
    const id = newRowId();
    setRows(prev => [...prev, { id, kind: "table", enabled: true, points: [newPointCell(), newPointCell()] }]);
    setAddMenuOpen(false);
  };

  const removeRow = (id: string) => {
    setRows(prev => (prev.length <= 1 ? prev : prev.filter(r => r.id !== id)));
    setActiveRowId(a => (a === id ? null : a));
  };

  const tableInvalid = (() => {
    const start = parseFloat(tableStart);
    const step = parseFloat(tableStep);
    return isNaN(start) || isNaN(step) || step === 0;
  })();

  const tableRowCount = (() => {
    const n = parseInt(tableRows, 10);
    if (isNaN(n) || n < 1) return 15;
    return Math.min(100, n);
  })();

  const tableData = (() => {
    if (tableInvalid) return [];
    const start = parseFloat(tableStart);
    const step = parseFloat(tableStep);
    return Array.from({ length: tableRowCount }, (_, i) => {
      const x = start + i * step;
      const ys = rows.map(row => {
        if (row.kind !== "expr" || !row.enabled || !row.expr.trim()) return null;
        return safeY(row.expr, x);
      });
      return { x, ys };
    });
  })();

  const hasGraphContent = rows.some(r => {
    if (!r.enabled) return false;
    if (r.kind === "expr") return r.expr.trim().length > 0;
    return r.points.some(p => parseTablePoint(p) !== null);
  });

  const hasExprForValueTable = rows.some(r => r.kind === "expr" && r.enabled && r.expr.trim());

  const tableOrdinal = (rowIndex: number) =>
    rows.slice(0, rowIndex + 1).filter(r => r.kind === "table").length;

  return (
    <>
      <div className={`dg-page${isFullscreen ? " dg-page--fullscreen" : ""}`} ref={pageRef}>

        <div className="dg-panel">

          <div className="dg-panel-head dg-panel-head--toolbar">
            <div className="dg-add-wrap" ref={addMenuRef}>
              <button
                type="button"
                className="dg-add-btn"
                aria-expanded={addMenuOpen}
                aria-haspopup="menu"
                title={isRu ? "Добавить" : "Add"}
                onClick={() => setAddMenuOpen(o => !o)}
              >
                <i className="fa-solid fa-plus" />
              </button>
              {addMenuOpen && (
                <ul className="dg-add-menu" role="menu" aria-label={isRu ? "Вставка в список слоёв" : "Add to layer list"}>
                  <li className="dg-add-menu__header" aria-hidden="true">
                    {isRu ? "Вставка" : "Insert"}
                  </li>
                  <li role="none">
                    <button type="button" role="menuitem" className="dg-add-menu__item" onClick={addExpression}>
                      <span className="dg-add-menu__ico" aria-hidden="true">
                        <i className="fa-solid fa-square-root-variable" />
                      </span>
                      <span className="dg-add-menu__label">{isRu ? "Выражение f(x)" : "Expression f(x)"}</span>
                    </button>
                  </li>
                  <li role="none">
                    <button type="button" role="menuitem" className="dg-add-menu__item" onClick={addDataTable}>
                      <span className="dg-add-menu__ico" aria-hidden="true">
                        <i className="fa-solid fa-table" />
                      </span>
                      <span className="dg-add-menu__label">{isRu ? "Таблица (x, y)" : "Table (x, y)"}</span>
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="dg-add-menu__item"
                      onClick={() => { setAddMenuOpen(false); setInferenceSidebarOpen(true); }}
                    >
                      <span className="dg-add-menu__ico" aria-hidden="true">
                        <i className="fa-solid fa-chart-simple" />
                      </span>
                      <span className="dg-add-menu__label">{isRu ? "Интерфейс" : "Interface"}</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <span className="dg-panel-head__title">{isRu ? "Слои" : "Layers"}</span>
          </div>

          <div className="dg-expr-list">
            {rows.map((row, i) => {
              const ci = i;
              if (row.kind === "expr") {
                const yn = rows.slice(0, i + 1).filter(r => r.kind === "expr").length;
                return (
                  <div
                    key={row.id}
                    className={`dg-expr-row${activeRowId === row.id ? " dg-expr-row--active" : ""}`}
                  >
                    <button
                      className="dg-color-dot"
                      style={{ background: row.enabled ? COLORS[ci % COLORS.length] : "#334155" }}
                      onClick={() => setRows(prev => prev.map(r => (r.id === row.id ? { ...r, enabled: !r.enabled } : r)))}
                      title={isRu ? "Показать/скрыть" : "Toggle"}
                      aria-label={`Toggle y${yn}`}
                    />
                    <div className="dg-expr-label">y{yn}=</div>
                    <input
                      ref={el => { inputRefs.current[row.id] = el; }}
                      className="dg-expr-input"
                      value={row.expr}
                      onChange={e => setRows(prev => prev.map(r => (r.id === row.id && r.kind === "expr" ? { ...r, expr: e.target.value } : r)))}
                      onFocus={() => setActiveRowId(row.id)}
                      placeholder={yn === 1 ? "sin(x)" : `y${yn}`}
                      spellCheck={false}
                      autoComplete="off"
                      aria-label={`Function ${yn}`}
                    />
                    <button type="button" className="dg-expr-del" onClick={() => removeRow(row.id)} aria-label={isRu ? "Удалить строку" : "Remove row"}>×</button>
                  </div>
                );
              }

              const tN = tableOrdinal(i);
              return (
                <div key={row.id} className={`dg-table-layer${activeRowId === row.id ? " dg-table-layer--active" : ""}`}>
                  <div className="dg-table-layer__head">
                    <button
                      className="dg-color-dot"
                      style={{ background: row.enabled ? COLORS[ci % COLORS.length] : "#334155" }}
                      onClick={() => setRows(prev => prev.map(r => (r.id === row.id ? { ...r, enabled: !r.enabled } : r)))}
                      title={isRu ? "Показать/скрыть" : "Toggle"}
                      aria-label={isRu ? `Таблица ${tN}` : `Table ${tN}`}
                    />
                    <span className="dg-table-layer__title">
                      {isRu ? `Таблица ${tN}` : `Table ${tN}`}
                    </span>
                    <button type="button" className="dg-expr-del" onClick={() => removeRow(row.id)} aria-label={isRu ? "Удалить таблицу" : "Remove table"}>×</button>
                  </div>
                  <div className="dg-data-table">
                    <div className="dg-data-table__hdr">
                      <span>x<sub>{tN}</sub></span>
                      <span>y<sub>{tN}</sub></span>
                    </div>
                    {row.points.map((p, pi) => (
                      <div key={p.id} className="dg-data-table__row">
                        <input
                          type="text"
                          inputMode="decimal"
                          className="dg-data-table__cell"
                          value={p.x}
                          onChange={e =>
                            setRows(prev =>
                              prev.map(r =>
                                r.id === row.id && r.kind === "table"
                                  ? {
                                      ...r,
                                      points: r.points.map(q => (q.id === p.id ? { ...q, x: e.target.value } : q)),
                                    }
                                  : r,
                              ),
                            )}
                          onFocus={() => setActiveRowId(row.id)}
                          aria-label={`x ${tN} row ${pi + 1}`}
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          className="dg-data-table__cell"
                          value={p.y}
                          onChange={e =>
                            setRows(prev =>
                              prev.map(r =>
                                r.id === row.id && r.kind === "table"
                                  ? {
                                      ...r,
                                      points: r.points.map(q => (q.id === p.id ? { ...q, y: e.target.value } : q)),
                                    }
                                  : r,
                              ),
                            )}
                          onFocus={() => setActiveRowId(row.id)}
                          aria-label={`y ${tN} row ${pi + 1}`}
                        />
                        <button
                          type="button"
                          className="dg-data-table__row-del"
                          disabled={row.points.length <= 1}
                          onClick={() =>
                            setRows(prev =>
                              prev.map(r =>
                                r.id === row.id && r.kind === "table" && r.points.length > 1
                                  ? { ...r, points: r.points.filter(q => q.id !== p.id) }
                                  : r,
                              ),
                            )}
                          aria-label={isRu ? "Удалить строку" : "Remove point row"}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="dg-add-value-btn"
                      onClick={() =>
                        setRows(prev =>
                          prev.map(r =>
                            r.id === row.id && r.kind === "table"
                              ? { ...r, points: [...r.points, newPointCell()] }
                              : r,
                          ),
                        )}
                    >
                      <i className="fa-solid fa-plus" />
                      {isRu ? " Значение" : " Add value"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {inferenceSidebarOpen && (
            <div className="dg-inference-side" ref={inferenceRef} role="region" aria-label={isRu ? "Интерфейс вывода" : "Inference interface"}>
              <div className="dg-inference-side__head">
                <span className="dg-inference-side__title">{isRu ? "Интерфейс" : "Interface"}</span>
                <button
                  type="button"
                  className="dg-inference-side__close"
                  onClick={() => setInferenceSidebarOpen(false)}
                  aria-label={isRu ? "Свернуть" : "Collapse"}
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                className={`dg-inf-btn dg-inf-btn--block${selectedInference === "prob-dist" ? " dg-inf-btn--on" : ""}`}
                onClick={() => setSelectedInference("prob-dist")}
              >
                {isRu ? "Распределение вероятностей" : "Probability Distribution"}
              </button>

              <div className="dg-inference-or" aria-hidden="true">
                <span className="dg-inference-or__line" />
                <span>{isRu ? "или" : "or"}</span>
                <span className="dg-inference-or__line" />
              </div>

              <div className="dg-inference-section">
                {isRu ? "Вывод для количественных данных" : "Inference for Quantitative Data"}
              </div>
              <div className="dg-inference-grid2">
                <button
                  type="button"
                  className={`dg-inf-btn${selectedInference === "z-test" ? " dg-inf-btn--on" : ""}`}
                  onClick={() => setSelectedInference("z-test")}
                >
                  z-test
                </button>
                <button
                  type="button"
                  className={`dg-inf-btn${selectedInference === "t-test" ? " dg-inf-btn--on" : ""}`}
                  onClick={() => setSelectedInference("t-test")}
                >
                  t-test
                </button>
              </div>

              <div className="dg-inference-section">
                {isRu ? "Вывод для категориальных данных" : "Inference for Categorical Data"}
              </div>
              <button
                type="button"
                className={`dg-inf-btn dg-inf-btn--block${selectedInference === "z-prop" ? " dg-inf-btn--on" : ""}`}
                onClick={() => setSelectedInference("z-prop")}
              >
                {isRu ? "z-критерий для долей" : "z-test for proportions"}
              </button>
              <button
                type="button"
                className={`dg-inf-btn dg-inf-btn--block${selectedInference === "chi2-indep" ? " dg-inf-btn--on" : ""}`}
                onClick={() => setSelectedInference("chi2-indep")}
              >
                χ² {isRu ? "тест независимости" : "test for independence"}
              </button>
              <button
                type="button"
                className={`dg-inf-btn dg-inf-btn--block${selectedInference === "chi2-gof" ? " dg-inf-btn--on" : ""}`}
                onClick={() => setSelectedInference("chi2-gof")}
              >
                χ² {isRu ? "критерий согласия" : "goodness of fit test"}
              </button>

              <div className="dg-inference-view">
                <button type="button" className="dg-inference-view__btn" onClick={() => setTab("graph")}>
                  <i className="fa-solid fa-chart-line" /> {isRu ? "График" : "Graph"}
                </button>
                <button type="button" className="dg-inference-view__btn" onClick={() => setTab("table")}>
                  <i className="fa-solid fa-table" /> {isRu ? "Таблица" : "Table"}
                </button>
                <button
                  type="button"
                  className="dg-inference-view__btn"
                  onClick={() => {
                    dismissFsHint();
                    setIsFs(f => !f);
                  }}
                >
                  <i className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`} />
                  {isFullscreen ? (isRu ? "Окно" : "Window") : (isRu ? "Экран" : "Full")}
                </button>
              </div>
            </div>
          )}

          <div className="dg-section-label">{isRu ? "Вставить:" : "Insert:"}</div>
          <div className="dg-insert-grid">
            {[
              { l: "sin",  v: "sin("  },
              { l: "cos",  v: "cos("  },
              { l: "tan",  v: "tan("  },
              { l: "√",    v: "sqrt(" },
              { l: "π",    v: "pi"    },
              { l: "e",    v: "e"     },
              { l: "x²",   v: "x^2"  },
              { l: "^",    v: "^"     },
              { l: "(",    v: "("     },
              { l: ")",    v: ")"     },
              { l: "ln",   v: "log("  },
              { l: "|x|",  v: "abs("  },
            ].map(b => (
              <button
                key={b.l}
                type="button"
                className="dg-ins-btn"
                disabled={!activeExprRow}
                onClick={() => insertText(b.v)}
                title={!activeExprRow ? (isRu ? "Выберите строку f(x)" : "Select an f(x) row") : undefined}
              >
                {b.l}
              </button>
            ))}
          </div>

          <div className="dg-section-label">{isRu ? "Предустановки:" : "Presets:"}</div>
          <div className="dg-presets">
            {[
              { k: "standard", l: isRu ? "Стандарт" : "Standard" },
              { k: "trig",     l: isRu ? "Тригоном." : "Trig"    },
              { k: "decimal",  l: isRu ? "Десятич."  : "Decimal" },
              { k: "integer",  l: isRu ? "Целые"     : "Integer" },
            ].map(p => (
              <button key={p.k} type="button" className="dg-preset-btn" onClick={() => applyPreset(p.k)}>
                {p.l}
              </button>
            ))}
          </div>

          <details className="dg-win-details">
            <summary className="dg-win-summary">
              <i className="fa-solid fa-sliders" />
              {isRu ? " Настройки окна" : " Window"}
            </summary>
            <div className="dg-win-grid">
              {(["xMin", "xMax", "yMin", "yMax"] as const).map(k => (
                <label key={k} className="dg-win-row">
                  <span>{k}</span>
                  <input
                    type="number"
                    step="any"
                    value={winEdit[k] ?? win[k]}
                    onChange={e => setWinEdit(p => ({ ...p, [k]: e.target.value }))}
                    onBlur={() => {
                      const v = parseFloat(winEdit[k] ?? "");
                      if (!isNaN(v)) setWin(p => ({ ...p, [k]: v }));
                      setWinEdit(p => { const n = { ...p }; delete n[k]; return n; });
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const v = parseFloat(winEdit[k] ?? "");
                        if (!isNaN(v)) setWin(p => ({ ...p, [k]: v }));
                        setWinEdit(p => { const n = { ...p }; delete n[k]; return n; });
                      }
                    }}
                  />
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="dg-right">
          <div className="dg-bar">
            <button type="button" className={`dg-tab${tab === "graph" ? " dg-tab--on" : ""}`} onClick={() => setTab("graph")}>
              <i className="fa-solid fa-chart-line" /> {isRu ? "График" : "Graph"}
            </button>
            <button type="button" className={`dg-tab${tab === "table" ? " dg-tab--on" : ""}`} onClick={() => setTab("table")}>
              <i className="fa-solid fa-table" /> {isRu ? "Таблица" : "Table"}
            </button>
            <span className="dg-bar-spacer" />
            <button type="button" className="dg-ico-btn" onClick={zoomIn} title={isRu ? "Приблизить" : "Zoom in"}>
              <i className="fa-solid fa-plus" />
            </button>
            <button type="button" className="dg-ico-btn" onClick={zoomOut} title={isRu ? "Отдалить" : "Zoom out"}>
              <i className="fa-solid fa-minus" />
            </button>
            <button type="button" className="dg-ico-btn" onClick={() => setWin(DEFAULT_WIN)} title={isRu ? "Сброс" : "Reset view"}>
              <i className="fa-solid fa-arrows-to-dot" />
            </button>
            <span
              className={`dg-fs-btn-wrap${fsHintActive && !isFullscreen ? " dg-fs-btn-wrap--attention" : ""}`}
            >
              <button
                type="button"
                id="dg-fs-btn"
                className={`dg-ico-btn${isFullscreen ? " dg-ico-btn--on" : ""}${fsHintActive && !isFullscreen ? " dg-ico-btn--attention" : ""}`}
                onClick={() => {
                  dismissFsHint();
                  setIsFs(f => !f);
                }}
                title={isRu ? (isFullscreen ? "Выйти" : "Полный экран") : (isFullscreen ? "Exit fullscreen" : "Fullscreen")}
                aria-describedby={fsHintActive && !isFullscreen ? "dg-fs-hint-tip" : undefined}
              >
                <i className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`} />
              </button>
              {fsHintActive && !isFullscreen && (
                <span id="dg-fs-hint-tip" className="dg-fs-hint-pop" role="tooltip">
                  {isRu
                    ? "Нажмите — полный экран, удобнее график и таблица"
                    : "Tap for fullscreen — best for graph & table"}
                </span>
              )}
            </span>
          </div>

          {tab === "graph" && (
            <div
              className="dg-canvas-wrap"
              ref={wrapRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <canvas ref={canvasRef} className="dg-canvas" width={canvasSize.w} height={canvasSize.h} />

              {trace && (
                <div className="dg-trace" style={{ borderLeftColor: COLORS[trace.ci % COLORS.length] }}>
                  <span className="dg-trace-fn" style={{ color: COLORS[trace.ci % COLORS.length] }}>
                    {traceLabel(rows, trace.ci, isRu)}
                  </span>
                  <span>x = {fmt(trace.x)}</span>
                  <span>y = {fmt(trace.y)}</span>
                </div>
              )}

              {!hasGraphContent && (
                <div className="dg-empty">
                  <i className="fa-solid fa-chart-line fa-2x" />
                  <p>{isRu ? "Добавьте f(x) или таблицу слева" : "Add f(x) or a data table on the left"}</p>
                  <code>sin(x)</code>
                </div>
              )}

              <div className="dg-legend">
                {rows.map((row, i) => {
                  if (!row.enabled) return null;
                  if (row.kind === "expr") {
                    if (!row.expr.trim()) return null;
                    return (
                      <div key={row.id} className="dg-legend-item">
                        <span className="dg-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                        <code className="dg-legend-expr">{row.expr.length > 18 ? row.expr.slice(0, 17) + "…" : row.expr}</code>
                      </div>
                    );
                  }
                  const nPt = row.points.filter(p => parseTablePoint(p) !== null).length;
                  if (nPt === 0) return null;
                  const tn = rows.slice(0, i + 1).filter(r => r.kind === "table").length;
                  return (
                    <div key={row.id} className="dg-legend-item">
                      <span className="dg-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <code className="dg-legend-expr">{isRu ? `Табл.${tn} (${nPt})` : `Tbl${tn} (${nPt} pts)`}</code>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "table" && (
            <div className="dg-table-wrap">
              <div className="dg-table-ctrl">
                <label>
                  <span>{isRu ? "Начало" : "Start"}</span>
                  <input type="number" step="any" value={tableStart} onChange={e => setTblStart(e.target.value)} />
                </label>
                <label>
                  <span>{isRu ? "Шаг" : "Step"}</span>
                  <input type="number" step="any" value={tableStep} onChange={e => setTblStep(e.target.value)} />
                </label>
                <label>
                  <span>{isRu ? "Строк" : "Rows"}</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={tableRows}
                    onChange={e => setTblRows(e.target.value)}
                    aria-label={isRu ? "Число строк таблицы" : "Table row count"}
                  />
                </label>
              </div>
              {!hasExprForValueTable ? (
                <div className="dg-table-empty">
                  <i className="fa-solid fa-table" />
                  <p>
                    {isRu
                      ? "Нет активных выражений f(x). Добавьте строку «Выражение» слева — здесь появятся столбцы y."
                      : "No active f(x) expressions. Add an Expression row on the left — y columns appear here."}
                  </p>
                </div>
              ) : tableInvalid ? (
                <div className="dg-table-empty">
                  <i className="fa-solid fa-triangle-exclamation" />
                  <p>
                    {isRu
                      ? "Проверьте начало x и шаг: оба должны быть числами, шаг не может быть 0."
                      : "Check Start and Step: both must be valid numbers, and step cannot be 0."}
                  </p>
                </div>
              ) : (
                <div className="dg-table-scroll">
                  <table className="dg-table" role="grid" aria-label={isRu ? "Таблица значений функций" : "Function value table"}>
                    <thead>
                      <tr>
                        <th scope="col">x</th>
                        {rows.map((row, i) =>
                          row.kind === "expr" && row.expr.trim() && row.enabled ? (
                            <th key={row.id} scope="col" style={{ color: COLORS[i % COLORS.length] }} title={row.expr.length > 40 ? row.expr : undefined}>
                              y{rows.slice(0, i + 1).filter(r => r.kind === "expr").length}
                            </th>
                          ) : null,
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((tblRow, ri) => (
                        <tr key={ri}>
                          <td>{fmt(tblRow.x)}</td>
                          {rows.map((row, i) => {
                            if (row.kind !== "expr" || !row.expr.trim() || !row.enabled) return null;
                            const y = tblRow.ys[i];
                            return (
                              <td key={row.id}>
                                {y === null ? <span className="dg-undef">{isRu ? "не опр." : "undef"}</span> : fmt(y)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isFullscreen && (
        <article className="dg-article">
          <h2 className="dg-article__h2">
            {isRu ? "Что такое графический калькулятор?" : "What is a graphing calculator?"}
          </h2>
          <p className="dg-article__p">
            {isRu
              ? "Графический калькулятор строит графики уравнений и данных, решает многие задачи алгебры и анализа в численном виде и часто включает статистику и программирование. В отличие от простого калькулятора, вы видите зависимость y от x на экране — параболы, синусоиды, точки пересечения."
              : "A graphing calculator plots equations and data, handles algebra and calculus numerically, and often adds statistics and programming. Unlike a basic calculator, you see how y depends on x—parabolas, sine waves, intersections—right on the screen."}
          </p>
          <p className="dg-article__p">
            {isRu
              ? "Портативные модели (TI-84, Casio, HP и др.) до сих пор нужны на многих экзаменах. Онлайн-инструменты вроде Desmos и GeoGebra — бесплатный способ тренироваться дома; эта страница даёт многослойный график прямо в браузере без установки."
              : "Handheld models (TI-84, Casio, HP, and others) are still required on many standardized tests. Online tools like Desmos and GeoGebra are free for practice at home; this page gives you a multi-layer graph in the browser with no install."}
          </p>

          <h2 className="dg-article__h2">
            {isRu ? "Как это работает" : "How it works"}
          </h2>
          <p className="dg-article__p">
            {isRu
              ? "Вы вводите выражение от x или точки (x, y). Программа вычисляет значения на диапазоне и рисует кривую; масштаб и положение окна задаются вручную или жестами. Так можно быстро проверить решение системы уравнений по пересечениям графиков."
              : "You enter an expression in x or a list of (x, y) points. The software samples values and draws the curve; you set the view with controls or gestures. That makes it easy to check systems of equations from intersection points."}
          </p>

          <h2 className="dg-article__h2">
            {isRu ? "Основные возможности" : "Key features"}
          </h2>
          <ul className="dg-article__ul">
            {(isRu
              ? [
                  "Построение нескольких графиков в одной системе координат.",
                  "Численное решение уравнений и поиск пересечений.",
                  "Статистика, регрессия и диаграммы рассеяния (на многих устройствах).",
                  "Программирование на калькуляторе (TI-Basic и др.) — с учётом правил экзамена.",
                ]
              : [
                  "Plot several graphs in one coordinate plane.",
                  "Solve equations numerically and find intersections.",
                  "Statistics, regression, and scatter plots on many devices.",
                  "On-calculator programming (e.g. TI-Basic)—subject to exam rules.",
                ]
            ).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>

          <h2 className="dg-article__h2">
            {isRu ? "Популярные модели (ориентир)" : "Popular models (at a glance)"}
          </h2>
          <table className="dg-article__compare">
            <thead>
              <tr>
                <th>{isRu ? "Модель" : "Model"}</th>
                <th>{isRu ? "Цена" : "Price"}</th>
                <th>{isRu ? "Экран" : "Screen"}</th>
                <th>{isRu ? "Особенности" : "Highlights"}</th>
                <th>{isRu ? "Экзамены" : "Tests"}</th>
              </tr>
            </thead>
            <tbody>
              {(
                isRu
                  ? [
                      ["TI-84 Plus", "$$", '~3.5"', "Школа, алгебра, статистика", "SAT, ACT, AP"],
                      ["Casio fx-9750GII", "$", '~2.8"', "Доступная графика", "SAT, ACT"],
                      ["HP Prime", "$$$", '~3.5"', "Сенсор, CAS-опции", "SAT, ACT"],
                      ["TI-Nspire CX", "$$$$", '~3.5"', "3D, документы, CAS", "SAT, ACT, AP"],
                    ]
                  : [
                      ["TI-84 Plus", "$$", '~3.5"', "School standard, algebra, stats", "SAT, ACT, AP"],
                      ["Casio fx-9750GII", "$", '~2.8"', "Budget graphing", "SAT, ACT"],
                      ["HP Prime", "$$$", '~3.5"', "Touchscreen, CAS options", "SAT, ACT"],
                      ["TI-Nspire CX", "$$$$", '~3.5"', "3D, documents, CAS", "SAT, ACT, AP"],
                    ]
              ).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dg-article__p dg-article__muted">
            {isRu
              ? "Проверяйте актуальные списки допуска у организатора экзамена."
              : "Always confirm the latest allowed-model list from your testing agency."}
          </p>

          <h2 className="dg-article__h2">
            {isRu ? "Железо, приложения и эта страница" : "Hardware, apps, and this page"}
          </h2>
          <p className="dg-article__p">
            {isRu
              ? "На экзамене часто требуется физический калькулятор из списка. Дома удобно сочетать бесплатные приложения и веб-инструменты. Ниже — как пользоваться именно графическим калькулятором на FinanceCalculator."
              : "Exams usually require an approved physical device. At home, free apps and web tools are ideal for exploration. Below: how to use FinanceCalculator’s own graphing workspace."}
          </p>
          <p className="dg-article__p">
            {isRu ? (
              <>
                Полное руководство с историей, сравнением и советами — в блоге:{" "}
                <a
                  href={buildPathname(lang, "blog", GRAPHING_GUIDE_BLOG_SLUG[lang])}
                  className="dg-article__link"
                  onClick={e => {
                    e.preventDefault();
                    onNavigate?.("blog", { blogSlug: GRAPHING_GUIDE_BLOG_SLUG[lang] });
                  }}
                >
                  «Что такое графический калькулятор? Полное руководство»
                </a>
                .
              </>
            ) : (
              <>
                Read the full guide on our blog:{" "}
                <a
                  href={buildPathname(lang, "blog", GRAPHING_GUIDE_BLOG_SLUG[lang])}
                  className="dg-article__link"
                  onClick={e => {
                    e.preventDefault();
                    onNavigate?.("blog", { blogSlug: GRAPHING_GUIDE_BLOG_SLUG[lang] });
                  }}
                >
                  What Is a Graphing Calculator? A Complete Guide
                </a>
                .
              </>
            )}
          </p>

          <h2 className="dg-article__h2">
            {isRu ? "Графический калькулятор онлайн — всё о возможностях" : "Online Graphing Calculator — Full Feature Guide"}
          </h2>
          <p className="dg-article__p">
            {isRu
              ? "Калькулятор работает в браузере: любое число слоёв — выражения f(x) и таблицы точек (x, y). Масштаб колёсиком, сдвиг перетаскиванием, трассировка у кривых и точек."
              : "Runs in your browser with any number of layers — f(x) expressions and (x, y) data tables. Zoom with the scroll wheel, pan by dragging, and trace curves or plotted points."}
          </p>

          <h2 className="dg-article__h2">
            {isRu ? "Как пользоваться калькулятором" : "How to use the graphing calculator"}
          </h2>
          <ol className="dg-article__ol">
            <li>{isRu ? "Нажмите «+» слева: добавьте выражение f(x) или таблицу значений." : "Use the + button on the left to add an f(x) expression or a value table."}</li>
            <li>{isRu ? "В таблице данных нажимайте «+ Значение», чтобы добавлять строки без ограничения (для отрисовки учитываются тысячи точек)." : "In a data table, use + Add value to append rows without a fixed limit (drawing caps at a large safety limit)."}</li>
            <li>{isRu ? "Кнопки «Вставить» работают, когда активна строка с f(x)." : "Insert shortcuts apply when an f(x) row is focused."}</li>
            <li>{isRu ? "«Интерфейс» в меню «+» открывает панель слева: распределения и критерии (как в Desmos), выбор опции и быстрые кнопки график / таблица." : "Interface in the + menu opens a left-side panel: probability & inference options (Desmos-style), selectable tools, plus Graph / Table / fullscreen shortcuts."}</li>
            <li>{isRu ? "Прокручивайте колёсико мыши для масштаба; на телефоне — щипок двумя пальцами." : "Scroll the mouse wheel to zoom. On mobile, use a two-finger pinch."}</li>
            <li>{isRu ? "Перетащите граф для сдвига области просмотра." : "Drag the graph to pan the viewing area."}</li>
            <li>{isRu ? "Наведите мышь на кривую или точку таблицы — координаты x и y." : "Hover near a curve or table point to read x and y."}</li>
            <li>{isRu ? "Вкладка «Таблица» справа — численные y(x) для всех включённых выражений." : "The Table tab shows numeric y(x) samples for every enabled expression."}</li>
          </ol>

          <h2 className="dg-article__h2">
            {isRu ? "Поддерживаемые функции и синтаксис" : "Supported functions and syntax"}
          </h2>
          <div className="dg-syntax-grid">
            {[
              { cat: isRu ? "Тригонометрия" : "Trig", items: ["sin(x)", "cos(x)", "tan(x)", "asin(x)", "acos(x)", "atan(x)"] },
              { cat: isRu ? "Степень / корень" : "Powers", items: ["x^2", "x^3", "x^0.5", "sqrt(x)", "cbrt(x)", "exp(x)"] },
              { cat: isRu ? "Логарифмы" : "Logs", items: ["log(x)", "log2(x)", "log10(x)"] },
              { cat: isRu ? "Прочее" : "Other", items: ["abs(x)", "ceil(x)", "floor(x)", "pi", "e"] },
            ].map((g, i) => (
              <div key={i} className="dg-syntax-group">
                <div className="dg-syntax-group__title">{g.cat}</div>
                {g.items.map(it => <code key={it} className="dg-syntax-code">{it}</code>)}
              </div>
            ))}
          </div>

          <h2 className="dg-article__h2">
            {isRu ? "Примеры интересных функций" : "Interesting function examples"}
          </h2>
          <div className="dg-examples">
            {[
              { expr: "sin(x) / x",       desc: isRu ? "Синк-функция" : "Sinc function" },
              { expr: "x * sin(1/x)",      desc: isRu ? "Осциллирующая" : "Oscillating" },
              { expr: "sqrt(25 - x^2)",    desc: isRu ? "Полуокружность" : "Semicircle" },
              { expr: "abs(sin(x))",        desc: isRu ? "Выпрямленный синус" : "Rectified sine" },
              { expr: "tan(x)",             desc: isRu ? "Тангенс" : "Tangent (discontinuous)" },
              { expr: "floor(x)",           desc: isRu ? "Ступенчатая" : "Step function" },
            ].map((ex, i) => (
              <button
                key={i}
                type="button"
                className="dg-example-chip"
                onClick={() => {
                  const emptyId = rows.find(r => r.kind === "expr" && !r.expr.trim())?.id;
                  if (emptyId) {
                    setRows(prev => prev.map(r => (r.id === emptyId && r.kind === "expr" ? { ...r, expr: ex.expr, enabled: true } : r)));
                    setActiveRowId(emptyId);
                  } else {
                    const id = newRowId();
                    setRows(prev => [...prev, { id, kind: "expr", expr: ex.expr, enabled: true }]);
                    setActiveRowId(id);
                  }
                  setTab("graph");
                }}
                title={isRu ? "Нажмите чтобы добавить" : "Click to add"}
              >
                <code className="dg-example-chip__code">{ex.expr}</code>
                <span className="dg-example-chip__desc">{ex.desc}</span>
              </button>
            ))}
          </div>

          <h2 className="dg-article__h2">
            {isRu ? "Часто задаваемые вопросы" : "Frequently asked questions"}
          </h2>
          {[
            {
              q: isRu ? "Как записать x в квадрате?" : "How do I write x squared?",
              a: isRu ? "Введите x^2. Кнопка «x²» в панели вставки делает это автоматически." : "Type x^2. The x² button in the Insert panel does this automatically.",
            },
            {
              q: isRu ? "Почему тангенс выглядит странно?" : "Why does tan(x) look strange?",
              a: isRu ? "tan(x) имеет разрывы при x = π/2 + nπ. Калькулятор обнаруживает эти скачки и не соединяет ветви — это корректное поведение." : "tan(x) has discontinuities at x = π/2 + nπ. The calculator detects these jumps and doesn't connect the branches — this is correct behavior.",
            },
            {
              q: isRu ? "Сколько функций и таблиц можно добавить?" : "How many expressions or tables can I add?",
              a: isRu ? "Сколько угодно строк через меню «+». Таблицы: кнопка «+» внизу добавляет пары x, y." : "Add as many layers as you need via +. In each data table, the + button adds more x, y rows.",
            },
            {
              q: isRu ? "Работает ли на мобильном?" : "Does it work on mobile?",
              a: isRu ? "Да. Один палец — сдвиг, два (щипок) — масштаб. Полноэкранный режим доступен." : "Yes. One finger to pan, two-finger pinch to zoom. Fullscreen works too.",
            },
            {
              q: isRu ? "Где таблица значений y(x)?" : "Where is the y(x) value table?",
              a: isRu
                ? "Вкладка «Таблица» над графиком — только для выражений f(x). Точки (x,y) вводятся в боковой «Таблице» через меню «+»."
                : "The Table tab above the graph samples y from each f(x). For manual (x,y) points, add a Table layer from the + menu on the left.",
            },
            {
              q: isRu ? "Помогает ли графический калькулятор в геометрии?" : "Can a graphing calculator help with geometry?",
              a: isRu
                ? "Да: по уравнениям можно строить фигуры, смотреть пересечения и проверять длины и углы численно."
                : "Yes—you can plot relations, read intersections, and check lengths and angles numerically.",
            },
            {
              q: isRu ? "Разрешён ли такой инструмент на экзаменах?" : "Are graphing calculators allowed on exams?",
              a: isRu
                ? "Часто да, но только физические модели из официального списка. Эта веб-страница для практики дома, не для зала экзамена."
                : "Often yes for approved handhelds on official lists. This web tool is for practice at home, not the exam hall.",
            },
            {
              q: isRu ? "Есть ли поддержка «как в Desmos»?" : "Is this the same as Desmos?",
              a: isRu
                ? "Похожий рабочий процесс (слои, масштаб, таблица), но это отдельный инструмент на FinanceCalculator, не продукт Desmos."
                : "Similar workflow (layers, zoom, table), but this is FinanceCalculator’s own tool—not affiliated with Desmos.",
            },
          ].map((item, i) => (
            <details key={i} className="dg-faq">
              <summary className="dg-faq__q">{item.q}</summary>
              <p className="dg-faq__a">{item.a}</p>
            </details>
          ))}
        </article>
      )}
    </>
  );
}
