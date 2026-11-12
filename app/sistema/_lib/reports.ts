import { DISCIPLINE_PROGRAMS } from "../_data/disciplines";
import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import type { MemberCategory, MemberFeeStatus, PaymentMethod } from "../_types";
import { memberBalance } from "./billing";
import {
  compactMoney,
  formatNumber,
  formatPercent,
  percentOf,
  type BarDatum,
  type ColumnDatum,
  type StackedRow,
} from "./chart";
import { DEMO_TODAY } from "./clock";
import { formatMoney } from "./format";
import { type CsvCell } from "./csv";
import { disciplineSummary, type DisciplineSummary } from "./enrollments";
import { periodLabel, periodOf, periodsBetween } from "./period";
import type { SystemState } from "./state";

// Data behind the reports screen: one function per report plus the table
// that the screen shows and exports to Excel.

export const REPORT_PERIODS = periodsBetween(
  `${DEMO_TODAY.slice(0, 4)}-01`,
  periodOf(DEMO_TODAY),
);

export type OwedStatus = Exclude<MemberFeeStatus, "exento">;

export const OWED_STATUSES: OwedStatus[] = ["al-dia", "en-mora", "moroso"];

// Categories that pay a monthly fee (lifetime members do not).
const BILLED_CATEGORIES: MemberCategory[] = [
  "individual",
  "familiar",
  "menor",
  "jubilado",
];

export type ColumnKind = "text" | "count" | "money" | "percent";

export interface ReportColumn {
  header: string;
  kind: ColumnKind;
}

export interface ReportTable {
  columns: ReportColumn[];
  rows: CsvCell[][];
  totals?: CsvCell[];
}

export interface MonthlyRevenue {
  period: string;
  payments: number;
  surcharges: number;
  collected: number;
}

export interface CategoryDelinquency {
  category: MemberCategory;
  counts: Record<OwedStatus, number>;
  total: number;
}

export interface MonthlyMovement {
  period: string;
  joined: number;
  left: number;
}

export interface MethodTotal {
  method: PaymentMethod;
  payments: number;
  amount: number;
  share: number;
}

// "Ene", "Feb", …: month names short enough for a chart axis.
export function shortPeriodLabel(period: string): string {
  return periodLabel(period).slice(0, 3);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function revenueByMonth(state: SystemState): MonthlyRevenue[] {
  return REPORT_PERIODS.map((period) => {
    const payments = state.payments.filter(
      ({ paidAt }) => periodOf(paidAt) === period,
    );
    return {
      period,
      payments: payments.length,
      surcharges: sum(payments.map(({ surcharge }) => surcharge)),
      collected: sum(payments.map(({ amount }) => amount)),
    };
  });
}

export function delinquencyByCategory(
  state: SystemState,
  on: string,
): CategoryDelinquency[] {
  return BILLED_CATEGORIES.map((category) => {
    const counts: Record<OwedStatus, number> = {
      "al-dia": 0,
      "en-mora": 0,
      moroso: 0,
    };
    for (const member of state.members) {
      if (member.category !== category || member.status === "baja") continue;
      const { status } = memberBalance(member, state, on);
      if (status !== "exento") counts[status] += 1;
    }
    return { category, counts, total: sum(Object.values(counts)) };
  });
}

export function movementsByMonth(state: SystemState): MonthlyMovement[] {
  return REPORT_PERIODS.map((period) => ({
    period,
    joined: state.members.filter(
      ({ joinedAt }) => periodOf(joinedAt) === period,
    ).length,
    left: state.members.filter(
      ({ leftAt }) => leftAt !== undefined && periodOf(leftAt) === period,
    ).length,
  }));
}

export function membersByDiscipline(state: SystemState): DisciplineSummary[] {
  return DISCIPLINE_PROGRAMS.map((program) =>
    disciplineSummary(state, program),
  ).sort((a, b) => b.enrolled - a.enrolled);
}

export function paymentMethodTotals(state: SystemState): MethodTotal[] {
  const payments = state.payments.filter(({ paidAt }) =>
    REPORT_PERIODS.includes(periodOf(paidAt)),
  );
  const total = sum(payments.map(({ amount }) => amount));
  const methods = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];
  return methods
    .map((method) => {
      const byMethod = payments.filter((payment) => payment.method === method);
      const amount = sum(byMethod.map((payment) => payment.amount));
      return {
        method,
        payments: byMethod.length,
        amount,
        share: percentOf(amount, total),
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function revenueTable(rows: MonthlyRevenue[]): ReportTable {
  return {
    columns: [
      { header: "Mes", kind: "text" },
      { header: "Cobros", kind: "count" },
      { header: "Recargos por mora", kind: "money" },
      { header: "Recaudado", kind: "money" },
    ],
    rows: rows.map((row) => [
      periodLabel(row.period),
      row.payments,
      row.surcharges,
      row.collected,
    ]),
    totals: [
      "Total",
      sum(rows.map(({ payments }) => payments)),
      sum(rows.map(({ surcharges }) => surcharges)),
      sum(rows.map(({ collected }) => collected)),
    ],
  };
}

export function delinquencyTable(rows: CategoryDelinquency[]): ReportTable {
  return {
    columns: [
      { header: "Categoría", kind: "text" },
      { header: "Socios", kind: "count" },
      { header: "Al día", kind: "count" },
      { header: "En mora", kind: "count" },
      { header: "Morosos", kind: "count" },
      { header: "Con deuda", kind: "percent" },
    ],
    rows: rows.map((row) => [
      CATEGORY_LABELS[row.category],
      row.total,
      row.counts["al-dia"],
      row.counts["en-mora"],
      row.counts.moroso,
      percentOf(row.counts["en-mora"] + row.counts.moroso, row.total),
    ]),
  };
}

export function movementsTable(rows: MonthlyMovement[]): ReportTable {
  const joined = sum(rows.map((row) => row.joined));
  const left = sum(rows.map((row) => row.left));
  return {
    columns: [
      { header: "Mes", kind: "text" },
      { header: "Altas", kind: "count" },
      { header: "Bajas", kind: "count" },
      { header: "Saldo", kind: "count" },
    ],
    rows: rows.map((row) => [
      periodLabel(row.period),
      row.joined,
      row.left,
      row.joined - row.left,
    ]),
    totals: ["Total", joined, left, joined - left],
  };
}

export function disciplinesTable(rows: DisciplineSummary[]): ReportTable {
  return {
    columns: [
      { header: "Disciplina", kind: "text" },
      { header: "Inscriptos", kind: "count" },
      { header: "Cuota mensual", kind: "money" },
      { header: "Ingreso mensual", kind: "money" },
    ],
    rows: rows.map((row) => [
      row.program.name,
      row.enrolled,
      row.program.monthlyFee,
      row.monthlyIncome,
    ]),
    totals: [
      "Total",
      sum(rows.map(({ enrolled }) => enrolled)),
      "",
      sum(rows.map(({ monthlyIncome }) => monthlyIncome)),
    ],
  };
}

export function methodsTable(rows: MethodTotal[]): ReportTable {
  return {
    columns: [
      { header: "Medio de pago", kind: "text" },
      { header: "Cobros", kind: "count" },
      { header: "Monto", kind: "money" },
      { header: "Participación", kind: "percent" },
    ],
    rows: rows.map((row) => [
      PAYMENT_METHOD_LABELS[row.method],
      row.payments,
      row.amount,
      row.share,
    ]),
    totals: [
      "Total",
      sum(rows.map(({ payments }) => payments)),
      sum(rows.map(({ amount }) => amount)),
      100,
    ],
  };
}

// Header, rows and totals, ready for downloadCsv.
export function tableRows(table: ReportTable): CsvCell[][] {
  return [
    table.columns.map(({ header }) => header),
    ...table.rows,
    ...(table.totals ? [table.totals] : []),
  ];
}

export function formatReportCell(cell: CsvCell, kind: ColumnKind): string {
  if (typeof cell === "string") return cell;
  if (kind === "money") return formatMoney(cell);
  if (kind === "percent") return formatPercent(cell);
  return formatNumber(cell);
}

export function revenueColumns(rows: MonthlyRevenue[]): ColumnDatum[] {
  return rows.map((row) => ({
    key: row.period,
    label: shortPeriodLabel(row.period),
    fullLabel: periodLabel(row.period),
    values: [row.collected],
  }));
}

// The best month, the one worth labeling on the chart.
export function bestMonth(rows: MonthlyRevenue[]): string | undefined {
  return [...rows].sort((a, b) => b.collected - a.collected)[0]?.period;
}

export function movementColumns(rows: MonthlyMovement[]): ColumnDatum[] {
  return rows.map((row) => ({
    key: row.period,
    label: shortPeriodLabel(row.period),
    fullLabel: periodLabel(row.period),
    values: [row.joined, row.left],
  }));
}

export function delinquencyRows(rows: CategoryDelinquency[]): StackedRow[] {
  return rows.map((row) => ({
    key: row.category,
    label: CATEGORY_LABELS[row.category],
    detail: `${row.total} socios`,
    values: OWED_STATUSES.map((status) => row.counts[status]),
  }));
}

export function disciplineBars(rows: DisciplineSummary[]): BarDatum[] {
  return rows.map((row) => ({
    key: row.program.id,
    label: row.program.name,
    value: row.enrolled,
    valueLabel: String(row.enrolled),
  }));
}

export function methodBars(rows: MethodTotal[]): BarDatum[] {
  return rows.map((row) => ({
    key: row.method,
    label: PAYMENT_METHOD_LABELS[row.method],
    value: row.amount,
    valueLabel: `${compactMoney(row.amount)} · ${formatPercent(row.share)}`,
  }));
}

export function membersLabel(count: number, share: number): string {
  return `${count} ${count === 1 ? "socio" : "socios"} · ${formatPercent(share)}`;
}
