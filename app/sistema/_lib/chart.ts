import { formatMoney } from "./format";

// Scales, shapes and number formats shared by the report charts.

const NICE_STEPS = [1, 2, 2.5, 5, 10];

// Round tick values from zero up to at least `max`: 0, 500, 1.000, …
export function niceTicks(max: number, count = 4, minStep = 0): number[] {
  if (max <= 0) return [0, Math.max(minStep, 1)];
  const raw = max / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const factor = NICE_STEPS.find((step) => step * power >= raw) ?? 10;
  const step = Math.max(factor * power, minStep);
  const ticks: number[] = [];
  for (let tick = 0; tick < max + step; tick += step) ticks.push(tick);
  return ticks;
}

function decimal(value: number): string {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

// "$ 2,4 M", "$ 850 mil": short enough for an axis.
export function compactMoney(amount: number): string {
  if (amount >= 1_000_000) return `$ ${decimal(amount / 1_000_000)} M`;
  if (amount >= 1_000) return `$ ${Math.round(amount / 1_000)} mil`;
  return formatMoney(amount);
}

export function formatPercent(value: number): string {
  return `${decimal(value)}%`;
}

export function percentOf(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 1000) / 10;
}

// A column growing up from the baseline: rounded top, square bottom.
export function columnPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 4,
): string {
  const r = Math.min(radius, height, width / 2);
  const right = x + width;
  const bottom = y + height;
  return `M${x},${bottom}V${y + r}Q${x},${y} ${x + r},${y}H${right - r}Q${right},${y} ${right},${y + r}V${bottom}Z`;
}

// A bar growing right from the baseline: rounded end, square start.
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 4,
): string {
  const r = Math.min(radius, width, height / 2);
  const right = x + width;
  const bottom = y + height;
  return `M${x},${y}H${right - r}Q${right},${y} ${right},${y + r}V${bottom - r}Q${right},${bottom} ${right - r},${bottom}H${x}Z`;
}

export function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Colors a mark can wear; the values live in app/styles/sistema/reports.css.
export type ChartTone = "series-1" | "series-2" | "ok" | "warn" | "danger";

export interface ChartSeries {
  label: string;
  tone: ChartTone;
}

// One slot of a column chart: a month, with one value per series.
export interface ColumnDatum {
  key: string;
  label: string;
  fullLabel: string;
  values: number[];
}

// One row of a 100% stacked bar, with one value per series.
export interface StackedRow {
  key: string;
  label: string;
  detail: string;
  values: number[];
}

// One row of a horizontal bar list.
export interface BarDatum {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
}

export interface Segment {
  index: number;
  x: number;
  width: number;
  share: number;
}

// Splits `width` among the non-zero values, leaving `gap` between segments.
export function stackSegments(
  values: number[],
  width: number,
  gap: number,
): Segment[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  const visible = values.filter((value) => value > 0).length;
  if (total === 0) return [];
  const available = width - gap * (visible - 1);
  const segments: Segment[] = [];
  let x = 0;
  values.forEach((value, index) => {
    if (value === 0) return;
    const segmentWidth = (available * value) / total;
    segments.push({
      index,
      x,
      width: segmentWidth,
      share: percentOf(value, total),
    });
    x += segmentWidth + gap;
  });
  return segments;
}
