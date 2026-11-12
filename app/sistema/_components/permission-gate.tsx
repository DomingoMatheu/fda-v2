"use client";

import type { ReactNode } from "react";
import { ROLE_LABELS } from "../_data/labels";
import { can } from "../_lib/permissions";
import type { Permission } from "../_types";
import { Icon } from "./icons";
import { useSystem } from "./use-system";

interface PermissionGateProps {
  permission?: Permission;
  children: ReactNode;
}

// Shows the screen only to roles allowed to use it.
export function PermissionGate({ permission, children }: PermissionGateProps) {
  const { user } = useSystem();
  if (!permission || can(user, permission)) return children;
  return (
    <div className="sys-card sys-locked">
      <Icon name="lock" className="sys-locked__icon" />
      <h2>No tenés acceso a esta pantalla</h2>
      <p>
        El rol {ROLE_LABELS[user.role]} no la tiene habilitada. Pedile a
        Administración que te dé permiso si la necesitás.
      </p>
    </div>
  );
}
