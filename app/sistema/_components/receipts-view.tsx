"use client";

import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import { formatDate, formatMoney } from "../_lib/format";
import { periodLabel } from "../_lib/period";
import { receiptSummary } from "../_lib/receipts";
import { BillingAmount } from "./billing-amount";
import { BillingMemberCell } from "./billing-member-cell";
import { DataTable, type Column } from "./data-table";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { ALL_PERIODS, useReceipts, type ReceiptRow } from "./use-receipts";

const COLUMNS: Column<ReceiptRow>[] = [
  {
    key: "number",
    header: "Número",
    render: ({ receipt }) => (
      <span className="sys-receipts__number">{receipt.number}</span>
    ),
  },
  {
    key: "date",
    header: "Fecha",
    render: ({ receipt }) => formatDate(receipt.issuedAt),
    hideOnMobile: true,
  },
  {
    key: "member",
    header: "Socio",
    render: ({ member, receipt }) => (
      <BillingMemberCell member={member} detail={receiptSummary(receipt)} />
    ),
  },
  {
    key: "concept",
    header: "Concepto",
    render: ({ receipt }) => receiptSummary(receipt),
    hideOnMobile: true,
  },
  {
    key: "method",
    header: "Medio",
    render: ({ receipt }) => PAYMENT_METHOD_LABELS[receipt.method],
    hideOnMobile: true,
  },
  {
    key: "total",
    header: "Importe",
    align: "end",
    render: ({ receipt }) => <BillingAmount amount={receipt.total} />,
  },
];

export function ReceiptsView() {
  const receipts = useReceipts();
  const count = receipts.rows.length;

  return (
    <PermissionGate permission="billing:read">
      <div className="sys-collections">
        <PageHeader
          eyebrow="Tesorería"
          title="Comprobantes"
          description="Cada cobro emite un recibo numerado. Tocá uno para verlo e imprimirlo."
        />

        <div className="sys-toolbar">
          <input
            type="search"
            className="sys-input sys-toolbar__search"
            placeholder="N.º de recibo, nombre o DNI"
            aria-label="Buscar comprobantes"
            value={receipts.query}
            onChange={(event) => receipts.setQuery(event.target.value)}
          />
          <select
            className="sys-input"
            aria-label="Período"
            value={receipts.period}
            onChange={(event) => receipts.setPeriod(event.target.value)}
          >
            <option value={ALL_PERIODS}>Todos los períodos</option>
            {receipts.periods.map((period) => (
              <option key={period} value={period}>
                {periodLabel(period)}
              </option>
            ))}
          </select>
        </div>

        <p className="sys-receipts__count">
          {count === 1 ? "1 comprobante" : `${count} comprobantes`} ·{" "}
          {formatMoney(receipts.total)}
        </p>

        <DataTable
          columns={COLUMNS}
          rows={receipts.rows}
          rowKey={({ receipt }) => receipt.id}
          rowHref={({ receipt }) => `/sistema/comprobantes/${receipt.id}`}
          caption="Comprobantes emitidos"
          empty="No hay comprobantes con esa búsqueda."
        />
      </div>
    </PermissionGate>
  );
}
