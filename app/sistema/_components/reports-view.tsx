"use client";

import {
  DELINQUENCY_SERIES,
  MOVEMENT_SERIES,
  REPORTS,
  REVENUE_SERIES,
} from "../_data/reports";
import { compactMoney, formatNumber, formatPercent } from "../_lib/chart";
import { formatMoney } from "../_lib/format";
import { periodLabel } from "../_lib/period";
import {
  REPORT_PERIODS,
  bestMonth,
  delinquencyRows,
  disciplineBars,
  membersLabel,
  methodBars,
  movementColumns,
  revenueColumns,
} from "../_lib/reports";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { BarList, ColumnChart, StackedBars } from "./report-charts";
import { ReportTableView } from "./report-table";
import { StatCard } from "./stat-card";
import { Tabs } from "./tabs";
import { useReportData } from "./use-report-data";

const RANGE = `${periodLabel(REPORT_PERIODS[0])} a ${periodLabel(REPORT_PERIODS[REPORT_PERIODS.length - 1])}`;

function ReportsContent() {
  const report = useReportData();
  const { active, stats } = report;

  return (
    <>
      <PageHeader
        eyebrow="Comisión directiva"
        title="Reportes"
        description={`Los números del club de ${RANGE.toLowerCase()}, listos para la reunión.`}
        actions={
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={report.exportVisible}
          >
            Exportar a Excel
          </button>
        }
      />
      <div className="sys-stats">
        <StatCard
          label="Recaudado en el año"
          value={compactMoney(stats.yearRevenue)}
          hint={formatMoney(stats.yearRevenue)}
        />
        <StatCard
          label="Cobrado este mes"
          value={compactMoney(stats.monthRevenue)}
          hint="Hasta hoy"
        />
        <StatCard
          label="Socios con deuda"
          value={formatPercent(stats.debtShare)}
          hint={`${stats.debtors} de ${stats.billedMembers} socios que pagan cuota`}
          tone={stats.debtShare > 20 ? "danger" : "warn"}
        />
        <StatCard
          label="Altas en el año"
          value={String(stats.joined)}
          hint={`${stats.left} bajas en el mismo período`}
          tone="ok"
        />
      </div>
      <Tabs
        label="Reportes"
        items={REPORTS.map(({ key, label }) => ({ key, label }))}
        active={active.key}
        onChange={report.select}
      />
      <section
        className="sys-card sys-report"
        aria-labelledby="sys-report-title"
      >
        <div className="sys-report__header">
          <h2 id="sys-report-title" className="sys-card__title">
            {active.title}
          </h2>
          <p className="sys-report__description">{active.description}</p>
        </div>
        {active.key === "recaudacion" && (
          <ColumnChart
            label={active.title}
            data={revenueColumns(report.revenue)}
            series={REVENUE_SERIES}
            formatValue={formatMoney}
            formatTick={compactMoney}
            formatLabel={compactMoney}
            labeledKey={bestMonth(report.revenue)}
          />
        )}
        {active.key === "morosidad" && (
          <StackedBars
            label={active.title}
            rows={delinquencyRows(report.delinquency)}
            series={DELINQUENCY_SERIES}
            formatValue={membersLabel}
          />
        )}
        {active.key === "altas-bajas" && (
          <ColumnChart
            label={active.title}
            data={movementColumns(report.movements)}
            series={MOVEMENT_SERIES}
            formatValue={formatNumber}
            formatTick={formatNumber}
            minStep={1}
          />
        )}
        {active.key === "disciplinas" && (
          <BarList
            label={active.title}
            data={disciplineBars(report.disciplines)}
            tone="series-1"
          />
        )}
        {active.key === "medios-de-pago" && (
          <BarList
            label={active.title}
            data={methodBars(report.methods)}
            tone="series-1"
            valueSpace={150}
          />
        )}
        <ReportTableView title={active.title} table={report.table} />
      </section>
    </>
  );
}

export function ReportsView() {
  return (
    <PermissionGate permission="reports:read">
      <ReportsContent />
    </PermissionGate>
  );
}
