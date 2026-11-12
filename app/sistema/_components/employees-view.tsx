"use client";

import { Fragment } from "react";
import { EMPLOYEE_ROLE_LABELS, EMPLOYMENT_TYPE_LABELS } from "../_data/labels";
import { EMPLOYEE_AREAS, EMPLOYEE_STATUS_LABELS } from "../_data/staff";
import { DEMO_TODAY } from "../_lib/clock";
import { disciplinesInCharge, phoneHref } from "../_lib/employees";
import { age, formatDate, formatDocument, fullName } from "../_lib/format";
import type { Employee, EmployeeStatus } from "../_types";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { Badge, type BadgeTone } from "./status-badge";
import { useEmployeesView, type StatusFilter } from "./use-employees-view";

const STATUS_TONES: Record<EmployeeStatus, BadgeTone> = {
  activo: "ok",
  licencia: "warn",
  baja: "neutral",
};

const STATUS_OPTIONS: StatusFilter[] = ["todos", "activo", "licencia", "baja"];

const COLUMN_COUNT = 6;

function EmployeeRecord({ employee }: { employee: Employee }) {
  const years = age(employee.hiredAt, DEMO_TODAY);
  const disciplines = disciplinesInCharge(employee);
  return (
    <dl className="sys-employee__record">
      <div>
        <dt>Fecha de ingreso</dt>
        <dd>
          {formatDate(employee.hiredAt)}
          <span className="sys-employee__muted">
            {" "}
            · {years === 1 ? "1 año" : `${years} años`} en el club
          </span>
        </dd>
      </div>
      <div>
        <dt>DNI</dt>
        <dd>{formatDocument(employee.documentNumber)}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>
          {employee.email ? (
            <a href={`mailto:${employee.email}`}>{employee.email}</a>
          ) : (
            "Sin email"
          )}
        </dd>
      </div>
      <div>
        <dt>Teléfono</dt>
        <dd>
          <a href={phoneHref(employee.phone)}>{employee.phone}</a>
        </dd>
      </div>
      <div>
        <dt>Disciplina a cargo</dt>
        <dd>
          {disciplines.length > 0
            ? disciplines.map(({ name }) => name).join(", ")
            : "Ninguna"}
        </dd>
      </div>
      <div>
        <dt>Horario</dt>
        <dd>{employee.schedule}</dd>
      </div>
      <div>
        <dt>Contratación</dt>
        <dd>{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</dd>
      </div>
      <div className="sys-employee__notes">
        <dt>Notas</dt>
        <dd>{employee.notes ?? "Sin notas."}</dd>
      </div>
    </dl>
  );
}

function EmployeesContent() {
  const view = useEmployeesView();
  return (
    <>
      <PageHeader
        eyebrow="Personal"
        title="Empleados"
        description="Todo el personal del club: puesto, horario, contratación y legajo. Tocá una fila para ver el legajo."
      />
      <div
        className="sys-employee__roles"
        role="group"
        aria-label="Filtrar por puesto"
      >
        {view.roleCounts.map((item) => (
          <button
            key={item.role}
            type="button"
            className="sys-employee__role"
            aria-pressed={view.role === item.role}
            onClick={() => view.setRole(item.role)}
          >
            <span className="sys-employee__role-count">{item.count}</span>
            <span className="sys-employee__role-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sys-toolbar">
        <label className="sys-field sys-employee__status">
          <span className="sys-field__label">Estado</span>
          <select
            className="sys-input"
            value={view.status}
            onChange={(event) =>
              view.setStatus(event.target.value as StatusFilter)
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "todos" ? "Todos" : EMPLOYEE_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <p className="sys-employee__summary">
          {view.employees.length === 1
            ? "1 persona"
            : `${view.employees.length} personas`}
          {view.onLeave > 0 && ` · ${view.onLeave} de licencia`}
        </p>
      </div>
      <div className="sys-table-wrap">
        <table className="sys-table sys-employee__table">
          <caption className="sys-visually-hidden">Empleados del club</caption>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col" className="is-hidden-mobile">
                Puesto y área
              </th>
              <th scope="col" className="is-hidden-mobile sys-employee__wide">
                Contratación
              </th>
              <th scope="col" className="is-hidden-mobile">
                Horario
              </th>
              <th scope="col">Estado</th>
              <th scope="col" className="is-hidden-mobile">
                Contacto
              </th>
            </tr>
          </thead>
          <tbody>
            {view.employees.length === 0 && (
              <tr>
                <td colSpan={COLUMN_COUNT} className="sys-table__empty">
                  No hay empleados con esos filtros.
                </td>
              </tr>
            )}
            {view.employees.map((employee) => {
              const isOpen = view.expandedId === employee.id;
              const recordId = `legajo-${employee.id}`;
              return (
                <Fragment key={employee.id}>
                  <tr
                    className={`is-clickable${isOpen ? " is-open" : ""}`}
                    onClick={(event) => view.onRowClick(employee.id, event)}
                  >
                    <td>
                      <button
                        type="button"
                        className="sys-employee__toggle"
                        aria-expanded={isOpen}
                        aria-controls={recordId}
                        onClick={() => view.toggle(employee.id)}
                      >
                        <span
                          className="sys-employee__chevron"
                          aria-hidden="true"
                        />
                        {fullName(employee)}
                      </button>
                      <span className="sys-employee__role-mobile">
                        {EMPLOYEE_ROLE_LABELS[employee.role]}
                      </span>
                    </td>
                    <td className="is-hidden-mobile">
                      {EMPLOYEE_ROLE_LABELS[employee.role]}
                      <span className="sys-employee__area">
                        {EMPLOYEE_AREAS[employee.role]}
                      </span>
                    </td>
                    <td className="is-hidden-mobile sys-employee__wide">
                      {EMPLOYMENT_TYPE_LABELS[employee.employmentType]}
                    </td>
                    <td className="is-hidden-mobile sys-employee__schedule">
                      {employee.schedule}
                    </td>
                    <td>
                      <Badge tone={STATUS_TONES[employee.status]}>
                        {EMPLOYEE_STATUS_LABELS[employee.status]}
                      </Badge>
                    </td>
                    <td className="is-hidden-mobile sys-employee__contact">
                      <a href={phoneHref(employee.phone)}>{employee.phone}</a>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="sys-employee__record-row" id={recordId}>
                      <td colSpan={COLUMN_COUNT}>
                        <EmployeeRecord employee={employee} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function EmployeesView() {
  return (
    <PermissionGate permission="staff:read">
      <EmployeesContent />
    </PermissionGate>
  );
}
