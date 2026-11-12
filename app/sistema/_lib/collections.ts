import type { Fee, Member, MemberBalance } from "../_types";
import { billingMemberId, memberBalance, oldestOverduePeriod } from "./billing";
import type { SystemState } from "./state";

// Numbers of the "Cobranza" screen for one billing period.

export interface PeriodSummary {
  expected: number;
  collected: number;
  pending: number;
  // Whole percent of the expected amount already collected.
  percent: number;
  feeCount: number;
  paidCount: number;
  pendingCount: number;
}

export interface Debtor {
  member: Member;
  balance: MemberBalance;
  // Distinct months the member owes.
  months: number;
  since: string;
}

// Cancelled fees are not charged, so they never count.
export function feesOfPeriod(fees: Fee[], period: string): Fee[] {
  return fees.filter(
    (fee) => fee.period === period && fee.status !== "anulada",
  );
}

function total(fees: Fee[]): number {
  return fees.reduce((sum, { amount }) => sum + amount, 0);
}

export function periodSummary(fees: Fee[]): PeriodSummary {
  const paid = fees.filter(({ status }) => status === "paga");
  const pending = fees.filter(({ status }) => status === "pendiente");
  const expected = total(fees);
  const collected = total(paid);
  return {
    expected,
    collected,
    pending: total(pending),
    percent: expected > 0 ? Math.round((collected / expected) * 100) : 0,
    feeCount: fees.length,
    paidCount: paid.length,
    pendingCount: pending.length,
  };
}

// Periods that have fees, newest first, always including the current one.
export function billingPeriods(fees: Fee[], current: string): string[] {
  const periods = new Set([current, ...fees.map(({ period }) => period)]);
  return [...periods].sort().reverse();
}

// Accounts (members who receive fees) with overdue fees, biggest debt first.
export function debtors(state: SystemState, on: string): Debtor[] {
  return state.members
    .filter(
      (member) => billingMemberId(member, state.familyGroups) === member.id,
    )
    .map((member) => ({ member, balance: memberBalance(member, state, on) }))
    .filter(({ balance }) => balance.overdue.length > 0)
    .map(({ member, balance }) => ({
      member,
      balance,
      months: new Set(balance.overdue.map(({ period }) => period)).size,
      since: oldestOverduePeriod(balance) ?? "",
    }))
    .sort((a, b) => b.balance.overdueTotal - a.balance.overdueTotal);
}
