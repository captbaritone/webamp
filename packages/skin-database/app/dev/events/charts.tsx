import type { ReactNode } from "react";
import type { Bin } from "./analyze";

// Server-rendered charts for the dev dashboard: plain HTML and SVG, styled by
// dashboard.css.

export function formatMs(ms: number | null): string {
  if (ms == null) return "–";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(ms < 600_000 ? 1 : 0)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

export function formatPercent(fraction: number | null, digits = 1): string {
  if (fraction == null) return "–";
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {note != null && <p className="note">{note}</p>}
      <div className="cards">{children}</div>
    </section>
  );
}

export function Card({
  title,
  note,
  wide = false,
  children,
}: {
  title: string;
  note?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "card wide" : "card"}>
      <h3>{title}</h3>
      {note != null && <p className="note">{note}</p>}
      {children}
    </div>
  );
}

export function Stats({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="stats">
      {items.map((item) => (
        <div key={item.label} className="stat">
          <div className="stat-value">{item.value}</div>
          <div className="stat-label">{item.label}</div>
          {item.hint != null && <div className="stat-hint">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars, each a share of `total` (default: their sum). */
export function Bars({
  rows,
  total,
  format,
}: {
  rows: Array<{ label: ReactNode; value: number; detail?: string }>;
  total?: number;
  // For bars that are rates rather than counts.
  format?: (value: number) => string;
}) {
  if (rows.length === 0) return <Empty />;
  const sum = total ?? rows.reduce((n, row) => n + row.value, 0);
  const max = Math.max(...rows.map((row) => row.value), 0);
  return (
    <div className="bars">
      {rows.map((row, i) => (
        <div key={i} className="bar-row">
          <div className="bar-label">{row.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${max === 0 ? 0 : (row.value / max) * 100}%` }}
            />
          </div>
          <div className="bar-value">
            {format != null
              ? format(row.value)
              : `${row.value.toLocaleString()} · ${formatPercent(
                  sum === 0 ? null : row.value / sum,
                  0
                )}`}
            {row.detail != null && (
              <span className="bar-detail"> {row.detail}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A histogram: a column per bin, labeled with its share of all values. */
export function Histogram({ bins }: { bins: Bin[] }) {
  const total = bins.reduce((n, bin) => n + bin.count, 0);
  if (total === 0) return <Empty />;
  const max = Math.max(...bins.map((bin) => bin.count));
  return (
    <div className="histogram">
      {bins.map((bin) => (
        <div key={bin.label} className="column">
          <div className="column-value">
            {formatPercent(bin.count / total, 0)}
          </div>
          <div className="column-track">
            <div
              className="column-fill"
              style={{ height: `${(bin.count / max) * 100}%` }}
              title={`${bin.count.toLocaleString()} of ${total.toLocaleString()}`}
            />
          </div>
          <div className="column-label">{bin.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Lines over x = 1, 2, 3...; y from 0 to 1. */
export function LineChart({
  series,
  xLabel,
}: {
  series: Array<{ name: string; values: number[] }>;
  xLabel: string;
}) {
  const shown = series.filter((s) => s.values.some((v) => v > 0));
  if (shown.length === 0) return <Empty />;
  const width = 560;
  const height = 220;
  const pad = { left: 36, right: 12, top: 10, bottom: 28 };
  const count = Math.max(...shown.map((s) => s.values.length));
  const x = (i: number) =>
    pad.left + (i / Math.max(1, count - 1)) * (width - pad.left - pad.right);
  const y = (v: number) => pad.top + (1 - v) * (height - pad.top - pad.bottom);
  const xTicks = [0, 4, 9, 19, 29, 49].filter((i) => i < count);
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(v)}
              y2={y(v)}
              className="grid-line"
            />
            <text
              x={pad.left - 6}
              y={y(v) + 4}
              className="axis"
              textAnchor="end"
            >
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 10}
            className="axis"
            textAnchor="middle"
          >
            {i + 1}
          </text>
        ))}
        {shown.map((s, index) => (
          <polyline
            key={s.name}
            fill="none"
            className={`series series-${index}`}
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          />
        ))}
      </svg>
      <div className="legend">
        {shown.map((s, index) => (
          <span key={s.name}>
            <span className={`swatch series-${index}`} />
            {s.name}
          </span>
        ))}
        <span className="legend-axis">x: {xLabel}</span>
      </div>
    </div>
  );
}

export function Table({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Empty() {
  return <p className="empty">No data yet.</p>;
}
