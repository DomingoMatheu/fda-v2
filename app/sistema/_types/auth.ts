// Roles of the people who use the system. Permissions are resolved from the
// role (see _data/users.ts), never stored per user.
export type UserRole =
  "administrador" | "secretaria" | "tesoreria" | "porteria";

export type Permission =
  | "members:read"
  | "members:write"
  | "billing:read"
  | "billing:write"
  | "season:read"
  | "season:write"
  | "staff:read"
  | "staff:write"
  | "reports:read"
  | "settings:write";

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email: string;
  active: boolean;
  lastLoginAt?: string;
}

export interface Session {
  user: SystemUser;
  expiresAt: string;
}

export interface LoginState {
  error?: string;
}

export type ActivityKind =
  "pago" | "alta" | "baja" | "carnet" | "apto" | "ingreso" | "edicion";

// Audit trail entry shown on the dashboard and, in the real system, kept
// for every change.
export interface ActivityEntry {
  id: string;
  at: string;
  kind: ActivityKind;
  userId: string;
  summary: string;
  memberId?: string;
}
