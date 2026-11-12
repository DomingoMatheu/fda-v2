"use client";

import { useState } from "react";
import {
  REPORTS,
  type ReportDefinition,
  type ReportKey,
} from "../_data/reports";
import { percentOf } from "../_lib/chart";
import { DEMO_TODAY } from "../_lib/clock";
import { downloadCsv } from "../_lib/csv";
import {
  delinquencyByCategory,
  delinquencyTable,
  disciplinesTable,
  membersByDiscipline,
  methodsTable,
  movementsByMonth,
  movementsTable,
  paymentMethodTotals,
  revenueByMonth,
  revenueTable,
  tableRows,
  type CategoryDelinquency,
  type MethodTotal,
  type MonthlyMovement,
  type MonthlyRevenue,
  type ReportTable,
} from "../_lib/reports";
import type { DisciplineSummary } from "../_lib/enrollments";
import { useSystem } from "./use-system";

export interface ReportStats {
  yearRevenue: number;
  monthRevenue: number;
  debtors: number;
  billedMembers: number;
  debtShare: number;
  joined: number;
  left: number;
}

interface ReportData {
  active: ReportDefinition;
  select: (key: ReportKey) => void;
  revenue: MonthlyRevenue[];
  delinquency: CategoryDelinquency[];
  movements: MonthlyMovement[];
  disciplines: DisciplineSummary[];
  methods: MethodTotal[];
  // The table of the report on screen, the one "Exportar a Excel" downloads.
  table: ReportTable;
  stats: ReportStats;
  exportVisible: () => void;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function useReportData(): ReportData {
  const { state, notify } = useSystem();
  const [activeKey, setActiveKey] = useState<ReportKey>("recaudacion");
  const active = REPORTS.find(({ key }) => key === activeKey) ?? REPORTS[0];

  const revenue = revenueByMonth(state);
  const delinquency = delinquencyByCategory(state, DEMO_TODAY);
  const movements = movementsByMonth(state);
  const disciplines = membersByDiscipline(state);
  const methods = paymentMethodTotals(state);

  const tables: Record<ReportKey, ReportTable> = {
    recaudacion: revenueTable(revenue),
    morosidad: delinquencyTable(delinquency),
    "altas-bajas": movementsTable(movements),
    disciplinas: disciplinesTable(disciplines),
    "medios-de-pago": methodsTable(methods),
  };

  const billedMembers = sum(delinquency.map(({ total }) => total));
  const debtors = sum(
    delinquency.map(({ counts }) => counts["en-mora"] + counts.moroso),
  );

  return {
    active,
    select: setActiveKey,
    revenue,
    delinquency,
    movements,
    disciplines,
    methods,
    table: tables[active.key],
    stats: {
      yearRevenue: sum(revenue.map(({ collected }) => collected)),
      monthRevenue: revenue[revenue.length - 1]?.collected ?? 0,
      debtors,
      billedMembers,
      debtShare: percentOf(debtors, billedMembers),
      joined: sum(movements.map(({ joined }) => joined)),
      left: sum(movements.map(({ left }) => left)),
    },
    exportVisible: () => {
      downloadCsv(
        `reporte-${active.key}-${DEMO_TODAY}.csv`,
        tableRows(tables[active.key]),
      );
      notify(`Descargaste "${active.title}" para abrir en Excel.`);
    },
  };
}
