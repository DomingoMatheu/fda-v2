"use client";

import Link from "next/link";
import { ACTIVITY_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import { countLabel } from "../_lib/count-label";
import { DEMO_TODAY } from "../_lib/clock";
import { whenLabel } from "../_lib/dashboard";
import { formatMoney, fullName } from "../_lib/format";
import { CollectionChart } from "./collection-chart";
import { DashboardToday } from "./dashboard-today";
import { DataTable, type Column } from "./data-table";
import { PageHeader } from "./page-header";
import { RegisterPaymentModal } from "./register-payment-modal";
import { StatCard } from "./stat-card";
import { useDashboard, type PaymentRow } from "./use-dashboard";

const PAYMENT_COLUMNS: Column<PaymentRow>[] = [
  {
    key: "when",
    header: "Fecha",
    render: ({ payment }) => whenLabel(payment.paidAt, DEMO_TODAY),
  },
  {
    key: "member",
    header: "Socio",
    render: ({ member }) => (member ? fullName(member) : "Socio"),
  },
  {
    key: "method",
    header: "Medio",
    render: ({ payment }) => PAYMENT_METHOD_LABELS[payment.method],
    hideOnMobile: true,
  },
  {
    key: "amount",
    header: "Importe",
    align: "end",
    render: ({ payment }) => formatMoney(payment.amount),
  },
];

function percentLabel(share: number): string {
  return `${Math.round(share * 100)} %`;
}

export function DashboardView() {
  const dashboard = useDashboard();
  const { stats } = dashboard;
  const month = dashboard.monthLabel.split(" ")[0].toLowerCase();

  return (
    <>
      <PageHeader
        eyebrow={`Inicio · ${dashboard.monthLabel}`}
        title={dashboard.greeting}
        description={`Así viene ${month}: lo cobrado, lo que falta y lo que hay que hacer hoy.`}
        actions={
          <>
            {dashboard.canAddMembers && (
              <Link href="/sistema/socios/nuevo" className="sys-button">
                Nuevo socio
              </Link>
            )}
            {dashboard.canCharge && (
              <button
                type="button"
                className="sys-button sys-button--primary"
                onClick={dashboard.openPayment}
              >
                Registrar cobro
              </button>
            )}
          </>
        }
      />

      <div className="sys-stats">
        <StatCard
          label="Socios activos"
          value={String(stats.activeMembers)}
          hint="Sin contar suspendidos ni bajas"
        />
        <StatCard
          label="Al día"
          value={percentLabel(stats.upToDateShare)}
          hint="De los socios activos"
          tone={stats.upToDateShare >= 0.8 ? "ok" : "warn"}
        />
        <StatCard
          label={`Cobrado en ${month}`}
          value={formatMoney(stats.collectedThisMonth)}
          hint={countLabel(
            stats.paymentsThisMonth,
            "cobro registrado",
            "cobros registrados",
          )}
          tone="ok"
        />
        <StatCard
          label={`Pendiente de ${month}`}
          value={formatMoney(stats.pendingThisMonth)}
          hint={countLabel(
            stats.pendingFeesThisMonth,
            "cuota sin pagar",
            "cuotas sin pagar",
          )}
          tone="warn"
        />
        <StatCard
          label="Carnets de pileta"
          value={String(stats.passesIssued)}
          hint={`${countLabel(stats.passesPaid, "pago", "pagos")} · ${dashboard.seasonName ?? "Sin temporada"}`}
        />
      </div>

      <DashboardToday
        debtors={dashboard.topDebtors}
        debtorCount={dashboard.debtorCount}
        clearances={dashboard.clearances}
        birthdays={dashboard.birthdays}
      />

      <section className="sys-card sys-dashboard__chart">
        <div className="sys-dashboard__chart-head">
          <h2 className="sys-card__title">Recaudación por mes</h2>
          <p className="sys-today__hint">
            Todo lo cobrado en {DEMO_TODAY.slice(0, 4)}, recargos incluidos.
          </p>
        </div>
        <CollectionChart data={dashboard.collection} />
      </section>

      <div className="sys-dashboard__columns">
        <section aria-labelledby="sys-latest-payments">
          <h2 id="sys-latest-payments" className="sys-dashboard__title">
            Últimos cobros
          </h2>
          <DataTable
            caption="Últimos cobros"
            columns={PAYMENT_COLUMNS}
            rows={dashboard.payments}
            rowKey={({ payment }) => payment.id}
            rowHref={({ payment }) =>
              `/sistema/comprobantes/${payment.receiptId}`
            }
          />
        </section>

        <section aria-labelledby="sys-activity">
          <h2 id="sys-activity" className="sys-dashboard__title">
            Actividad reciente
          </h2>
          <ul className="sys-card sys-activity">
            {dashboard.activity.map(({ entry, userName }) => (
              <li key={entry.id} className="sys-activity__item">
                <span
                  className={`sys-activity__kind sys-activity__kind--${entry.kind}`}
                >
                  {ACTIVITY_LABELS[entry.kind]}
                </span>
                <div className="sys-activity__text">
                  {entry.memberId ? (
                    <Link
                      href={`/sistema/socios/${entry.memberId}`}
                      className="sys-member-link"
                    >
                      {entry.summary}
                    </Link>
                  ) : (
                    <span>{entry.summary}</span>
                  )}
                  <span className="sys-activity__meta">
                    {userName} · {whenLabel(entry.at, DEMO_TODAY)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {dashboard.isPaymentOpen && (
        <RegisterPaymentModal onClose={dashboard.closePayment} />
      )}
    </>
  );
}
