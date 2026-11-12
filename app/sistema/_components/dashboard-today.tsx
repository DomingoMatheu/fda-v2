"use client";

import Link from "next/link";
import { oldestOverduePeriod } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import type { Birthday, Debtor } from "../_lib/dashboard";
import { yearsLabel } from "../_lib/member-account";
import {
  age,
  daysLabel,
  formatDate,
  formatMoney,
  fullName,
} from "../_lib/format";
import { periodLabel } from "../_lib/period";
import type { Member } from "../_types";
import { ReminderLink } from "./reminder-link";
import { FeeStatusBadge } from "./status-badge";

interface DashboardTodayProps {
  debtors: Debtor[];
  debtorCount: number;
  clearances: Member[];
  birthdays: Birthday[];
}

function memberHref(member: Member): string {
  return `/sistema/socios/${member.id}`;
}

// "Para hoy": who to call about their debt, whose medical clearance is about
// to expire and whose birthday is this week.
export function DashboardToday({
  debtors,
  debtorCount,
  clearances,
  birthdays,
}: DashboardTodayProps) {
  return (
    <section className="sys-today" aria-labelledby="sys-today-title">
      <h2 id="sys-today-title" className="sys-dashboard__title">
        Para hoy
      </h2>
      <div className="sys-today__grid">
        <article className="sys-card sys-today__card">
          <h3 className="sys-card__title">Morosos a contactar</h3>
          <p className="sys-today__hint">
            Las {debtors.length} cuentas con más deuda vencida, de {debtorCount}{" "}
            con cuotas atrasadas.
          </p>
          {debtors.length === 0 ? (
            <p className="sys-empty">No hay cuotas vencidas. ¡Todos al día!</p>
          ) : (
            <ul className="sys-today__list">
              {debtors.map(({ account, balance }) => {
                const since = oldestOverduePeriod(balance);
                return (
                  <li key={account.id} className="sys-today__item">
                    <div className="sys-today__text">
                      <Link
                        href={memberHref(account)}
                        className="sys-member-link"
                      >
                        {fullName(account)}
                      </Link>
                      <span>
                        Debe {formatMoney(balance.overdueTotal)}
                        {since && ` desde ${periodLabel(since)}`}
                      </span>
                    </div>
                    <div className="sys-today__actions">
                      <FeeStatusBadge status={balance.status} />
                      {account.phone ? (
                        <ReminderLink member={account} compact />
                      ) : (
                        <span className="sys-today__muted">Sin teléfono</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/sistema/cobranza" className="sys-today__more">
            Ver todos en Cobranza
          </Link>
        </article>

        <article className="sys-card sys-today__card">
          <h3 className="sys-card__title">Aptos médicos por vencer</h3>
          <p className="sys-today__hint">Vencen en los próximos 30 días.</p>
          {clearances.length === 0 ? (
            <p className="sys-empty">Ningún apto vence este mes.</p>
          ) : (
            <ul className="sys-today__list">
              {clearances.map((member) => {
                const expiresAt = member.medicalClearance?.expiresAt ?? "";
                return (
                  <li key={member.id} className="sys-today__item">
                    <div className="sys-today__text">
                      <Link
                        href={memberHref(member)}
                        className="sys-member-link"
                      >
                        {fullName(member)}
                      </Link>
                      <span>
                        Vence el {formatDate(expiresAt)} (
                        {daysLabel(DEMO_TODAY, expiresAt)})
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="sys-card sys-today__card">
          <h3 className="sys-card__title">Cumpleaños de la semana</h3>
          <p className="sys-today__hint">Para saludar desde el club.</p>
          {birthdays.length === 0 ? (
            <p className="sys-empty">Nadie cumple años esta semana.</p>
          ) : (
            <ul className="sys-today__list">
              {birthdays.map(({ member, date }) => (
                <li key={member.id} className="sys-today__item">
                  <div className="sys-today__text">
                    <Link href={memberHref(member)} className="sys-member-link">
                      {fullName(member)}
                    </Link>
                    <span>
                      Cumple {yearsLabel(age(member.birthDate, date))} ·{" "}
                      {date === DEMO_TODAY ? "hoy" : formatDate(date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
