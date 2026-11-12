import { findProgram } from "../_data/disciplines";
import type {
  DisciplineProgram,
  Fee,
  Member,
  Payment,
  PoolPass,
} from "../_types";
import { billingMemberId } from "./billing";
import { addDays, isBefore } from "./clock";
import { activePass, currentSeason } from "./pool-access";
import type { SystemState } from "./state";

// What the member page shows about a member's account, disciplines and
// pool season, derived from the state.

export type ClearanceState = "vigente" | "por-vencer" | "vencido" | "sin-apto";

// A clearance is "por vencer" within this many days of its expiry.
export const CLEARANCE_WARNING_DAYS = 30;

export function clearanceState(member: Member, on: string): ClearanceState {
  const clearance = member.medicalClearance;
  if (!clearance) return "sin-apto";
  if (isBefore(clearance.expiresAt, on)) return "vencido";
  if (isBefore(clearance.expiresAt, addDays(on, CLEARANCE_WARNING_DAYS)))
    return "por-vencer";
  return "vigente";
}

// Fees of the member's account, the latest period first and, within a
// period, in the order they were issued.
export function accountFees(member: Member, state: SystemState): Fee[] {
  const accountId = billingMemberId(member, state.familyGroups);
  return state.fees
    .filter(({ memberId }) => memberId === accountId)
    .sort(
      (a, b) =>
        b.period.localeCompare(a.period) ||
        Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]),
    );
}

export function accountPayments(member: Member, state: SystemState): Payment[] {
  const accountId = billingMemberId(member, state.familyGroups);
  return state.payments
    .filter(({ memberId }) => memberId === accountId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export function memberPrograms(
  member: Member,
  state: SystemState,
): DisciplineProgram[] {
  return state.enrollments
    .filter(
      ({ memberId, status }) => memberId === member.id && status === "activa",
    )
    .flatMap(({ disciplineId }) => {
      const program = findProgram(disciplineId);
      return program ? [program] : [];
    });
}

export interface PoolSituation {
  seasonName?: string;
  pass?: PoolPass;
  passPaid: boolean;
}

export function poolSituation(
  member: Member,
  state: SystemState,
): PoolSituation {
  const season = currentSeason(state.seasons);
  const pass = activePass(member, season, state.poolPasses);
  const fee = pass && state.fees.find(({ id }) => id === pass.feeId);
  return {
    seasonName: season?.name,
    pass,
    passPaid: fee?.status === "paga",
  };
}

// "1 año", "9 años". Babies under one year show "0 años".
export function yearsLabel(years: number): string {
  return years === 1 ? "1 año" : `${years} años`;
}
