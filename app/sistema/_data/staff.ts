import type { EmployeeRole, EmployeeStatus } from "../_types";

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  activo: "Activo",
  licencia: "De licencia",
  baja: "Baja",
};

// Area of the club each role works in.
export const EMPLOYEE_AREAS: Record<EmployeeRole, string> = {
  administracion: "Administración",
  secretaria: "Administración",
  tesoreria: "Administración",
  porteria: "Accesos",
  mantenimiento: "Predio",
  guardavidas: "Pileta",
  profesor: "Deportes",
  buffet: "Buffet",
};

// Order of the roles in the counters and filters.
export const EMPLOYEE_ROLE_ORDER: EmployeeRole[] = [
  "administracion",
  "secretaria",
  "tesoreria",
  "porteria",
  "mantenimiento",
  "guardavidas",
  "profesor",
  "buffet",
];
