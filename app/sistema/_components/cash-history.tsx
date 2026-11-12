"use client";

import { differenceLabel } from "../_lib/cash";
import { formatDate, formatMoney, formatTime } from "../_lib/format";
import { DataTable, type Column } from "./data-table";
import { Badge } from "./status-badge";
import { useCashHistory, type ClosingRow } from "./use-cash-history";

function columns(onShowDay: (day: string) => void): Column<ClosingRow>[] {
  return [
    {
      key: "date",
      header: "Fecha",
      render: ({ closing }) => (
        <button
          type="button"
          className="sys-cash__day-link"
          onClick={() => onShowDay(closing.date)}
          aria-label={`Ver la caja del ${formatDate(closing.date)}`}
        >
          {formatDate(closing.date)}
        </button>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "end",
      render: ({ total }) => formatMoney(total),
    },
    {
      key: "expected",
      header: "Efectivo esperado",
      align: "end",
      render: ({ closing }) => formatMoney(closing.expected.efectivo),
      hideOnMobile: true,
    },
    {
      key: "counted",
      header: "Contado",
      align: "end",
      render: ({ closing }) => formatMoney(closing.countedCash),
      hideOnMobile: true,
    },
    {
      key: "difference",
      header: "Diferencia",
      render: ({ closing }) => (
        <Badge tone={closing.difference === 0 ? "ok" : "danger"}>
          {differenceLabel(closing.difference)}
        </Badge>
      ),
    },
    {
      key: "closedBy",
      header: "Cerró",
      render: ({ closing, closedBy }) => (
        <span className="sys-cash__closed-by">
          {closedBy}
          <span>
            {formatDate(closing.closedAt)} {formatTime(closing.closedAt)}
          </span>
        </span>
      ),
      hideOnMobile: true,
    },
  ];
}

export function CashHistory({
  onShowDay,
}: {
  onShowDay: (day: string) => void;
}) {
  const history = useCashHistory();
  const total = history.rows.length;
  return (
    <section className="sys-cash__history" aria-labelledby="cash-history">
      <div className="sys-cash__section-head">
        <div>
          <h2 id="cash-history" className="sys-card__title">
            Historial de cierres
          </h2>
          <p className="sys-cash__count">
            {total === 1 ? "1 cierre" : `${total} cierres`} ·{" "}
            {history.shortCount === 0
              ? "ninguno con diferencia"
              : history.shortCount === 1
                ? "1 con diferencia"
                : `${history.shortCount} con diferencia`}
          </p>
        </div>
        <button
          type="button"
          className="sys-button"
          onClick={history.exportCsv}
          disabled={total === 0}
        >
          Exportar CSV
        </button>
      </div>
      <DataTable
        columns={columns(onShowDay)}
        rows={history.rows}
        rowKey={({ closing }) => closing.id}
        caption="Historial de cierres de caja"
        empty="Todavía no hay cierres de caja."
      />
    </section>
  );
}
