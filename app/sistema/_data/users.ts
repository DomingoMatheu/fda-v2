import type { Permission, SystemUser, UserRole } from "../_types";

// Demo accounts. They all share DEMO_PASSWORD, shown on the login screen so
// the club can try every role.
export const DEMO_PASSWORD = "matheu2026";

export const USERS: SystemUser[] = [
  {
    id: "u-admin",
    name: "Laura Benítez",
    username: "admin",
    role: "administrador",
    email: "administracion@clubmatheu.com.ar",
    active: true,
    lastLoginAt: "2026-11-10T19:42:00",
  },
  {
    id: "u-secretaria",
    name: "Graciela Romero",
    username: "secretaria",
    role: "secretaria",
    email: "secretaria@clubmatheu.com.ar",
    active: true,
    lastLoginAt: "2026-11-11T09:05:00",
  },
  {
    id: "u-tesoreria",
    name: "Martín Aguirre",
    username: "tesoreria",
    role: "tesoreria",
    email: "cobranzas@clubmatheu.com.ar",
    active: true,
    lastLoginAt: "2026-11-11T08:51:00",
  },
  {
    id: "u-porteria",
    name: "Hugo Sosa",
    username: "porteria",
    role: "porteria",
    email: "porteria@clubmatheu.com.ar",
    active: true,
    lastLoginAt: "2026-11-11T08:00:00",
  },
];

const ALL_PERMISSIONS: Permission[] = [
  "members:read",
  "members:write",
  "billing:read",
  "billing:write",
  "season:read",
  "season:write",
  "staff:read",
  "staff:write",
  "reports:read",
  "settings:write",
];

export const PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  administrador: ALL_PERMISSIONS,
  secretaria: [
    "members:read",
    "members:write",
    "billing:read",
    "billing:write",
    "season:read",
    "season:write",
    "staff:read",
    "reports:read",
  ],
  tesoreria: [
    "members:read",
    "billing:read",
    "billing:write",
    "season:read",
    "reports:read",
  ],
  porteria: ["members:read", "season:read", "season:write"],
};

export function findUser(username: string): SystemUser | undefined {
  return USERS.find((user) => user.username === username && user.active);
}
