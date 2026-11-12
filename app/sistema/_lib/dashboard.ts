import type { Member, MemberBalance, Payment } from "../_types";
import { billingMemberId, memberBalance, sumAmounts } from "./billing";
import { addDays, isBefore } from "./clock";
import { formatDate, formatTime } from "./format";
import { periodOf, periodsBetween } from "./period";
import { currentSeason } from "./pool-access";
import type { SystemState } from "./state";

// Figures for the dashboard ("Inicio"). Everything is derived from the
// state on the given day, so registering a payment updates them at once.

export interface DashboardStats {
  activeMembers: number;
  upToDateShare: number;
  collectedThisMonth: number;
  paymentsThisMonth: number;
  pendingThisMonth: number;
  pendingFeesThisMonth: number;
  passesIssued: number;
  passesPaid: number;
}

export interface Debtor {
  account: Member;
  balance: MemberBalance;
}

export interface MonthlyTotal {
  period: string;
  total: number;
}

export function activeMembers(state: SystemState): Member[] {
  return state.members.filter(({ status }) => status === "activo");
}

function paymentsIn(state: SystemState, period: string): Payment[] {
  return state.payments.filter(({ paidAt }) => periodOf(paidAt) === period);
}

// Share of active members who owe nothing overdue (lifetime members count as
// up to date).
function upToDateShare(state: SystemState, on: string): number {
  const active = activeMembers(state);
  if (active.length === 0) return 0;
  const upToDate = active.filter((member) => {
    const { status } = memberBalance(member, state, on);
    return status === "al-dia" || status === "exento";
  });
  return upToDate.length / active.length;
}

export function dashboardStats(state: SystemState, on: string): DashboardStats {
  const period = periodOf(on);
  const payments = paymentsIn(state, period);
  const pendingFees = state.fees.filter(
    (fee) =>
      fee.period === period &&
      fee.status === "pendiente" &&
      fee.concept !== "temporada-pileta",
  );
  const season = currentSeason(state.seasons);
  const passes = state.poolPasses.filter(
    (pass) => pass.seasonId === season?.id && !pass.revokedAt,
  );
  const paidFeeIds = new Set(
    state.fees.filter(({ status }) => status === "paga").map(({ id }) => id),
  );
  return {
    activeMembers: activeMembers(state).length,
    upToDateShare: upToDateShare(state, on),
    collectedThisMonth: payments.reduce(
      (total, { amount }) => total + amount,
      0,
    ),
    paymentsThisMonth: payments.length,
    pendingThisMonth: sumAmounts(pendingFees),
    pendingFeesThisMonth: pendingFees.length,
    passesIssued: passes.length,
    passesPaid: passes.filter(({ feeId }) => paidFeeIds.has(feeId)).length,
  };
}

// Accounts (holders and individual members) that owe overdue fees, the
// biggest debt first.
export function debtors(state: SystemState, on: string): Debtor[] {
  return state.members
    .filter(
      (member) =>
        member.status !== "baja" &&
        billingMemberId(member, state.familyGroups) === member.id,
    )
    .map((account) => ({
      account,
      balance: memberBalance(account, state, on),
    }))
    .filter(({ balance }) => balance.overdue.length > 0)
    .sort((a, b) => b.balance.overdueTotal - a.balance.overdueTotal);
}

// Active members whose medical clearance expires within the next `days`.
export function expiringClearances(
  state: SystemState,
  on: string,
  days: number,
): Member[] {
  const limit = addDays(on, days);
  return activeMembers(state)
    .filter(({ medicalClearance }) => {
      if (!medicalClearance) return false;
      const { expiresAt } = medicalClearance;
      return !isBefore(expiresAt, on) && !isBefore(limit, expiresAt);
    })
    .sort((a, b) =>
      (a.medicalClearance?.expiresAt ?? "").localeCompare(
        b.medicalClearance?.expiresAt ?? "",
      ),
    );
}

export interface Birthday {
  member: Member;
  date: string;
}

// Active members whose birthday falls in the next seven days, today included.
export function birthdaysThisWeek(state: SystemState, on: string): Birthday[] {
  const week = Array.from({ length: 7 }, (_, index) => addDays(on, index));
  return activeMembers(state)
    .flatMap((member) => {
      const date = week.find(
        (day) => day.slice(5, 10) === member.birthDate.slice(5, 10),
      );
      return date ? [{ member, date }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function latestPayments(state: SystemState, count: number): Payment[] {
  return [...state.payments]
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
    .slice(0, count);
}

// What was collected each month of the year, from January to this month.
export function monthlyCollection(
  state: SystemState,
  on: string,
): MonthlyTotal[] {
  const current = periodOf(on);
  const first = `${current.slice(0, 4)}-01`;
  return periodsBetween(first, current).map((period) => ({
    period,
    total: paymentsIn(state, period).reduce(
      (total, { amount }) => total + amount,
      0,
    ),
  }));
}

// "Hoy 09:12", "Ayer 18:40" or "07/11/2026 17:05".
export function whenLabel(dateTime: string, on: string): string {
  const time = formatTime(dateTime);
  if (dateTime.slice(0, 10) === on) return `Hoy ${time}`;
  if (dateTime.slice(0, 10) === addDays(on, -1)) return `Ayer ${time}`;
  return `${formatDate(dateTime)} ${time}`;
}
