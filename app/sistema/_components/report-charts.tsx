"use client";

import {
  barPath,
  columnPath,
  niceTicks,
  stackSegments,
  type BarDatum,
  type ChartSeries,
  type ChartTone,
  type ColumnDatum,
  type StackedRow,
} from "../_lib/chart";
import { useChartReadout } from "./use-chart-readout";
import { useElementWidth } from "./use-element-width";

// Report charts drawn as inline SVG, sized to their container in pixels so
// the text keeps its size on a phone.

const FALLBACK_WIDTH = 640;
const GAP = 2;
const HINT = "Pasá el mouse o tocá una barra para ver el detalle.";

interface ReadoutItem {
  tone: ChartTone;
  label: string;
  value: string;
}

interface ChartReadoutProps {
  title?: string;
  items: ReadoutItem[];
}

function ChartReadout({ title, items }: ChartReadoutProps) {
  return (
    <p className="sys-chart__readout" aria-live="polite">
      {title ? (
        <>
          <span className="sys-chart__readout-title">{title}</span>
          {items.map((item) => (
            <span key={item.label} className="sys-chart__readout-item">
              <span
                className={`sys-chart__key sys-chart__tone--${item.tone}`}
                aria-hidden="true"
              />
              <strong>{item.value}</strong> {item.label}
            </span>
          ))}
        </>
      ) : (
        <span className="sys-chart__hint">{HINT}</span>
      )}
    </p>
  );
}

function ChartLegend({ series }: { series: ChartSeries[] }) {
  return (
    <ul className="sys-chart__legend">
      {series.map((item) => (
        <li key={item.label}>
          <span
            className={`sys-chart__swatch sys-chart__tone--${item.tone}`}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

const COLUMN_HEIGHT = 260;
const COLUMN_MARGIN = { top: 28, right: 4, bottom: 30, left: 56 };
const MAX_COLUMN = 24;
// Below this slot width the month names no longer fit side by side, so
// only every other one is printed.
const MIN_LABEL_SLOT = 34;
const VALUE_LABEL_HALF = 40;

interface ColumnChartProps {
  label: string;
  data: ColumnDatum[];
  series: ChartSeries[];
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  // Slot whose value is printed on the cap, besides the axis.
  labeledKey?: string;
  formatLabel?: (value: number) => string;
  minStep?: number;
}

export function ColumnChart({
  label,
  data,
  series,
  formatValue,
  formatTick,
  labeledKey,
  formatLabel = formatValue,
  minStep = 0,
}: ColumnChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>(FALLBACK_WIDTH);
  const readout = useChartReadout();
  const margin = COLUMN_MARGIN;
  const ticks = niceTicks(
    Math.max(...data.flatMap(({ values }) => values)),
    4,
    minStep,
  );
  const top = ticks[ticks.length - 1];
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = COLUMN_HEIGHT - margin.top - margin.bottom;
  const baseline = margin.top + plotHeight;
  const slot = plotWidth / data.length;
  const labelEvery = slot < MIN_LABEL_SLOT ? 2 : 1;
  const columnWidth = Math.min(
    MAX_COLUMN,
    (slot * 0.72 - GAP * (series.length - 1)) / series.length,
  );
  const groupWidth = columnWidth * series.length + GAP * (series.length - 1);
  const yOf = (value: number): number => baseline - (value / top) * plotHeight;
  const active = data.find(({ key }) => key === readout.active);

  return (
    <div className="sys-chart">
      {series.length > 1 && <ChartLegend series={series} />}
      <ChartReadout
        title={active?.fullLabel}
        items={
          active
            ? series.map((item, index) => ({
                tone: item.tone,
                label: item.label,
                value: formatValue(active.values[index]),
              }))
            : []
        }
      />
      <div ref={ref} className="sys-chart__frame">
        <svg
          className="sys-chart__svg"
          width={width}
          height={COLUMN_HEIGHT}
          role="group"
          aria-label={label}
          onPointerLeave={readout.leave}
        >
          {ticks.map((tick) => (
            <g key={tick} className="sys-chart__grid">
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
              />
              <text x={margin.left - 10} y={yOf(tick)} dy="0.32em">
                {formatTick(tick)}
              </text>
            </g>
          ))}
          {data.map((datum, slotIndex) => {
            const slotX = margin.left + slot * slotIndex;
            const groupX = slotX + (slot - groupWidth) / 2;
            const center = slotX + slot / 2;
            const peak = Math.max(...datum.values);
            return (
              <g
                key={datum.key}
                className={`sys-chart__slot${datum.key === readout.active ? " is-active" : ""}`}
                tabIndex={0}
                role="img"
                aria-label={`${datum.fullLabel}: ${series
                  .map(
                    (item, index) =>
                      `${item.label} ${formatValue(datum.values[index])}`,
                  )
                  .join(", ")}`}
                onPointerEnter={() => readout.show(datum.key)}
                onClick={() => readout.show(datum.key)}
                onFocus={() => readout.show(datum.key)}
                onBlur={readout.hide}
              >
                <rect
                  className="sys-chart__hit"
                  x={slotX}
                  y={margin.top}
                  width={slot}
                  height={plotHeight}
                />
                {datum.values.map(
                  (value, index) =>
                    value > 0 && (
                      <path
                        key={series[index].label}
                        className={`sys-chart__tone--${series[index].tone}`}
                        d={columnPath(
                          groupX + index * (columnWidth + GAP),
                          yOf(value),
                          columnWidth,
                          baseline - yOf(value),
                        )}
                      />
                    ),
                )}
                {datum.key === labeledKey && (
                  <text
                    className="sys-chart__value"
                    x={Math.min(
                      Math.max(center, margin.left + VALUE_LABEL_HALF),
                      width - VALUE_LABEL_HALF,
                    )}
                    y={yOf(peak) - 9}
                  >
                    {formatLabel(peak)}
                  </text>
                )}
                {slotIndex % labelEvery === 0 && (
                  <text
                    className="sys-chart__axis-label"
                    x={center}
                    y={baseline + 20}
                  >
                    {datum.label}
                  </text>
                )}
              </g>
            );
          })}
          <line
            className="sys-chart__baseline"
            x1={margin.left}
            x2={width - margin.right}
            y1={baseline}
            y2={baseline}
          />
        </svg>
      </div>
    </div>
  );
}

const STACK_ROW = 64;
const STACK_BAR = 26;
const STACK_BAR_TOP = 28;
const INSIDE_LABEL_MIN = 46;

interface StackedBarsProps {
  label: string;
  rows: StackedRow[];
  series: ChartSeries[];
  formatValue: (value: number, share: number) => string;
}

// One 100% bar per row, split by series.
export function StackedBars({
  label,
  rows,
  series,
  formatValue,
}: StackedBarsProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>(FALLBACK_WIDTH);
  const readout = useChartReadout();
  const active = rows.find(({ key }) => key === readout.active);
  const activeSegments = active ? stackSegments(active.values, 100, 0) : [];

  return (
    <div className="sys-chart">
      <ChartLegend series={series} />
      <ChartReadout
        title={active?.label}
        items={series.map((item, index) => ({
          tone: item.tone,
          label: item.label,
          value: formatValue(
            active?.values[index] ?? 0,
            activeSegments.find((segment) => segment.index === index)?.share ??
              0,
          ),
        }))}
      />
      <div ref={ref} className="sys-chart__frame">
        <svg
          className="sys-chart__svg"
          width={width}
          height={rows.length * STACK_ROW}
          role="group"
          aria-label={label}
          onPointerLeave={readout.leave}
        >
          {rows.map((row, rowIndex) => {
            const y = rowIndex * STACK_ROW;
            const segments = stackSegments(row.values, width, GAP);
            return (
              <g
                key={row.key}
                className={`sys-chart__slot${row.key === readout.active ? " is-active" : ""}`}
                tabIndex={0}
                role="img"
                aria-label={`${row.label}, ${row.detail}: ${segments
                  .map(
                    (segment) =>
                      `${series[segment.index].label} ${formatValue(row.values[segment.index], segment.share)}`,
                  )
                  .join(", ")}`}
                onPointerEnter={() => readout.show(row.key)}
                onClick={() => readout.show(row.key)}
                onFocus={() => readout.show(row.key)}
                onBlur={readout.hide}
              >
                <rect
                  className="sys-chart__hit"
                  x={0}
                  y={y}
                  width={width}
                  height={STACK_ROW}
                />
                <text className="sys-chart__row-label" x={0} y={y + 17}>
                  {row.label}
                </text>
                <text className="sys-chart__row-detail" x={width} y={y + 17}>
                  {row.detail}
                </text>
                {segments.map((segment) => (
                  <g key={segment.index}>
                    <rect
                      className={`sys-chart__tone--${series[segment.index].tone}`}
                      x={segment.x}
                      y={y + STACK_BAR_TOP}
                      width={segment.width}
                      height={STACK_BAR}
                      rx={4}
                    />
                    {segment.width >= INSIDE_LABEL_MIN && (
                      <text
                        className={`sys-chart__inside sys-chart__inside--${series[segment.index].tone}`}
                        x={segment.x + 8}
                        y={y + STACK_BAR_TOP + STACK_BAR / 2}
                        dy="0.34em"
                      >
                        {Math.round(segment.share)}%
                      </text>
                    )}
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const BAR_ROW = 46;
const BAR_HEIGHT = 16;
const BAR_TOP = 22;

interface BarListProps {
  label: string;
  data: BarDatum[];
  tone: ChartTone;
  // Room kept at the right for the value printed at each bar's tip.
  valueSpace?: number;
}

// Horizontal bars, one per row, each labeled with its value.
export function BarList({ label, data, tone, valueSpace = 64 }: BarListProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>(FALLBACK_WIDTH);
  const max = Math.max(...data.map(({ value }) => value), 1);
  const scale = (width - valueSpace) / max;

  return (
    <div className="sys-chart">
      <div ref={ref} className="sys-chart__frame">
        <svg
          className="sys-chart__svg"
          width={width}
          height={data.length * BAR_ROW}
          role="img"
          aria-label={`${label}: ${data
            .map((datum) => `${datum.label} ${datum.valueLabel}`)
            .join(", ")}`}
        >
          {data.map((datum, index) => {
            const y = index * BAR_ROW;
            const barWidth = datum.value * scale;
            return (
              <g key={datum.key}>
                <text className="sys-chart__row-label" x={0} y={y + 14}>
                  {datum.label}
                </text>
                <line
                  className="sys-chart__track"
                  x1={0}
                  x2={0}
                  y1={y + BAR_TOP - 2}
                  y2={y + BAR_TOP + BAR_HEIGHT + 2}
                />
                {barWidth > 0 && (
                  <path
                    className={`sys-chart__tone--${tone}`}
                    d={barPath(0, y + BAR_TOP, barWidth, BAR_HEIGHT)}
                  />
                )}
                <text
                  className="sys-chart__tip"
                  x={barWidth + 8}
                  y={y + BAR_TOP + BAR_HEIGHT / 2}
                  dy="0.34em"
                >
                  {datum.valueLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
