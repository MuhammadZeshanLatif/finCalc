// Build the WebP images for draft articles from small JSON specs.
//
//   npm run blog:images                 (every content/blog-drafts/*.images.json)
//   npm run blog:images -- some-slug    (one article)
//
// content/blog-drafts/<slug>.images.json is an array of image specs; each one is written to
// content/blog-drafts/images/<slug>/<file>.webp (1200x675). Chart numbers for the "amortization",
// "growth" and "loanCompare" types are computed here from the loan / savings formulas, so the
// pictures always match the math in the article.
//
// Spec types:
//   { file, type: "hero", kicker, title, stat?: { value, label }, icon?: house|car|coins|chart|percent|calendar|card|piggy|tax|calc|scale|globe|cart|briefcase }
//   { file, type: "bar", title, subtitle?, unit?: "$"|"%"|"", bars: [{ label, value, highlight? }], note? }
//   { file, type: "stacked", title, subtitle?, unit?, legend: [name, name], bars: [{ label, parts: [a, b] }], note? }
//   { file, type: "line", title, subtitle?, unit?, xLabel?, series: [{ name, points: [[x, y], ...] }], note? }
//   { file, type: "table", title, subtitle?, head: [...], rows: [[...], ...], note? }
//   { file, type: "steps", title, subtitle?, items: ["...", ...] }
//   { file, type: "amortization", title?, scenarios: [{ label, loan, rate, years, extra? }] }   balance over time
//   { file, type: "growth", title?, years, scenarios: [{ label, start, monthly, rate }] }       savings balance over time
//   { file, type: "loanCompare", title?, scenarios: [{ label, loan, rate, years }] }           total interest per scenario
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = "content/blog-drafts";
const W = 1200;
const H = 675;
const C = { navy: "#1a2b42", blue: "#2b5ca8", blue2: "#3b72c4", sky: "#d0e4ff", pale: "#ebf3ff", bg: "#f6f9fc", amber: "#f5a623", green: "#2e9e6b", red: "#d1495b", muted: "#5f7794", grid: "#dde5ef" };
const PALETTE = [C.blue, C.amber, C.green, C.red, "#7b5ea7"];
const FONT = "Segoe UI, Helvetica, Arial, sans-serif";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars && line) { lines.push(line); line = w; }
    else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function fmt(v, unit = "") {
  const abs = Math.abs(v);
  let s;
  if (unit === "%") s = `${+v.toFixed(abs < 10 ? 2 : 1)}%`;
  else if (abs >= 1e6) s = `${+(v / 1e6).toFixed(2)}M`;
  else if (abs >= 1e4) s = `${Math.round(v / 1e3)}k`;
  else if (abs >= 1e3) s = `${+(v / 1e3).toFixed(1)}k`;
  else s = `${+v.toFixed(abs < 10 && !Number.isInteger(v) ? 2 : 0)}`;
  return unit === "$" ? `$${s}` : unit === "%" ? s : unit ? `${s} ${unit}` : s;
}

const full = (v) => `$${Math.round(v).toLocaleString("en-US")}`;

function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

function frame(title, subtitle, inner, note) {
  const t = wrap(title, 62).slice(0, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.blue}"/>
  ${t.map((l, i) => `<text x="60" y="${72 + i * 40}" font-family="${FONT}" font-size="34" font-weight="700" fill="${C.navy}">${esc(l)}</text>`).join("")}
  ${subtitle ? `<text x="60" y="${72 + t.length * 40 + 2}" font-family="${FONT}" font-size="21" fill="${C.muted}">${esc(subtitle)}</text>` : ""}
  ${inner}
  ${note ? `<text x="60" y="${H - 26}" font-family="${FONT}" font-size="17" fill="${C.muted}">${esc(note)}</text>` : ""}
  <text x="${W - 60}" y="${H - 26}" text-anchor="end" font-family="${FONT}" font-size="17" font-weight="600" fill="${C.blue}">financcalculators.com</text>
</svg>`;
}

const ICONS = {
  house: `<path d="M0 60 L70 0 L140 60 L140 140 L0 140 Z" fill="#fff" opacity=".95"/><rect x="55" y="85" width="30" height="55" fill="${C.amber}"/><rect x="20" y="75" width="26" height="24" fill="${C.sky}"/><rect x="94" y="75" width="26" height="24" fill="${C.sky}"/>`,
  car: `<rect x="0" y="55" width="150" height="55" rx="16" fill="#fff"/><path d="M25 55 L45 18 L110 18 L130 55 Z" fill="#fff" opacity=".85"/><circle cx="35" cy="112" r="18" fill="${C.amber}"/><circle cx="115" cy="112" r="18" fill="${C.amber}"/>`,
  coins: `<ellipse cx="70" cy="120" rx="65" ry="20" fill="${C.amber}"/><ellipse cx="70" cy="95" rx="65" ry="20" fill="#ffd27a"/><ellipse cx="70" cy="70" rx="65" ry="20" fill="${C.amber}"/><ellipse cx="70" cy="45" rx="65" ry="20" fill="#ffd27a"/>`,
  chart: `<rect x="0" y="90" width="30" height="50" fill="#fff"/><rect x="40" y="60" width="30" height="80" fill="#fff"/><rect x="80" y="30" width="30" height="110" fill="${C.amber}"/><rect x="120" y="0" width="30" height="140" fill="#fff"/>`,
  percent: `<circle cx="30" cy="30" r="26" fill="none" stroke="#fff" stroke-width="14"/><circle cx="120" cy="115" r="26" fill="none" stroke="${C.amber}" stroke-width="14"/><path d="M135 5 L15 140" stroke="#fff" stroke-width="16" stroke-linecap="round"/>`,
  calendar: `<rect x="0" y="15" width="150" height="125" rx="14" fill="#fff"/><rect x="0" y="15" width="150" height="34" rx="14" fill="${C.amber}"/>${[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => `<rect x="${14 + c * 34}" y="${62 + r * 24}" width="22" height="16" rx="3" fill="${C.sky}"/>`).join("")).join("")}`,
  card: `<rect x="0" y="20" width="160" height="100" rx="14" fill="#fff"/><rect x="0" y="45" width="160" height="22" fill="${C.navy}"/><rect x="16" y="85" width="40" height="20" rx="4" fill="${C.amber}"/>`,
  piggy: `<ellipse cx="75" cy="80" rx="70" ry="52" fill="#fff"/><rect x="58" y="22" width="34" height="9" rx="4" fill="${C.amber}"/><circle cx="118" cy="68" r="6" fill="${C.navy}"/><rect x="25" y="118" width="18" height="24" fill="#fff"/><rect x="100" y="118" width="18" height="24" fill="#fff"/>`,
  tax: `<rect x="10" y="0" width="120" height="145" rx="10" fill="#fff"/>${[0, 1, 2, 3].map((i) => `<rect x="28" y="${25 + i * 24}" width="${i === 3 ? 50 : 84}" height="10" rx="5" fill="${C.sky}"/>`).join("")}<circle cx="110" cy="122" r="26" fill="${C.amber}"/><text x="110" y="132" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="800" fill="#fff">%</text>`,
  calc: `<rect x="10" y="0" width="120" height="150" rx="14" fill="#fff"/><rect x="26" y="16" width="88" height="30" rx="5" fill="${C.sky}"/>${[0, 1, 2].map((c) => [0, 1, 2].map((r) => `<rect x="${26 + c * 32}" y="${58 + r * 28}" width="22" height="20" rx="4" fill="${c === 2 && r === 2 ? C.amber : C.pale}"/>`).join("")).join("")}`,
  scale: `<rect x="70" y="10" width="10" height="120" fill="#fff"/><rect x="20" y="130" width="110" height="12" rx="6" fill="#fff"/><path d="M10 40 L140 40" stroke="#fff" stroke-width="8"/><path d="M0 85 Q25 110 50 85 Z" fill="${C.amber}"/><path d="M100 85 Q125 110 150 85 Z" fill="#fff"/>`,
  globe: `<circle cx="72" cy="72" r="68" fill="none" stroke="#fff" stroke-width="10"/><ellipse cx="72" cy="72" rx="30" ry="68" fill="none" stroke="#fff" stroke-width="8"/><path d="M6 72 L138 72 M18 38 L126 38 M18 106 L126 106" stroke="${C.amber}" stroke-width="8"/>`,
  cart: `<path d="M0 10 L28 10 L46 95 L130 95 L148 35 L36 35" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><circle cx="58" cy="125" r="13" fill="${C.amber}"/><circle cx="118" cy="125" r="13" fill="${C.amber}"/>`,
  briefcase: `<rect x="0" y="35" width="150" height="105" rx="14" fill="#fff"/><rect x="50" y="10" width="50" height="30" rx="8" fill="none" stroke="#fff" stroke-width="10"/><rect x="0" y="75" width="150" height="10" fill="${C.amber}"/>`,
};

function hero(spec) {
  // Largest font whose wrapped title fits in 3 lines of ~780px (the icon sits to the right).
  let size = 64;
  let lines = wrap(spec.title, Math.floor(780 / (size * 0.56)));
  for (const s of [56, 48, 42]) {
    if (lines.length <= 3) break;
    size = s;
    lines = wrap(spec.title, Math.floor(780 / (size * 0.56)));
  }
  lines = lines.slice(0, 4);
  const lineH = Math.round(size * 1.15);
  // Center the kicker + title block in the space above the stat badge.
  const top = 285 - (36 + lines.length * lineH) / 2;
  const icon = ICONS[spec.icon] || ICONS.calc;
  const stat = spec.stat
    ? `<rect x="60" y="${H - 150}" width="${Math.max(260, 26 * String(spec.stat.value).length + 40)}" height="92" rx="16" fill="${C.amber}"/>
       <text x="84" y="${H - 96}" font-family="${FONT}" font-size="44" font-weight="800" fill="${C.navy}">${esc(spec.stat.value)}</text>
       <text x="84" y="${H - 70}" font-family="${FONT}" font-size="18" font-weight="600" fill="${C.navy}">${esc(spec.stat.label)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="#173a73"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="1010" cy="120" r="260" fill="#fff" opacity=".05"/>
  <circle cx="1100" cy="620" r="200" fill="#fff" opacity=".05"/>
  <text x="60" y="${top + 20}" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="3" fill="${C.amber}">${esc(String(spec.kicker || "").toUpperCase())}</text>
  ${lines.map((l, i) => `<text x="60" y="${top + 36 + size + i * lineH}" font-family="${FONT}" font-size="${size}" font-weight="800" fill="#fff">${esc(l)}</text>`).join("")}
  ${stat}
  <g transform="translate(900 250) scale(1.45)">${icon}</g>
  <text x="${W - 60}" y="${H - 40}" text-anchor="end" font-family="${FONT}" font-size="20" font-weight="600" fill="#fff" opacity=".85">financcalculators.com</text>
</svg>`;
}

const PLOT = { x: 140, y: 175, w: 980, h: 380 };

function axes(max, unit, ticks = 5) {
  let out = "";
  for (let i = 0; i <= ticks; i++) {
    const v = (max / ticks) * i;
    const y = PLOT.y + PLOT.h - (PLOT.h * i) / ticks;
    out += `<line x1="${PLOT.x}" y1="${y}" x2="${PLOT.x + PLOT.w}" y2="${y}" stroke="${C.grid}" stroke-width="1.5"/>`;
    out += `<text x="${PLOT.x - 14}" y="${y + 6}" text-anchor="end" font-family="${FONT}" font-size="17" fill="${C.muted}">${esc(fmt(v, unit))}</text>`;
  }
  return out;
}

function bar(spec) {
  const unit = spec.unit ?? "$";
  const max = niceMax(Math.max(...spec.bars.map((b) => b.value)) * 1.08);
  const n = spec.bars.length;
  const slot = PLOT.w / n;
  const bw = Math.min(140, slot * 0.6);
  let inner = axes(max, unit);
  spec.bars.forEach((b, i) => {
    const h = (PLOT.h * b.value) / max;
    const x = PLOT.x + slot * i + (slot - bw) / 2;
    const y = PLOT.y + PLOT.h - h;
    inner += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6" fill="${b.highlight ? C.amber : C.blue2}"/>`;
    inner += `<text x="${x + bw / 2}" y="${y - 10}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="700" fill="${C.navy}">${esc(b.display ?? (unit === "$" ? full(b.value) : fmt(b.value, unit)))}</text>`;
    wrap(b.label, Math.max(10, Math.floor(slot / 11))).slice(0, 2).forEach((l, j) => {
      inner += `<text x="${x + bw / 2}" y="${PLOT.y + PLOT.h + 28 + j * 22}" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${C.navy}">${esc(l)}</text>`;
    });
  });
  return frame(spec.title, spec.subtitle, inner, spec.note);
}

function stacked(spec) {
  const unit = spec.unit ?? "$";
  const totals = spec.bars.map((b) => b.parts.reduce((a, v) => a + v, 0));
  const max = niceMax(Math.max(...totals) * 1.08);
  const n = spec.bars.length;
  const slot = PLOT.w / n;
  const bw = Math.min(130, slot * 0.6);
  let inner = axes(max, unit);
  spec.bars.forEach((b, i) => {
    let y = PLOT.y + PLOT.h;
    const x = PLOT.x + slot * i + (slot - bw) / 2;
    b.parts.forEach((v, k) => {
      const h = (PLOT.h * v) / max;
      y -= h;
      inner += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${PALETTE[k]}"/>`;
    });
    inner += `<text x="${x + bw / 2}" y="${y - 10}" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="700" fill="${C.navy}">${esc(unit === "$" ? full(totals[i]) : fmt(totals[i], unit))}</text>`;
    wrap(b.label, Math.max(10, Math.floor(slot / 11))).slice(0, 2).forEach((l, j) => {
      inner += `<text x="${x + bw / 2}" y="${PLOT.y + PLOT.h + 28 + j * 22}" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${C.navy}">${esc(l)}</text>`;
    });
  });
  inner += legend(spec.legend);
  return frame(spec.title, spec.subtitle, inner, spec.note);
}

// Side-by-side bars per group: { legend: [a, b], groups: [{ label, values: [x, y] }] }
function grouped(spec) {
  const unit = spec.unit ?? "$";
  const max = niceMax(Math.max(...spec.groups.flatMap((g) => g.values)) * 1.1);
  const k = spec.legend.length;
  const slot = PLOT.w / spec.groups.length;
  const bw = Math.min(110, (slot * 0.75) / k);
  let inner = axes(max, unit);
  spec.groups.forEach((g, i) => {
    const start = PLOT.x + slot * i + (slot - bw * k) / 2;
    g.values.forEach((v, j) => {
      const h = (PLOT.h * v) / max;
      const x = start + j * bw;
      const y = PLOT.y + PLOT.h - h;
      inner += `<rect x="${x + 3}" y="${y}" width="${bw - 6}" height="${h}" rx="5" fill="${PALETTE[j]}"/>`;
      inner += `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-family="${FONT}" font-size="${k > 2 ? 14 : 16}" font-weight="700" fill="${C.navy}">${esc(unit === "$" ? fmt(v, "$") : fmt(v, unit))}</text>`;
    });
    wrap(g.label, Math.max(10, Math.floor(slot / 11))).slice(0, 2).forEach((l, j) => {
      inner += `<text x="${PLOT.x + slot * i + slot / 2}" y="${PLOT.y + PLOT.h + 28 + j * 22}" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${C.navy}">${esc(l)}</text>`;
    });
  });
  inner += legend(spec.legend);
  return frame(spec.title, spec.subtitle, inner, spec.note);
}

function legend(names) {
  let x = PLOT.x + PLOT.w;
  let out = "";
  [...names].reverse().forEach((name, ri) => {
    const k = names.length - 1 - ri;
    const w = 34 + name.length * 9.5;
    x -= w + 18;
    out += `<rect x="${x}" y="${PLOT.y - 34}" width="18" height="18" rx="3" fill="${PALETTE[k]}"/><text x="${x + 26}" y="${PLOT.y - 19}" font-family="${FONT}" font-size="17" fill="${C.navy}">${esc(name)}</text>`;
  });
  return out;
}

function line(spec) {
  const unit = spec.unit ?? "$";
  const xs = spec.series.flatMap((s) => s.points.map((p) => p[0]));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const max = niceMax(Math.max(...spec.series.flatMap((s) => s.points.map((p) => p[1]))) * 1.05);
  const px = (x) => PLOT.x + ((x - minX) / (maxX - minX || 1)) * PLOT.w;
  const py = (y) => PLOT.y + PLOT.h - (PLOT.h * y) / max;
  let inner = axes(max, unit);
  const step = Math.max(1, Math.ceil((maxX - minX) / 10));
  for (let x = minX; x <= maxX; x += step) {
    inner += `<text x="${px(x)}" y="${PLOT.y + PLOT.h + 28}" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${C.muted}">${esc(x)}</text>`;
  }
  if (spec.xLabel) inner += `<text x="${PLOT.x + PLOT.w / 2}" y="${PLOT.y + PLOT.h + 56}" text-anchor="middle" font-family="${FONT}" font-size="17" fill="${C.muted}">${esc(spec.xLabel)}</text>`;
  spec.series.forEach((s, k) => {
    const d = s.points.map((p, i) => `${i ? "L" : "M"}${px(p[0]).toFixed(1)} ${py(p[1]).toFixed(1)}`).join(" ");
    inner += `<path d="${d}" fill="none" stroke="${PALETTE[k]}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
    const last = s.points[s.points.length - 1];
    inner += `<circle cx="${px(last[0])}" cy="${py(last[1])}" r="7" fill="${PALETTE[k]}"/>`;
    inner += `<text x="${px(last[0]) - 12}" y="${py(last[1]) - 14}" text-anchor="end" font-family="${FONT}" font-size="18" font-weight="700" fill="${PALETTE[k]}">${esc(unit === "$" ? full(last[1]) : fmt(last[1], unit))}</text>`;
  });
  inner += legend(spec.series.map((s) => s.name));
  return frame(spec.title, spec.subtitle, inner, spec.note);
}

function table(spec) {
  const cols = spec.head.length;
  const top = 185;
  const rowH = Math.min(62, 380 / (spec.rows.length + 1));
  const colW = (W - 120) / cols;
  let inner = `<rect x="60" y="${top}" width="${W - 120}" height="${rowH}" rx="8" fill="${C.blue}"/>`;
  spec.head.forEach((h, c) => {
    inner += `<text x="${80 + c * colW}" y="${top + rowH / 2 + 7}" font-family="${FONT}" font-size="20" font-weight="700" fill="#fff">${esc(h)}</text>`;
  });
  spec.rows.forEach((r, i) => {
    const y = top + rowH * (i + 1);
    inner += `<rect x="60" y="${y}" width="${W - 120}" height="${rowH}" fill="${i % 2 ? C.pale : "#fff"}"/>`;
    r.forEach((cell, c) => {
      inner += `<text x="${80 + c * colW}" y="${y + rowH / 2 + 7}" font-family="${FONT}" font-size="19" font-weight="${c === 0 ? 600 : 400}" fill="${C.navy}">${esc(cell)}</text>`;
    });
  });
  return frame(spec.title, spec.subtitle, inner, spec.note);
}

function steps(spec) {
  const n = spec.items.length;
  const rowH = Math.min(78, 400 / n);
  let inner = "";
  spec.items.forEach((item, i) => {
    const y = 185 + i * rowH;
    inner += `<circle cx="90" cy="${y + 24}" r="22" fill="${i === n - 1 ? C.amber : C.blue}"/>`;
    inner += `<text x="90" y="${y + 32}" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="800" fill="#fff">${i + 1}</text>`;
    wrap(item, 78).slice(0, 2).forEach((l, j) => {
      inner += `<text x="135" y="${y + 31 + j * 26}" font-family="${FONT}" font-size="21" fill="${C.navy}">${esc(l)}</text>`;
    });
  });
  return frame(spec.title, spec.subtitle, inner, spec.note);
}

// ---- computed charts ----
const payment = (loan, rate, years) => {
  const r = rate / 100 / 12;
  const n = years * 12;
  return r === 0 ? loan / n : (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
};

function schedule(loan, rate, years, extra = 0) {
  const r = rate / 100 / 12;
  const pmt = payment(loan, rate, years);
  let bal = loan;
  let interest = 0;
  const yearly = [[0, loan]];
  let month = 0;
  while (bal > 0.005 && month < years * 12) {
    const i = bal * r;
    interest += i;
    bal = Math.max(0, bal + i - pmt - extra);
    month++;
    if (month % 12 === 0 || bal <= 0.005) yearly.push([+(month / 12).toFixed(2), bal]);
  }
  return { pmt, interest, months: month, yearly };
}

function amortization(spec) {
  const series = spec.scenarios.map((s) => ({ name: s.label, points: schedule(s.loan, s.rate, s.years, s.extra).yearly }));
  const sub = spec.subtitle ?? spec.scenarios.map((s) => {
    const sc = schedule(s.loan, s.rate, s.years, s.extra);
    return `${s.label}: ${full(sc.pmt + (s.extra || 0))}/mo, ${full(sc.interest)} interest`;
  }).join("  ·  ");
  return line({ title: spec.title ?? "Loan balance over time", subtitle: sub, unit: "$", xLabel: "Years", series, note: spec.note });
}

function growth(spec) {
  const series = spec.scenarios.map((s) => {
    const i = s.rate / 100 / 12;
    let bal = s.start;
    const points = [[0, bal]];
    for (let m = 1; m <= spec.years * 12; m++) {
      bal = bal * (1 + i) + s.monthly;
      if (m % 12 === 0) points.push([m / 12, bal]);
    }
    return { name: s.label, points };
  });
  return line({ title: spec.title ?? "Balance over time", subtitle: spec.subtitle, unit: "$", xLabel: "Years", series, note: spec.note });
}

function loanCompare(spec) {
  const bars = spec.scenarios.map((s) => {
    const sc = schedule(s.loan, s.rate, s.years);
    return { label: s.label, parts: [s.loan, sc.interest] };
  });
  const sub = spec.subtitle ?? spec.scenarios.map((s) => `${s.label}: ${full(payment(s.loan, s.rate, s.years))}/mo`).join("  ·  ");
  return stacked({ title: spec.title ?? "Total cost: principal vs interest", subtitle: sub, unit: "$", legend: ["Principal", "Interest"], bars, note: spec.note });
}

const RENDER = { hero, bar, stacked, grouped, line, table, steps, amortization, growth, loanCompare };

const only = process.argv[2];
const files = (await fs.readdir(DIR)).filter((n) => n.endsWith(".images.json") && (!only || n === `${only}.images.json`));
if (!files.length) throw new Error(only ? `No ${DIR}/${only}.images.json` : `No *.images.json in ${DIR}`);
let count = 0;
for (const name of files) {
  const slug = name.replace(/\.images\.json$/, "");
  const specs = JSON.parse(await fs.readFile(path.join(DIR, name), "utf8"));
  const outDir = path.join(DIR, "images", slug);
  await fs.mkdir(outDir, { recursive: true });
  for (const spec of specs) {
    const render = RENDER[spec.type];
    if (!render) throw new Error(`${name}: unknown image type "${spec.type}"`);
    const svg = render(spec);
    await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(path.join(outDir, `${spec.file}.webp`));
    count++;
  }
}
console.log(`Built ${count} image(s) for ${files.length} article(s).`);
