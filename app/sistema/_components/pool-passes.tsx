"use client";

import Link from "next/link";
import {
  CLEARANCE_STATE_LABELS,
  SEASON_STATUS_LABELS,
} from "../_data/season-labels";
import { DEMO_TODAY } from "../_lib/clock";
import {
  daysLabel,
  formatDate,
  formatDocument,
  formatMoney,
  listName,
} from "../_lib/format";
import type { ClearanceState, PassRow } from "../_lib/season";
import { DataTable, type Column } from "./data-table";
import { StatCard } from "./stat-card";
import { Badge, type BadgeTone } from "./status-badge";
import { usePoolPasses } from "./use-pool-passes";
import type { SeasonModalKind } from "./use-season-modals";

interface PoolPassesProps {
  onAction: (kind: SeasonModalKind, memberId?: string) => void;
}

const CLEARANCE_TONES: Record<ClearanceState, BadgeTone> = {
  vigente: "ok",
  "por-vencer": "warn",
  vencido: "danger",
  "sin-apto": "danger",
};

function ClearanceCell({ row }: { row: PassRow }) {
  const clearance = row.member.medicalClearance;
  return (
    <div className="sys-season__cell">
      <Badge tone={CLEARANCE_TONES[row.clearance]}>
        {CLEARANCE_STATE_LABELS[row.clearance]}
      </Badge>
      {clearance && (
        <span className="sys-season__muted">
          {row.clearance === "por-vencer"
            ? `Vence ${daysLabel(DEMO_TODAY, clearance.expiresAt)}`
            : `${row.clearance === "vencido" ? "Venció" : "Hasta"} el ${formatDate(clearance.expiresAt)}`}
        </span>
      )}
    </div>
  );
}

export function PoolPasses({ onAction }: PoolPassesProps) {
  const passes = usePoolPasses();
  const { season } = passes;

  if (!season) {
    return (
      <section className="sys-card">
        <p className="sys-empty">
          No hay ninguna temporada abierta. Cuando se abra la inscripción vas a
          poder emitir los carnets desde acá.
        </p>
      </section>
    );
  }

  const columns: Column<PassRow>[] = [
    {
      key: "socio",
      header: "Socio",
      render: (row) => (
        <div className="sys-season__cell">
          <Link
            href={`/sistema/socios/${row.member.id}`}
            className="sys-season__link"
          >
            {listName(row.member)}
          </Link>
          <span className="sys-season__muted">
            N.º {row.member.memberNumber}
          </span>
        </div>
      ),
    },
    {
      key: "dni",
      header: "DNI",
      render: (row) => formatDocument(row.member.documentNumber),
      hideOnMobile: true,
    },
    {
      key: "carnet",
      header: "Carnet",
      render: (row) => (
        <div className="sys-season__cell">
          <Badge tone={row.paid ? "ok" : "warn"}>
            {row.paid ? "Pago" : "Pendiente"}
          </Badge>
          <span className="sys-season__muted is-hidden-mobile">
            Pedido el {formatDate(row.pass.requestedAt)}
          </span>
        </div>
      ),
    },
    {
      key: "apto",
      header: "Apto médico",
      render: (row) => <ClearanceCell row={row} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "end",
      render: (row) => (
        <div className="sys-season__row-actions">
          {!row.paid && passes.canCharge && (
            <button
              type="button"
              className="sys-button sys-button--small sys-button--accent"
              onClick={() => onAction("cobro", row.member.id)}
            >
              Cobrar carnet
            </button>
          )}
          {row.clearance !== "vigente" && passes.canManageSeason && (
            <button
              type="button"
              className="sys-button sys-button--small"
              onClick={() => onAction("apto", row.member.id)}
            >
              Cargar apto
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="sys-season__passes">
      <section className="sys-card sys-season__summary">
        <div>
          <p className="sys-eyebrow">Temporada vigente</p>
          <h2 className="sys-card__title">{season.name}</h2>
          <dl className="sys-season__facts">
            <div>
              <dt>Fechas</dt>
              <dd>
                {formatDate(season.startsAt)} al {formatDate(season.endsAt)}
              </dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>
                <Badge tone={season.status === "cerrada" ? "neutral" : "info"}>
                  {SEASON_STATUS_LABELS[season.status]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt>Carnet de socio</dt>
              <dd>{formatMoney(season.memberPassPrice)}</dd>
            </div>
            <div>
              <dt>Día de invitado</dt>
              <dd>{formatMoney(season.guestDayPrice)}</dd>
            </div>
          </dl>
        </div>
        {passes.canManageSeason && (
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={() => onAction("carnet")}
          >
            Emitir carnet
          </button>
        )}
      </section>

      <div className="sys-stats">
        <StatCard
          label="Carnets emitidos"
          value={String(passes.countOf("todos"))}
          hint={`Abre el ${formatDate(season.startsAt)}`}
        />
        <StatCard
          label="Pagos"
          value={String(passes.countOf("pagos"))}
          tone="ok"
        />
        <StatCard
          label="Pendientes de pago"
          value={String(passes.countOf("pendientes"))}
          tone="warn"
        />
        <StatCard
          label="Sin apto vigente"
          value={String(passes.countOf("sin-apto"))}
          hint={`${passes.countOf("por-vencer")} por vencer en 30 días`}
          tone="danger"
        />
      </div>

      <div className="sys-toolbar">
        <input
          className="sys-input sys-toolbar__search"
          type="search"
          placeholder="Buscar por nombre, DNI o número"
          aria-label="Buscar carnet"
          value={passes.query}
          onChange={(event) => passes.setQuery(event.target.value)}
        />
        <div className="sys-season__chips" role="group" aria-label="Situación">
          {passes.filters.map((option) => (
            <button
              key={option.key}
              type="button"
              className="sys-chip"
              aria-pressed={option.key === passes.filter}
              onClick={() => passes.setFilter(option.key)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={passes.rows}
        rowKey={(row) => row.pass.id}
        caption={`Carnets de la ${season.name}`}
        empty="No hay carnets en esta situación."
      />
    </div>
  );
}
