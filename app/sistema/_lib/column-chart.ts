// Geometry of a single-series column chart drawn as inline SVG: where each
// column goes, and clean ticks for the value axis. Pure, so the server and
// the browser draw exactly the same chart.

export interface ChartBox {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ColumnDatum {
  key: string;
  value: number;
}

export interface ColumnGeometry<Datum extends ColumnDatum> {
  datum: Datum;
  // The column itself.
  x: number;
  y: number;
  width: number;
  height: number;
  // The whole band, used as the hover target.
  bandX: number;
  bandWidth: number;
  // Rounded top, square at the baseline.
  path: string;
}

export interface ChartTick {
  value: number;
  y: number;
}

export interface ColumnChartLayout<Datum extends ColumnDatum> {
  columns: ColumnGeometry<Datum>[];
  ticks: ChartTick[];
  baseline: number;
  plotLeft: number;
  plotRight: number;
}

const MAX_COLUMN_WIDTH = 24;
const CORNER_RADIUS = 4;
const TICK_COUNT = 4;

// Rounds the step up to 1, 2, 2.5 or 5 times a power of ten.
function niceStep(max: number, count: number): number {
  const raw = Math.max(max, 1) / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= raw) ?? 10;
  return nice * power;
}

function columnPath(
  x: number,
  y: number,
  width: number,
  height: number,
): string {
  const radius = Math.min(CORNER_RADIUS, height, width / 2);
  const bottom = y + height;
  return [
    `M${x},${bottom}`,
    `V${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `H${x + width - radius}`,
    `Q${x + width},${y} ${x + width},${y + radius}`,
    `V${bottom}`,
    "Z",
  ].join(" ");
}

export function columnChartLayout<Datum extends ColumnDatum>(
  data: Datum[],
  box: ChartBox,
): ColumnChartLayout<Datum> {
  const plotLeft = box.left;
  const plotRight = box.width - box.right;
  const baseline = box.height - box.bottom;
  const plotHeight = baseline - box.top;
  const step = niceStep(
    Math.max(0, ...data.map(({ value }) => value)),
    TICK_COUNT,
  );
  const top = step * TICK_COUNT;
  const scale = (value: number): number =>
    baseline - (value / top) * plotHeight;
  const bandWidth = (plotRight - plotLeft) / Math.max(data.length, 1);
  const width = Math.min(MAX_COLUMN_WIDTH, bandWidth * 0.6);

  return {
    baseline,
    plotLeft,
    plotRight,
    ticks: Array.from({ length: TICK_COUNT + 1 }, (_, index) => ({
      value: step * index,
      y: scale(step * index),
    })),
    columns: data.map((datum, index) => {
      const bandX = plotLeft + bandWidth * index;
      const x = bandX + (bandWidth - width) / 2;
      const y = scale(datum.value);
      const height = baseline - y;
      return {
        datum,
        x,
        y,
        width,
        height,
        bandX,
        bandWidth,
        path: height > 0 ? columnPath(x, y, width, height) : "",
      };
    }),
  };
}

// Axis labels in pesos: "$ 2,5 M", "$ 800 mil".
export function compactMoney(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = Math.round(amount / 100_000) / 10;
    return `$ ${String(millions).replace(".", ",")} M`;
  }
  if (amount >= 1000) return `$ ${Math.round(amount / 1000)} mil`;
  return `$ ${amount}`;
}
