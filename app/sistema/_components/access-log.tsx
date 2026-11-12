"use client";

import Link from "next/link";
import { ACCESS_RESULT_LABELS } from "../_data/season-labels";
import { formatDocument, formatTime, listName } from "../_lib/format";
import { DataTable, type Column } from "./data-table";
import { StatCard } from "./stat-card";
import { Badge } from "./status-badge";
import { useAccessLog, type AccessLogRow } from "./use-access-log";

const COLUMNS: Column<AccessLogRow>[] = [
  {
    key: "hora",
    header: "Hora",
    render: ({ log }) => (
      <span className="sys-season__time">{formatTime(log.at)}</span>
    ),
  },
  {
    key: "persona",
    header: "Persona",
    render: ({ log, member }) => (
      <div className="sys-season__cell">
        {member ? (
          <Link
            href={`/sistema/socios/${member.id}`}
            className="sys-season__link"
          >
            {listName(member)}
          </Link>
        ) : (
          <strong>
            {log.result === "permitido" ? "Visitante" : "No socio"}
          </strong>
        )}
        <span className="sys-season__muted">
          DNI {formatDocument(log.documentNumber)}
        </span>
        {log.reason && (
          <span className="sys-season__muted sys-season__mobile-only">
            {log.reason}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "resultado",
    header: "Resultado",
    render: ({ log }) => (
      <Badge tone={log.result === "permitido" ? "ok" : "danger"}>
        {ACCESS_RESULT_LABELS[log.result]}
      </Badge>
    ),
  },
  {
    key: "motivo",
    header: "Motivo",
    render: ({ log }) => log.reason ?? "—",
    hideOnMobile: true,
  },
];

export function AccessLogView() {
  const view = useAccessLog();
  return (
    <div className="sys-season__log">
      <div className="sys-stats">
        <StatCard label="Ingresos" value={String(view.total)} />
        <StatCard label="Permitidos" value={String(view.allowed)} tone="ok" />
        <StatCard label="Denegados" value={String(view.denied)} tone="danger" />
      </div>
      <div className="sys-toolbar">
        <div className="sys-season__chips" role="group" aria-label="Resultado">
          {view.filters.map((option) => (
            <button
              key={option.key}
              type="button"
              className="sys-chip"
              aria-pressed={option.key === view.filter}
              onClick={() => view.setFilter(option.key)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={view.rows}
        rowKey={({ log }) => log.id}
        caption="Ingresos de hoy"
        empty="Todavía no hay ingresos registrados hoy."
      />
    </div>
  );
}
