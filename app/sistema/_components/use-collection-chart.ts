"use client";

import { useState } from "react";
import {
  columnChartLayout,
  type ChartBox,
  type ColumnChartLayout,
  type ColumnDatum,
} from "../_lib/column-chart";
import type { MonthlyTotal } from "../_lib/dashboard";

export const CHART_BOX: ChartBox = {
  width: 640,
  height: 240,
  top: 28,
  right: 8,
  bottom: 28,
  left: 64,
};

export interface CollectionDatum extends ColumnDatum {
  period: string;
}

interface CollectionChart {
  layout: ColumnChartLayout<CollectionDatum>;
  activeKey?: string;
  show: (key: string) => void;
  hide: () => void;
  // The tallest month and the month in progress carry their value on the cap.
  isLabeled: (key: string) => boolean;
}

export function useCollectionChart(data: MonthlyTotal[]): CollectionChart {
  const [activeKey, setActiveKey] = useState<string>();
  const datums = data.map(({ period, total }) => ({
    key: period,
    period,
    value: total,
  }));
  const peak = datums.reduce<CollectionDatum | undefined>(
    (best, datum) => (!best || datum.value > best.value ? datum : best),
    undefined,
  );
  const current = datums.at(-1);

  return {
    layout: columnChartLayout(datums, CHART_BOX),
    activeKey,
    show: setActiveKey,
    hide: () => setActiveKey(undefined),
    isLabeled: (key) => key === peak?.key || key === current?.key,
  };
}
