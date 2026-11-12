"use client";

import type { CSSProperties } from "react";
import { CLUB_NAME } from "@/app/_components/club-info";
import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import {
  dayLabel,
  differenceLabel,
  sharePercent,
  type CashStatus,
} from "../_lib/cash";
import { formatDate, formatDateTime, formatMoney } from "../_lib/format";
import { CashMovements } from "./cash-movements";
import { StatCard, type StatTone } from "./stat-card";
import { Badge, type BadgeTone } from "./status-badge";
import type { CashDay } from "./use-cash-day";

const STATUS_TEXT: Record<CashStatus, { label: string; tone: BadgeTone }> = {
  abierta: { label: "Abierta", tone: "info" },
  "sin-cerrar": { label: "Sin cerrar", tone: "warn" },
  cerrada: { label: "Cerrada", tone: "ok" },
  diferencia: { label: "Cerrada con diferencia", tone: "danger" },
};

const STAT_VALUES: Record<CashStatus, string> = {
  abierta: "Abierta",
  "sin-cerrar": "Sin cerrar",
  cerrada: "Cerrada",
  diferencia: "Cerrada",
};

const STATUS_TONES: Record<CashStatus, StatTone> = {
  abierta: "default",
  "sin-cerrar": "warn",
  cerrada: "ok",
  diferencia: "danger",
};

function count(amount: number, one: string, many: string): string {
  return amount === 1 ? `1 ${one}` : `${amount} ${many}`;
}

function DayBar({ cash }: { cash: CashDay }) {
  return (
    <div className="sys-cash__daybar">
      <div className="sys-cash__daypicker">
        <button
          type="button"
          className="sys-icon-button"
          onClick={cash.goOlder}
          disabled={!cash.goOlder}
          aria-label="Día anterior"
        >
          ‹
        </button>
        <select
          className="sys-input"
          aria-label="Día"
          value={cash.day}
          onChange={(event) => cash.setDay(event.target.value)}
        >
          {cash.days.map(({ day, label }) => (
            <option key={day} value={day}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="sys-icon-button"
          onClick={cash.goNewer}
          disabled={!cash.goNewer}
          aria-label="Día siguiente"
        >
          ›
        </button>
        <Badge tone={STATUS_TEXT[cash.status].tone}>
          {STATUS_TEXT[cash.status].label}
        </Badge>
      </div>
      <div className="sys-cash__actions">
        {cash.canWrite && (
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={() => cash.openModal("closing")}
          >
            {cash.closing ? "Volver a cerrar" : "Cerrar caja"}
          </button>
        )}
        <button type="button" className="sys-button" onClick={cash.print}>
          Imprimir resumen
        </button>
      </div>
    </div>
  );
}

function ClosingCard({ cash }: { cash: CashDay }) {
  const { closing } = cash;
  if (!closing) {
    return (
      <section className="sys-card sys-cash__closing" aria-label="Cierre">
        <h2 className="sys-card__title">Cierre</h2>
        <p className="sys-cash__closing-text">
          {cash.isToday
            ? "La caja de hoy sigue abierta."
            : "Este día quedó sin cerrar."}{" "}
          Al cerrar se cuenta el efectivo y se compara con los{" "}
          <strong>{formatMoney(cash.amounts.efectivo)}</strong> que espera el
          sistema.
        </p>
      </section>
    );
  }
  const tone = closing.difference === 0 ? "ok" : "danger";
  return (
    <section className="sys-card sys-cash__closing" aria-label="Cierre">
      <h2 className="sys-card__title">Cierre</h2>
      <p className="sys-cash__closing-text">
        Cerró {cash.closedBy ?? "—"} el {formatDateTime(closing.closedAt)}.
      </p>
      <dl className="sys-cash__closing-list">
        <div>
          <dt>Efectivo esperado</dt>
          <dd>{formatMoney(closing.expected.efectivo)}</dd>
        </div>
        <div>
          <dt>Efectivo contado</dt>
          <dd>{formatMoney(closing.countedCash)}</dd>
        </div>
        <div>
          <dt>Diferencia</dt>
          <dd>
            <Badge tone={tone}>{differenceLabel(closing.difference)}</Badge>
          </dd>
        </div>
      </dl>
      {closing.notes && (
        <p className="sys-cash__notes">Notas: {closing.notes}</p>
      )}
      {cash.afterClosingCount > 0 && (
        <p className="sys-cash__late" role="status">
          {count(
            cash.afterClosingCount,
            "movimiento se registró",
            "movimientos se registraron",
          )}{" "}
          después del cierre por {formatMoney(cash.afterClosingTotal)}. No están
          en este cierre: volvé a cerrar para incluirlos.
        </p>
      )}
    </section>
  );
}

function MethodTotals({ cash }: { cash: CashDay }) {
  return (
    <section className="sys-card sys-cash__methods" aria-labelledby="cash-mt">
      <h2 id="cash-mt" className="sys-card__title">
        Por medio de pago
      </h2>
      <ul className="sys-cash__method-list">
        {cash.methods.map((method) => {
          const amount = cash.amounts[method];
          return (
            <li key={method} className="sys-cash__method">
              <span className="sys-cash__method-name">
                {PAYMENT_METHOD_LABELS[method]}
              </span>
              <span className="sys-cash__method-amount">
                {formatMoney(amount)}
              </span>
              <span
                className="sys-cash__method-bar"
                style={
                  {
                    "--share": `${sharePercent(amount, cash.total)}%`,
                  } as CSSProperties
                }
                aria-hidden="true"
              />
            </li>
          );
        })}
        <li className="sys-cash__method is-total">
          <span className="sys-cash__method-name">Total</span>
          <span className="sys-cash__method-amount">
            {formatMoney(cash.total)}
          </span>
        </li>
      </ul>
    </section>
  );
}

export function CashDayPanel({ cash }: { cash: CashDay }) {
  const statusHint = cash.closing
    ? differenceLabel(cash.closing.difference)
    : cash.isToday
      ? "Falta el cierre del día"
      : "No se hizo el cierre";

  return (
    <div className="sys-cash__day">
      <div className="sys-cash__print-head">
        <p>{CLUB_NAME}</p>
        <h2>
          Resumen de caja · {dayLabel(cash.day)} · {formatDate(cash.day)}
        </h2>
      </div>

      <DayBar cash={cash} />

      <div className="sys-stats" aria-label="Resumen del día">
        <StatCard
          label="Total del día"
          value={formatMoney(cash.total)}
          hint={count(cash.movementCount, "movimiento", "movimientos")}
        />
        <StatCard
          label="Efectivo"
          value={formatMoney(cash.amounts.efectivo)}
          hint="Lo que tiene que haber en la caja"
        />
        <StatCard
          label="Cobros de cuotas"
          value={formatMoney(cash.feesTotal)}
          hint={count(cash.feesCount, "cobro", "cobros")}
        />
        <StatCard
          label="Otros ingresos"
          value={formatMoney(cash.othersTotal)}
          hint={count(cash.othersCount, "ingreso", "ingresos")}
        />
        <StatCard
          label="Estado de la caja"
          value={STAT_VALUES[cash.status]}
          hint={statusHint}
          tone={STATUS_TONES[cash.status]}
        />
      </div>

      <div className="sys-cash__grid">
        <MethodTotals cash={cash} />
        <ClosingCard cash={cash} />
      </div>

      <CashMovements cash={cash} />
    </div>
  );
}
