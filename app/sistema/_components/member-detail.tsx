"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, FAMILY_ROLE_LABELS } from "../_data/labels";
import { countLabel } from "../_lib/count-label";
import { oldestOverduePeriod } from "../_lib/billing";
import {
  formatDate,
  formatDocument,
  formatMoney,
  fullName,
} from "../_lib/format";
import { periodLabel } from "../_lib/period";
import { MemberAccountPanel } from "./member-account-panel";
import { MemberInfo } from "./member-info";
import { Modal } from "./modal";
import { PermissionGate } from "./permission-gate";
import { RegisterPaymentModal } from "./register-payment-modal";
import { ReminderLink } from "./reminder-link";
import { StatCard } from "./stat-card";
import { FeeStatusBadge, MemberStatusBadge } from "./status-badge";
import { useMemberDetail } from "./use-member-detail";

interface MemberDetailProps {
  memberId: string;
}

export function MemberDetail({ memberId }: MemberDetailProps) {
  const detail = useMemberDetail(memberId);
  const { data } = detail;
  if (!data) notFound();

  const { member, account, balance } = data;
  const since = oldestOverduePeriod(balance);
  const lastPayment = data.payments[0]?.payment;
  const isHolderAccount = account.id !== member.id;
  const category = member.familyRole
    ? `${CATEGORY_LABELS[member.category]} · ${FAMILY_ROLE_LABELS[member.familyRole]}`
    : CATEGORY_LABELS[member.category];

  return (
    <PermissionGate permission="members:read">
      <Link href="/sistema/socios" className="sys-member__back">
        ← Volver a socios
      </Link>

      <header className="sys-card sys-member__header">
        <div className="sys-member__identity">
          <p className="sys-eyebrow">Socio n.º {member.memberNumber}</p>
          <h1 className="sys-page-title">{fullName(member)}</h1>
          <p className="sys-member__meta">
            {category} · {member.documentType}{" "}
            {formatDocument(member.documentNumber)}
          </p>
          <div className="sys-member__badges">
            <MemberStatusBadge status={member.status} />
            <FeeStatusBadge status={balance.status} />
          </div>
        </div>
        <div className="sys-member__actions">
          {detail.canCharge && (
            <button
              type="button"
              className="sys-button sys-button--primary"
              onClick={detail.openPayment}
              disabled={balance.pending.length === 0}
            >
              Registrar cobro
            </button>
          )}
          <ReminderLink member={member} />
          {detail.canEdit && member.status === "activo" && (
            <button
              type="button"
              className="sys-button sys-button--danger"
              onClick={() => detail.openStatusDialog("suspender")}
            >
              Suspender
            </button>
          )}
          {detail.canEdit && member.status === "suspendido" && (
            <button
              type="button"
              className="sys-button"
              onClick={() => detail.openStatusDialog("reactivar")}
            >
              Reactivar
            </button>
          )}
        </div>
      </header>

      {detail.lastReceiptId && (
        <p className="sys-member__notice" role="status">
          Cobro registrado.{" "}
          <Link href={`/sistema/comprobantes/${detail.lastReceiptId}`}>
            Ver el recibo
          </Link>
        </p>
      )}

      <div className="sys-stats">
        <StatCard
          label="Deuda vencida"
          value={formatMoney(balance.overdueTotal)}
          hint={
            since ? `Desde ${periodLabel(since)}` : "No debe cuotas vencidas"
          }
          tone={balance.overdue.length > 0 ? "danger" : "ok"}
        />
        <StatCard
          label="Pendiente total"
          value={formatMoney(balance.pendingTotal)}
          hint={countLabel(
            balance.pending.length,
            "cuota sin pagar",
            "cuotas sin pagar",
          )}
        />
        <StatCard
          label="Recargo si paga hoy"
          value={formatMoney(balance.surcharge)}
          hint="Sobre las cuotas vencidas"
          tone={balance.surcharge > 0 ? "warn" : "default"}
        />
        <StatCard
          label="Último pago"
          value={lastPayment ? formatDate(lastPayment.paidAt) : "—"}
          hint={
            lastPayment
              ? formatMoney(lastPayment.amount)
              : "Sin pagos registrados"
          }
        />
      </div>

      <MemberInfo data={data} />

      <MemberAccountPanel
        tab={detail.tab}
        onTabChange={detail.setTab}
        fees={data.fees}
        payments={data.payments}
        holderNote={
          isHolderAccount
            ? `Es la cuenta del grupo familiar, a nombre del titular, ${fullName(account)}.`
            : undefined
        }
      />

      {detail.isPaymentOpen && (
        <RegisterPaymentModal
          memberId={member.id}
          onClose={detail.closePayment}
          onRegistered={detail.onRegistered}
        />
      )}

      {detail.statusDialog && (
        <Modal
          title={
            detail.statusDialog === "suspender"
              ? "Suspender socio"
              : "Reactivar socio"
          }
          onClose={detail.closeStatusDialog}
          footer={
            <>
              <button
                type="button"
                className="sys-button"
                onClick={detail.closeStatusDialog}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`sys-button ${detail.statusDialog === "suspender" ? "sys-button--danger" : "sys-button--primary"}`}
                onClick={detail.confirmStatus}
              >
                {detail.statusDialog === "suspender"
                  ? "Sí, suspender"
                  : "Sí, reactivar"}
              </button>
            </>
          }
        >
          <p>
            {detail.statusDialog === "suspender"
              ? `${fullName(member)} no va a poder entrar al club ni a la pileta hasta que se reactive la ficha. Las cuotas siguen corriendo.`
              : `La ficha de ${fullName(member)} vuelve a quedar activa: puede entrar al club si está al día.`}
          </p>
        </Modal>
      )}
    </PermissionGate>
  );
}
