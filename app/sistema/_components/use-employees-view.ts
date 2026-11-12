"use client";

import { useState, type MouseEvent } from "react";
import { EMPLOYEES } from "../_data/employees";
import { EMPLOYEE_ROLE_LABELS } from "../_data/labels";
import { EMPLOYEE_ROLE_ORDER } from "../_data/staff";
import type { Employee, EmployeeRole, EmployeeStatus } from "../_types";

export type RoleFilter = EmployeeRole | "todos";
export type StatusFilter = EmployeeStatus | "todos";

export interface RoleCount {
  role: RoleFilter;
  label: string;
  count: number;
}

interface EmployeesView {
  roleCounts: RoleCount[];
  role: RoleFilter;
  setRole: (role: RoleFilter) => void;
  status: StatusFilter;
  setStatus: (status: StatusFilter) => void;
  employees: Employee[];
  onLeave: number;
  expandedId: string | null;
  toggle: (id: string) => void;
  // Opens or closes the record, unless the click was on a link in the row.
  onRowClick: (id: string, event: MouseEvent<HTMLTableRowElement>) => void;
}

const BY_LAST_NAME = (a: Employee, b: Employee): number =>
  a.lastName.localeCompare(b.lastName, "es");

export function useEmployeesView(): EmployeesView {
  const [role, setRole] = useState<RoleFilter>("todos");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const roleCounts: RoleCount[] = [
    { role: "todos", label: "Todos", count: EMPLOYEES.length },
    ...EMPLOYEE_ROLE_ORDER.map((item) => ({
      role: item,
      label: EMPLOYEE_ROLE_LABELS[item],
      count: EMPLOYEES.filter((employee) => employee.role === item).length,
    })).filter(({ count }) => count > 0),
  ];

  const employees = EMPLOYEES.filter(
    (employee) =>
      (role === "todos" || employee.role === role) &&
      (status === "todos" || employee.status === status),
  ).sort(BY_LAST_NAME);

  const toggle = (id: string): void =>
    setExpandedId((current) => (current === id ? null : id));

  return {
    roleCounts,
    role,
    setRole,
    status,
    setStatus,
    employees,
    onLeave: EMPLOYEES.filter((employee) => employee.status === "licencia")
      .length,
    expandedId,
    toggle,
    onRowClick: (id, event) => {
      if ((event.target as Element).closest("a, button")) return;
      toggle(id);
    },
  };
}
