"use client";

import { FEE_CONCEPT_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import { formatDate, formatMoney } from "../_lib/format";
import { periodLabel } from "../_lib/period";
import { DataTable, type Column } from "./data-table";
import { FeeStateBadge } from "./status-badge";
import { Tabs } from "./tabs";
import type {
  AccountTab,
  FeeRow,
  PaymentWithReceipt,
} from "./use-member-detail";

const FEE_COLUMNS: Column<FeeRow>[] = [
  {
    key: "period",
    header: "Período",
    render: ({ fee }) => periodLabel(fee.period),
    hideOnMobile: true,
  },
  {
    key: "concept",
    header: "Concepto",
    render: ({ fee }) => (
      <span className="sys-member__concept">
        <strong>{fee.description}</strong>
        <span>
          {FEE_CONCEPT_LABELS[fee.concept]} · vence {formatDate(fee.dueDate)}
        </span>
      </span>
    ),
  },
  {
    key: "amount",
    header: "Importe",
    align: "end",
    render: ({ fee }) => formatMoney(fee.amount),
  },
  {
    key: "state",
    header: "Estado",
    render: ({ state }) => <FeeStateBadge state={state} />,
  },
];

const PAYMENT_COLUMNS: Column<PaymentWithReceipt>[] = [
  {
    key: "date",
    header: "Fecha",
    render: ({ payment }) => formatDate(payment.paidAt),
  },
  {
    key: "receipt",
    header: "Recibo",
    render: ({ receipt }) => receipt?.number ?? "—",
  },
  {
    key: "method",
    header: "Medio",
    render: ({ payment }) => PAYMENT_METHOD_LABELS[payment.method],
    hideOnMobile: true,
  },
  {
    key: "fees",
    header: "Cuotas",
    render: ({ payment }) => payment.feeIds.length,
    align: "end",
    hideOnMobile: true,
  },
  {
    key: "amount",
    header: "Importe",
    align: "end",
    render: ({ payment }) => formatMoney(payment.amount),
  },
];

interface MemberAccountPanelProps {
  tab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  fees: FeeRow[];
  payments: PaymentWithReceipt[];
  holderNote?: string;
}

// "Estado de cuenta": the account's fees and the payments that settled them.
export function MemberAccountPanel({
  tab,
  onTabChange,
  fees,
  payments,
  holderNote,
}: MemberAccountPanelProps) {
  return (
    <section className="sys-member__account" aria-labelledby="sys-account">
      <h2 id="sys-account" className="sys-member__title">
        Estado de cuenta
      </h2>
      {holderNote && <p className="sys-member__notes">{holderNote}</p>}
      <Tabs
        label="Estado de cuenta"
        active={tab}
        onChange={onTabChange}
        items={[
          { key: "cuotas", label: "Cuotas", count: fees.length },
          { key: "pagos", label: "Pagos", count: payments.length },
        ]}
      />
      {tab === "cuotas" ? (
        <DataTable
          caption="Cuotas de la cuenta"
          columns={FEE_COLUMNS}
          rows={fees}
          rowKey={({ fee }) => fee.id}
          empty="La cuenta no tiene cuotas."
        />
      ) : (
        <DataTable
          caption="Pagos de la cuenta"
          columns={PAYMENT_COLUMNS}
          rows={payments}
          rowKey={({ payment }) => payment.id}
          rowHref={({ payment }) =>
            `/sistema/comprobantes/${payment.receiptId}`
          }
          empty="Todavía no registró pagos."
        />
      )}
    </section>
  );
}
