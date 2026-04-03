import { truncateDigitsDisplay } from "../../utils/truncateDigitsDisplay";

type DonutPart = { label: string; value: number; color: string };

const DIGITS = 10;

export function TruncatedText({
  text,
  maxDigits = DIGITS,
  className = "",
}: {
  text: string;
  maxDigits?: number;
  className?: string;
}) {
  const { short, full } = truncateDigitsDisplay(text, maxDigits);
  if (short === full) return <span className={className}>{short}</span>;
  return (
    <span className={`${className} fc-metric-truncated`.trim()} title={full}>
      {short}
    </span>
  );
}

export function DonutChart({
  parts,
  centerLabel,
  centerSub,
}: {
  parts: DonutPart[];
  centerLabel: string;
  centerSub?: string;
}) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
  const safe = total > 0 ? total : 1;
  let acc = 0;
  const stops: string[] = [];
  for (const p of parts) {
    const v = Math.max(0, p.value);
    const from = (acc / safe) * 100;
    acc += v;
    const to = (acc / safe) * 100;
    stops.push(`${p.color} ${from}% ${to}%`);
  }
  if (stops.length === 0) stops.push("#E5E7EB 0% 100%");
  const bg = `conic-gradient(from -90deg, ${stops.join(", ")})`;

  return (
    <div className="fc-calc-donut-wrap">
      <div className="fc-calc-donut-ring" style={{ background: bg }}>
        <div className="fc-calc-donut-hole">
          <div className="fc-calc-donut-center-main">
            <TruncatedText text={centerLabel} className="fc-donut-center-txt" />
          </div>
          {centerSub ? (
            <div className="fc-calc-donut-center-sub">
              <TruncatedText text={centerSub} maxDigits={8} className="fc-donut-center-txt" />
            </div>
          ) : null}
        </div>
      </div>
      <div className="fc-calc-donut-legend">
        {parts.map((p, i) => (
          <div key={i} className="fc-calc-donut-legend-item">
            <span className="fc-calc-donut-swatch" style={{ background: p.color }} />
            <span>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleTable({
  columns,
  rows,
  totalRow,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  totalRow?: Record<string, string | number>;
}) {
  return (
    <div className="fc-schedule-scroll">
      <table className="fc-schedule-table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map(c => {
                const v = r[c.key] ?? "—";
                const s = String(v);
                return (
                  <td key={c.key}>
                    {v === "—" ? "—" : <TruncatedText text={s} className="fc-schedule-cell-txt" />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {totalRow && (
          <tfoot>
            <tr>
              {columns.map(c => {
                const v = totalRow[c.key] ?? "";
                const s = String(v);
                return (
                  <td key={c.key}>
                    {s === "" ? "" : <TruncatedText text={s} className="fc-schedule-cell-txt" />}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export function LineAreaChart({
  points,
  color = "#3B72C4",
  fillOpacity = 0.22,
  height = 120,
}: {
  points: { x: number; y: number }[];
  color?: string;
  fillOpacity?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const w = 100;
  const pad = 4;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  const sx = (v: number) => pad + ((v - minX) / dx) * (w - pad * 2);
  const sy = (v: number) => height - pad - ((v - minY) / dy) * (height - pad * 2);

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
    .join(" ");
  const firstX = sx(points[0]!.x);
  const lastX = sx(points[points.length - 1]!.x);
  const baseY = height - pad;
  const areaD = `${lineD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

  return (
    <svg className="fc-calc-line-chart" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path d={areaD} fill={color} fillOpacity={fillOpacity} stroke="none" />
      <path d={lineD} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
