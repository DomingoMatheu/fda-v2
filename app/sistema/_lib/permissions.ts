import { PERMISSIONS_BY_ROLE } from "../_data/users";
import type { Permission, SystemUser } from "../_types";

export function can(user: SystemUser, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[user.role].includes(permission);
}
