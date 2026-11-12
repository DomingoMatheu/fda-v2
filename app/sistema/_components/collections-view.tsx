"use client";

import Link from "next/link";
import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import type { Debtor } from "../_lib/collections";
import { formatDate, formatMoney } from "../_lib/format";
import { periodLabel } from "../_lib/period";
import { BillingAmount } from "./billing-amount";
import { BillingMemberCell } from "./billing-member-cell";
import { DataTable, type Column } from "./data-table";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { RegisterPaymentModal } from "./register-payment-modal";
import { ReminderLink } from "./reminder-link";
import { StatCard } from "./stat-card";
import { FeeStateBadge, FeeStatusBadge } from "./status-badge";
import { Tabs } from "./tabs";
import {
  useCollections,
  type PaidFeeRow,
  type PendingFeeRow,
} from "./use-collections";

function monthsLabel(months: number): string {
  return months === 1 ? "1 mes" : `${months} meses`;
}

export function CollectionsView() {
  const collections = useCollections();
  const { summary, canCharge, openCharge } = collections;

  const chargeButton = (memberId: string) =>
    canCharge && (
      <button
        type="button"
        className="sys-button sys-button--small sys-button--primary"
        onClick={() => openCharge(memberId)}
      >
        Cobrar
      </button>
    );

  const pendingColumns: Column<PendingFeeRow>[] = [
    {
      key: "member",
      header: "Socio",
      render: ({ member, fee }) => (
        <BillingMemberCell member={member} detail={fee.description} />
      ),
    },
    {
      key: "concept",
      header: "Concepto",
      render: ({ fee }) => fee.description,
      hideOnMobile: true,
    },
    {
      key: "amount",
      header: "Importe",
      align: "end",
      render: ({ fee, state }) => (
        <BillingAmount amount={fee.amount} overdue={state === "vencida"} />
      ),
    },
    {
      key: "due",
      header: "Vence",
      render: ({ fee }) => formatDate(fee.dueDate),
      hideOnMobile: true,
    },
    {
      key: "state",
      header: "Estado",
      render: ({ state }) => <FeeStateBadge state={state} />,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: ({ fee }) => chargeButton(fee.memberId),
    },
  ];

  const paidColumns: Column<PaidFeeRow>[] = [
    {
      key: "member",
      header: "Socio",
      render: ({ member, fee }) => (
        <BillingMemberCell member={member} detail={fee.description} />
      ),
    },
    {
      key: "concept",
      header: "Concepto",
      render: ({ fee }) => fee.description,
      hideOnMobile: true,
    },
    {
      key: "amount",
      header: "Importe",
      align: "end",
      render: ({ fee }) => <BillingAmount amount={fee.amount} />,
    },
    {
      key: "paid",
      header: "Pagada",
      render: ({ payment }) => (payment ? formatDate(payment.paidAt) : "—"),
      hideOnMobile: true,
    },
    {
      key: "method",
      header: "Medio",
      render: ({ payment }) =>
        payment ? PAYMENT_METHOD_LABELS[payment.method] : "—",
      hideOnMobile: true,
    },
    {
      key: "receipt",
      header: "Recibo",
      align: "end",
      render: ({ payment }) =>
        payment && (
          <Link
            href={`/sistema/comprobantes/${payment.receiptId}`}
            className="sys-collections__link"
          >
            Ver recibo
          </Link>
        ),
    },
  ];

  const debtorColumns: Column<Debtor>[] = [
    {
      key: "member",
      header: "Socio",
      render: ({ member, months }) => (
        <BillingMemberCell
          member={member}
          detail={`Debe ${monthsLabel(months)}`}
        />
      ),
    },
    {
      key: "months",
      header: "Debe",
      render: ({ months }) => monthsLabel(months),
      hideOnMobile: true,
    },
    {
      key: "since",
      header: "Desde",
      render: ({ since }) => periodLabel(since),
      hideOnMobile: true,
    },
    {
      key: "debt",
      header: "Deuda",
      align: "end",
      render: ({ balance }) => (
        <BillingAmount amount={balance.overdueTotal} overdue />
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: ({ balance }) => <FeeStatusBadge status={balance.status} />,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: ({ member }) => (
        <span className="sys-collections__actions">
          {chargeButton(member.id)}
          <ReminderLink member={member} compact />
        </span>
      ),
    },
  ];

  return (
    <PermissionGate permission="billing:read">
      <div className="sys-collections">
        <PageHeader
          eyebrow="Tesorería"
          title="Cobranza"
          description="Cuotas del período, lo cobrado y quién debe."
          actions={
            canCharge && (
              <button
                type="button"
                className="sys-button sys-button--primary"
                onClick={() => openCharge()}
              >
                Registrar cobro
              </button>
            )
          }
        />

        {collections.lastReceipt && (
          <div className="sys-collections__notice" role="status">
            <p>
              Se emitió el recibo{" "}
              <strong>{collections.lastReceipt.number}</strong> por{" "}
              {formatMoney(collections.lastReceipt.total)}.
            </p>
            <Link
              href={`/sistema/comprobantes/${collections.lastReceipt.id}`}
              className="sys-button sys-button--small"
            >
              Ver recibo
            </Link>
            <button
              type="button"
              className="sys-collections__dismiss"
              onClick={collections.dismissLastReceipt}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        )}

        <div className="sys-toolbar">
          <label className="sys-collections__period">
            <span className="sys-field__label">Período</span>
            <select
              className="sys-input"
              value={collections.period}
              onChange={(event) => collections.setPeriod(event.target.value)}
            >
              {collections.periods.map((period) => (
                <option key={period} value={period}>
                  {periodLabel(period)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sys-stats">
          <StatCard
            label="Esperado"
            value={formatMoney(summary.expected)}
            hint={`${summary.feeCount} cuotas emitidas`}
          />
          <StatCard
            label="Cobrado"
            value={formatMoney(summary.collected)}
            hint={`${summary.paidCount} cuotas pagas`}
            tone="ok"
          />
          <StatCard
            label="Pendiente"
            value={formatMoney(summary.pending)}
            hint={`${summary.pendingCount} cuotas, ${collections.overdueCount} vencidas`}
            tone={summary.pending > 0 ? "warn" : "ok"}
          />
          <StatCard
            label="% cobrado"
            value={`${summary.percent} %`}
            hint={periodLabel(collections.period)}
            tone={summary.percent >= 80 ? "ok" : "default"}
          />
        </div>

        <Tabs
          items={collections.tabs}
          active={collections.tab}
          onChange={collections.setTab}
          label="Cuotas"
        />

        {collections.tab === "pendientes" && (
          <DataTable
            columns={pendingColumns}
            rows={collections.pendingRows}
            rowKey={({ fee }) => fee.id}
            caption={`Cuotas pendientes de ${periodLabel(collections.period)}`}
            empty="No quedan cuotas pendientes en este período."
          />
        )}
        {collections.tab === "cobradas" && (
          <DataTable
            columns={paidColumns}
            rows={collections.paidRows}
            rowKey={({ fee }) => fee.id}
            caption={`Cuotas cobradas de ${periodLabel(collections.period)}`}
            empty="Todavía no se cobró ninguna cuota de este período."
          />
        )}
        {collections.tab === "morosos" && (
          <>
            <p className="sys-collections__note">
              Todos los socios con cuotas vencidas, de cualquier período,
              ordenados por deuda. El recargo se suma al cobrar.
            </p>
            <DataTable
              columns={debtorColumns}
              rows={collections.debtorRows}
              rowKey={({ member }) => member.id}
              caption="Socios con cuotas vencidas"
              empty="Nadie tiene cuotas vencidas."
            />
          </>
        )}

        {collections.charge && (
          <RegisterPaymentModal
            memberId={collections.charge.memberId}
            onClose={collections.closeCharge}
            onRegistered={collections.onRegistered}
          />
        )}
      </div>
    </PermissionGate>
  );
}
