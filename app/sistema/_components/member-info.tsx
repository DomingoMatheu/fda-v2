"use client";

import Link from "next/link";
import {
  CATEGORY_LABELS,
  FAMILY_PLAN_LABELS,
  FAMILY_ROLE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../_data/labels";
import { CLEARANCE_LABELS, GENDER_LABELS } from "../_data/member-labels";
import { DEMO_TODAY } from "../_lib/clock";
import { yearsLabel } from "../_lib/member-account";
import {
  age,
  formatDate,
  formatDocument,
  formatMoney,
  fullName,
} from "../_lib/format";
import type { ClearanceState } from "../_lib/member-account";
import { Badge, type BadgeTone } from "./status-badge";
import type { MemberDetailData } from "./use-member-detail";

const CLEARANCE_TONES: Record<ClearanceState, BadgeTone> = {
  vigente: "ok",
  "por-vencer": "warn",
  vencido: "danger",
  "sin-apto": "neutral",
};

interface MemberInfoProps {
  data: MemberDetailData;
}

// The information cards of the member page: personal and contact details,
// family group, disciplines and pool season.
export function MemberInfo({ data }: MemberInfoProps) {
  const { member, account, group, family, programs, pool, clearance } = data;
  const { address, medicalClearance } = member;

  return (
    <div className="sys-member__cards">
      <section className="sys-card">
        <h2 className="sys-card__title">Datos personales</h2>
        <dl className="sys-member__dl">
          <div>
            <dt>{member.documentType}</dt>
            <dd>{formatDocument(member.documentNumber)}</dd>
          </div>
          <div>
            <dt>Nacimiento</dt>
            <dd>
              {formatDate(member.birthDate)} (
              {yearsLabel(age(member.birthDate, DEMO_TODAY))})
            </dd>
          </div>
          <div>
            <dt>Género</dt>
            <dd>{GENDER_LABELS[member.gender]}</dd>
          </div>
          <div>
            <dt>Socio desde</dt>
            <dd>{formatDate(member.joinedAt)}</dd>
          </div>
          {member.leftAt && (
            <div>
              <dt>Baja</dt>
              <dd>{formatDate(member.leftAt)}</dd>
            </div>
          )}
          <div>
            <dt>Paga con</dt>
            <dd>{PAYMENT_METHOD_LABELS[member.preferredPaymentMethod]}</dd>
          </div>
        </dl>
        {member.notes && <p className="sys-member__notes">{member.notes}</p>}
      </section>

      <section className="sys-card">
        <h2 className="sys-card__title">Contacto</h2>
        <dl className="sys-member__dl">
          <div>
            <dt>Teléfono</dt>
            <dd>{member.phone ?? "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd className="sys-member__break">{member.email ?? "—"}</dd>
          </div>
          <div>
            <dt>Domicilio</dt>
            <dd>
              {address.street} {address.number}
              {address.floor && `, ${address.floor}`}
              <br />
              {address.city}, {address.province}
            </dd>
          </div>
        </dl>
        {!member.phone && account.id !== member.id && account.phone && (
          <p className="sys-member__notes">
            Los avisos van al titular, {fullName(account)}: {account.phone}.
          </p>
        )}
      </section>

      <section className="sys-card">
        <h2 className="sys-card__title">Grupo familiar</h2>
        {group ? (
          <>
            <p className="sys-member__lead">
              {data.groupName} · Plan {FAMILY_PLAN_LABELS[group.plan]}
            </p>
            <p className="sys-member__notes">
              Las cuotas se cobran al titular, {fullName(account)}.
            </p>
            <ul className="sys-member__list">
              {family.map((relative) => (
                <li key={relative.id}>
                  {relative.id === member.id ? (
                    <strong>{fullName(relative)}</strong>
                  ) : (
                    <Link
                      href={`/sistema/socios/${relative.id}`}
                      className="sys-member-link"
                    >
                      {fullName(relative)}
                    </Link>
                  )}
                  <span>
                    {FAMILY_ROLE_LABELS[relative.familyRole ?? "otro"]} ·{" "}
                    {yearsLabel(age(relative.birthDate, DEMO_TODAY))}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="sys-empty">
            No integra un grupo familiar. Categoría{" "}
            {CATEGORY_LABELS[member.category].toLowerCase()}.
          </p>
        )}
      </section>

      <section className="sys-card">
        <h2 className="sys-card__title">Disciplinas</h2>
        {programs.length === 0 ? (
          <p className="sys-empty">No está anotado en ninguna disciplina.</p>
        ) : (
          <ul className="sys-member__list">
            {programs.map((program) => (
              <li key={program.id}>
                <strong>{program.name}</strong>
                <span>
                  {program.schedule} · {formatMoney(program.monthlyFee)} por mes
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sys-card">
        <h2 className="sys-card__title">Pileta</h2>
        <dl className="sys-member__dl">
          <div>
            <dt>Carnet</dt>
            <dd>
              {!pool.pass ? (
                <Badge tone="neutral">Sin carnet</Badge>
              ) : pool.passPaid ? (
                <Badge tone="ok">Pago</Badge>
              ) : (
                <Badge tone="warn">Emitido, sin pagar</Badge>
              )}
              {pool.seasonName && (
                <span className="sys-member__muted"> {pool.seasonName}</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Apto médico</dt>
            <dd>
              <Badge tone={CLEARANCE_TONES[clearance]}>
                {CLEARANCE_LABELS[clearance]}
              </Badge>
              {medicalClearance && (
                <span className="sys-member__muted">
                  {" "}
                  {clearance === "vencido" ? "Venció" : "Vence"} el{" "}
                  {formatDate(medicalClearance.expiresAt)}
                </span>
              )}
            </dd>
          </div>
          {medicalClearance?.physician && (
            <div>
              <dt>Firmó</dt>
              <dd>{medicalClearance.physician}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
