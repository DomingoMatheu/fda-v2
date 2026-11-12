import type { SystemSettings } from "../_data/settings";
import type {
  AccessLog,
  ActivityEntry,
  Enrollment,
  FamilyGroup,
  Fee,
  Member,
  Payment,
  PoolPass,
  Receipt,
  Season,
} from "../_types";

// Everything the demo can change while someone is using it. Static data
// (disciplines, employees, users) is imported from _data/ instead.
export interface SystemState {
  members: Member[];
  familyGroups: FamilyGroup[];
  enrollments: Enrollment[];
  fees: Fee[];
  payments: Payment[];
  receipts: Receipt[];
  seasons: Season[];
  poolPasses: PoolPass[];
  accessLogs: AccessLog[];
  activity: ActivityEntry[];
  settings: SystemSettings;
}
