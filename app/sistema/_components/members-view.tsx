"use client";

import Link from "next/link";
import { DISCIPLINE_PROGRAMS } from "../_data/disciplines";
import {
  CATEGORY_LABELS,
  FEE_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
} from "../_data/labels";
import {
  formatDate,
  formatDocument,
  formatMoney,
  listName,
} from "../_lib/format";
import type { MemberRow } from "../_lib/member-list";
import type { MemberCategory, MemberFeeStatus, MemberStatus } from "../_types";
import { DataTable, type Column } from "./data-table";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { FeeStatusBadge, MemberStatusBadge } from "./status-badge";
import { useMemberFilters } from "./use-member-filters";

const COLUMNS: Column<MemberRow>[] = [
  {
    key: "number",
    header: "N.º",
    render: ({ member }) => member.memberNumber,
    align: "end",
    hideOnMobile: true,
  },
  {
    key: "name",
    header: "Socio",
    render: ({ member }) => (
      <span className="sys-members__name">
        <strong>{listName(member)}</strong>
        {member.status !== "activo" && (
          <MemberStatusBadge status={member.status} />
        )}
      </span>
    ),
  },
  {
    key: "document",
    header: "DNI",
    render: ({ member }) => formatDocument(member.documentNumber),
    hideOnMobile: true,
  },
  {
    key: "category",
    header: "Categoría",
    render: ({ member }) => CATEGORY_LABELS[member.category],
    hideOnMobile: true,
  },
  {
    key: "group",
    header: "Grupo",
    render: ({ group }) => group ?? "—",
    hideOnMobile: true,
  },
  {
    key: "fee",
    header: "Cuota",
    render: ({ feeStatus }) => <FeeStatusBadge status={feeStatus} />,
  },
  {
    key: "debt",
    header: "Deuda",
    render: ({ debt }) => (debt > 0 ? formatMoney(debt) : "—"),
    align: "end",
  },
  {
    key: "last-payment",
    header: "Último pago",
    render: ({ lastPayment }) =>
      lastPayment ? formatDate(lastPayment.paidAt) : "—",
    hideOnMobile: true,
  },
];

function options<Key extends string>(
  labels: Record<Key, string>,
): [Key, string][] {
  return Object.entries(labels) as [Key, string][];
}

export function MembersView() {
  const list = useMemberFilters();
  const { filters, setFilter } = list;

  return (
    <PermissionGate permission="members:read">
      <PageHeader
        eyebrow="Socios"
        title="Socios"
        description="Buscá por nombre, DNI o número de socio y entrá a la ficha."
        actions={
          list.canAddMembers && (
            <Link
              href="/sistema/socios/nuevo"
              className="sys-button sys-button--primary"
            >
              Nuevo socio
            </Link>
          )
        }
      />

      <div className="sys-toolbar sys-members__toolbar">
        <input
          type="search"
          className="sys-input sys-toolbar__search"
          placeholder="Nombre, DNI o número de socio"
          aria-label="Buscar en el listado de socios"
          value={filters.query}
          onChange={(event) => setFilter("query", event.target.value)}
        />
        <select
          className="sys-input"
          aria-label="Categoría"
          value={filters.category}
          onChange={(event) =>
            setFilter("category", event.target.value as MemberCategory | "")
          }
        >
          <option value="">Categoría: todas</option>
          {options(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="sys-input"
          aria-label="Estado de cuota"
          value={filters.feeStatus}
          onChange={(event) =>
            setFilter("feeStatus", event.target.value as MemberFeeStatus | "")
          }
        >
          <option value="">Cuota: todas</option>
          {options(FEE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="sys-input"
          aria-label="Estado del socio"
          value={filters.status}
          onChange={(event) =>
            setFilter("status", event.target.value as MemberStatus | "")
          }
        >
          <option value="">Estado: todos</option>
          {options(MEMBER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="sys-input"
          aria-label="Disciplina"
          value={filters.disciplineId}
          onChange={(event) => setFilter("disciplineId", event.target.value)}
        >
          <option value="">Disciplina: todas</option>
          {DISCIPLINE_PROGRAMS.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sys-members__count">
        <p aria-live="polite">
          {list.isFiltered
            ? `${list.rows.length} de ${list.total} socios`
            : `${list.total} socios`}
        </p>
        {list.isFiltered && (
          <button
            type="button"
            className="sys-button sys-button--small"
            onClick={list.clearFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="sys-members__table">
        <DataTable
          caption="Listado de socios"
          columns={COLUMNS}
          rows={list.rows}
          rowKey={({ member }) => member.id}
          rowHref={({ member }) => `/sistema/socios/${member.id}`}
          empty="No hay socios que coincidan con la búsqueda."
        />
      </div>
    </PermissionGate>
  );
}
