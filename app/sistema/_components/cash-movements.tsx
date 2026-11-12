"use client";

import Link from "next/link";
import { INCOME_SOURCE_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import { formatMoney, formatTime } from "../_lib/format";
import { receiptSummary } from "../_lib/receipts";
import type { MovementOrigin } from "../_lib/cash";
import type { PaymentMethod } from "../_types";
import { BillingMemberCell } from "./billing-member-cell";
import { DataTable, type Column } from "./data-table";
import { Badge } from "./status-badge";
import {
  ALL,
  type CashDay,
  type CashMovementRow,
  type MethodFilter,
  type OriginFilter,
} from "./use-cash-day";

const ORIGIN_LABELS: Record<MovementOrigin, string> = {
  cuota: "Cobro de cuota",
  ...INCOME_SOURCE_LABELS,
};

const ORIGINS = Object.keys(ORIGIN_LABELS) as MovementOrigin[];

function MovementConcept({ row }: { row: CashMovementRow }) {
  const meta = `${PAYMENT_METHOD_LABELS[row.method]} · ${row.registeredBy}`;
  const late = row.afterClosing && (
    <span className="sys-cash__late-badge">
      <Badge tone="warn">Después del cierre</Badge>
    </span>
  );
  if (row.origin === "cuota") {
    return (
      <span className="sys-cash__concept">
        <span className="sys-cash__origin">Cobro de cuota</span>
        {late}
        <BillingMemberCell
          member={row.member}
          detail={row.receipt && receiptSummary(row.receipt)}
        />
        {row.receipt && (
          <Link
            href={`/sistema/comprobantes/${row.receipt.id}`}
            className="sys-cash__receipt"
          >
            Recibo {row.receipt.number}
          </Link>
        )}
        <span className="sys-cash__mobile-meta">{meta}</span>
      </span>
    );
  }
  return (
    <span className="sys-cash__concept">
      <span className="sys-cash__origin">{ORIGIN_LABELS[row.origin]}</span>
      {late}
      <span>{row.income?.description}</span>
      <span className="sys-cash__mobile-meta">{meta}</span>
    </span>
  );
}

const COLUMNS: Column<CashMovementRow>[] = [
  {
    key: "time",
    header: "Hora",
    render: (row) => (
      <span className="sys-cash__time">{formatTime(row.at)}</span>
    ),
  },
  {
    key: "concept",
    header: "Concepto",
    render: (row) => <MovementConcept row={row} />,
  },
  {
    key: "method",
    header: "Medio",
    render: (row) => PAYMENT_METHOD_LABELS[row.method],
    hideOnMobile: true,
  },
  {
    key: "amount",
    header: "Importe",
    align: "end",
    render: (row) => (
      <span className="sys-cash__amount">{formatMoney(row.amount)}</span>
    ),
  },
  {
    key: "user",
    header: "Registró",
    render: (row) => row.registeredBy,
    hideOnMobile: true,
  },
];

export function CashMovements({ cash }: { cash: CashDay }) {
  const filtered =
    cash.methodFilter !== ALL || cash.originFilter !== ALL
      ? ` · ${cash.rows.length} con el filtro`
      : "";
  return (
    <section className="sys-cash__movements" aria-labelledby="cash-movements">
      <div className="sys-cash__section-head">
        <h2 id="cash-movements" className="sys-card__title">
          Movimientos del día
        </h2>
        <p className="sys-cash__count">
          {cash.movementCount === 1
            ? "1 movimiento"
            : `${cash.movementCount} movimientos`}
          {filtered}
        </p>
      </div>

      <div className="sys-toolbar sys-cash__filters">
        <select
          className="sys-input"
          aria-label="Medio de pago"
          value={cash.methodFilter}
          onChange={(event) =>
            cash.setMethodFilter(event.target.value as MethodFilter)
          }
        >
          <option value={ALL}>Todos los medios</option>
          {cash.methods.map((method: PaymentMethod) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </select>
        <select
          className="sys-input"
          aria-label="Origen"
          value={cash.originFilter}
          onChange={(event) =>
            cash.setOriginFilter(event.target.value as OriginFilter)
          }
        >
          <option value={ALL}>Todos los orígenes</option>
          {ORIGINS.map((origin) => (
            <option key={origin} value={origin}>
              {ORIGIN_LABELS[origin]}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={cash.rows}
        rowKey={(row) => row.id}
        caption="Movimientos del día"
        empty={
          cash.movementCount === 0
            ? "No hubo movimientos este día."
            : "No hay movimientos con ese filtro."
        }
      />
    </section>
  );
}
