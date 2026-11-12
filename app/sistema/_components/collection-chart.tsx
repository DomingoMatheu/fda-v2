"use client";

import type { CSSProperties } from "react";
import { compactMoney } from "../_lib/column-chart";
import type { MonthlyTotal } from "../_lib/dashboard";
import { formatMoney } from "../_lib/format";
import { periodLabel } from "../_lib/period";
import { CHART_BOX, useCollectionChart } from "./use-collection-chart";

interface CollectionChartProps {
  data: MonthlyTotal[];
}

function shortMonth(period: string): string {
  return periodLabel(period).slice(0, 3);
}

function percent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

// "Recaudación por mes": one column per month of the year; the month in
// progress is drawn in the accent color. Hover or focus a month to read it.
export function CollectionChart({ data }: CollectionChartProps) {
  const { layout, activeKey, show, hide, isLabeled } = useCollectionChart(data);
  const currentKey = data.at(-1)?.period;
  const active = layout.columns.find(({ datum }) => datum.key === activeKey);

  return (
    <div className="sys-chart">
      <svg
        className="sys-chart__svg"
        viewBox={`0 0 ${CHART_BOX.width} ${CHART_BOX.height}`}
        role="group"
        aria-label="Recaudación por mes del año"
      >
        {layout.ticks.map((tick) => (
          <g key={tick.value}>
            <line
              className="sys-chart__grid"
              x1={layout.plotLeft}
              x2={layout.plotRight}
              y1={tick.y}
              y2={tick.y}
            />
            <text
              className="sys-chart__tick"
              x={layout.plotLeft - 10}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {compactMoney(tick.value)}
            </text>
          </g>
        ))}
        {layout.columns.map((column) => {
          const { datum } = column;
          const isCurrent = datum.key === currentKey;
          return (
            <g
              key={datum.key}
              className={`sys-chart__column${isCurrent ? " is-current" : ""}${datum.key === activeKey ? " is-active" : ""}`}
            >
              {column.path && <path d={column.path} />}
              {isLabeled(datum.key) && (
                <text
                  className="sys-chart__value"
                  x={column.x + column.width / 2}
                  y={column.y - 8}
                  textAnchor="middle"
                >
                  {compactMoney(datum.value)}
                </text>
              )}
              <text
                className="sys-chart__month"
                x={column.x + column.width / 2}
                y={layout.baseline + 18}
                textAnchor="middle"
              >
                {shortMonth(datum.period)}
              </text>
              <rect
                className="sys-chart__hit"
                x={column.bandX}
                y={CHART_BOX.top}
                width={column.bandWidth}
                height={layout.baseline - CHART_BOX.top}
                tabIndex={0}
                aria-label={`${periodLabel(datum.period)}: ${formatMoney(datum.value)}`}
                onMouseEnter={() => show(datum.key)}
                onMouseLeave={hide}
                onFocus={() => show(datum.key)}
                onBlur={hide}
              />
            </g>
          );
        })}
        <line
          className="sys-chart__baseline"
          x1={layout.plotLeft}
          x2={layout.plotRight}
          y1={layout.baseline}
          y2={layout.baseline}
        />
      </svg>
      {active && (
        <div
          className="sys-chart__tooltip"
          style={
            {
              "--x": percent(active.x + active.width / 2, CHART_BOX.width),
              "--y": percent(active.y, CHART_BOX.height),
            } as CSSProperties
          }
        >
          <span>{periodLabel(active.datum.period)}</span>
          <strong>{formatMoney(active.datum.value)}</strong>
          {active.datum.key === currentKey && <span>Mes en curso</span>}
        </div>
      )}
      <table className="sys-visually-hidden">
        <caption>Recaudación por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Cobrado</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ period, total }) => (
            <tr key={period}>
              <td>{periodLabel(period)}</td>
              <td>{formatMoney(total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
