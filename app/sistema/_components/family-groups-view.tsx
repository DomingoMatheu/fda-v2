"use client";

import Link from "next/link";
import { FAMILY_PLAN_LABELS, FAMILY_ROLE_LABELS } from "../_data/labels";
import { DEMO_TODAY } from "../_lib/clock";
import { yearsLabel } from "../_lib/member-account";
import { age, formatMoney, fullName } from "../_lib/format";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { StatCard } from "./stat-card";
import { Badge, FeeStatusBadge } from "./status-badge";
import { Tabs } from "./tabs";
import { useFamilyGroups } from "./use-family-groups";

export function FamilyGroupsView() {
  const view = useFamilyGroups();

  return (
    <PermissionGate permission="members:read">
      <PageHeader
        eyebrow="Socios"
        title="Grupos familiares"
        description="El plan familiar se cobra una sola vez, al titular del grupo."
      />

      <div className="sys-stats">
        <StatCard
          label="Grupos"
          value={String(view.counts.todos)}
          hint={`${view.memberCount} socios en total`}
        />
        <StatCard
          label="Plan pleno"
          value={String(view.pleno)}
          hint={`${view.basico} con plan básico`}
        />
        <StatCard
          label="Cuota de los grupos"
          value={formatMoney(view.monthlyTotal)}
          hint="Por mes, sin disciplinas"
        />
        <StatCard
          label="Con aviso"
          value={String(view.counts["con-aviso"])}
          hint="Plan o edades para revisar"
          tone={view.counts["con-aviso"] > 0 ? "warn" : "ok"}
        />
      </div>

      <Tabs
        label="Filtrar grupos"
        active={view.filter}
        onChange={view.setFilter}
        items={[
          { key: "todos", label: "Todos", count: view.counts.todos },
          {
            key: "con-aviso",
            label: "Con aviso",
            count: view.counts["con-aviso"],
          },
          {
            key: "con-deuda",
            label: "Con deuda",
            count: view.counts["con-deuda"],
          },
        ]}
      />
      <div className="sys-toolbar">
        <input
          type="search"
          className="sys-input sys-toolbar__search"
          placeholder="Buscar por integrante"
          aria-label="Buscar grupo por integrante"
          value={view.query}
          onChange={(event) => view.setQuery(event.target.value)}
        />
      </div>

      {view.groups.length === 0 ? (
        <p className="sys-card sys-empty">
          No hay grupos que coincidan con la búsqueda.
        </p>
      ) : (
        <div className="sys-families">
          {view.groups.map((summary) => (
            <article key={summary.group.id} className="sys-card sys-family">
              <div className="sys-family__head">
                <div>
                  <h2 className="sys-card__title">{summary.name}</h2>
                  {summary.holder && (
                    <p className="sys-family__holder">
                      Titular:{" "}
                      <Link
                        href={`/sistema/socios/${summary.holder.id}`}
                        className="sys-member-link"
                      >
                        {fullName(summary.holder)}
                      </Link>
                    </p>
                  )}
                </div>
                <FeeStatusBadge status={summary.feeStatus} />
              </div>

              <dl className="sys-family__facts">
                <div>
                  <dt>Plan</dt>
                  <dd>
                    <Badge
                      tone={summary.group.plan === "pleno" ? "info" : "neutral"}
                    >
                      {FAMILY_PLAN_LABELS[summary.group.plan]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt>Cuota mensual</dt>
                  <dd>{formatMoney(summary.monthlyFee)}</dd>
                </div>
                <div>
                  <dt>Deuda</dt>
                  <dd>
                    {summary.overdueTotal > 0
                      ? formatMoney(summary.overdueTotal)
                      : "—"}
                  </dd>
                </div>
              </dl>

              <ul className="sys-family__members">
                {summary.members.map((member) => (
                  <li key={member.id}>
                    <Link
                      href={`/sistema/socios/${member.id}`}
                      className="sys-member-link"
                    >
                      {fullName(member)}
                    </Link>
                    <span>
                      {FAMILY_ROLE_LABELS[member.familyRole ?? "otro"]} ·{" "}
                      {yearsLabel(age(member.birthDate, DEMO_TODAY))}
                    </span>
                  </li>
                ))}
              </ul>

              {summary.warnings.length > 0 && (
                <ul className="sys-family__warnings" role="note">
                  {summary.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </PermissionGate>
  );
}
