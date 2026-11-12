import type {
  FamilyGroup,
  Member,
  MemberCategory,
  MemberFeeStatus,
  MemberStatus,
  Payment,
} from "../_types";
import { billingMemberId, memberBalance } from "./billing";
import { matchesMember } from "./members";
import type { SystemState } from "./state";
import { searchable } from "./text";

// Rows of the members list ("Socios"), with what each member owes already
// worked out so the table and the filters read the same numbers.

export interface MemberRow {
  member: Member;
  feeStatus: MemberFeeStatus;
  debt: number;
  lastPayment?: Payment;
  group?: string;
  disciplineIds: string[];
}

export interface MemberFilters {
  query: string;
  category: MemberCategory | "";
  feeStatus: MemberFeeStatus | "";
  status: MemberStatus | "";
  disciplineId: string;
}

export const EMPTY_MEMBER_FILTERS: MemberFilters = {
  query: "",
  category: "",
  feeStatus: "",
  status: "",
  disciplineId: "",
};

// "Familia Pérez", named after the holder of the group.
export function familyGroupName(group: FamilyGroup, members: Member[]): string {
  const holder = members.find(({ id }) => id === group.holderMemberId);
  return holder ? `Familia ${holder.lastName}` : "Grupo familiar";
}

export function lastPaymentOf(
  accountId: string,
  payments: Payment[],
): Payment | undefined {
  return payments
    .filter(({ memberId }) => memberId === accountId)
    .reduce<Payment | undefined>(
      (latest, payment) =>
        !latest || payment.paidAt > latest.paidAt ? payment : latest,
      undefined,
    );
}

export function activeDisciplineIds(
  memberId: string,
  state: SystemState,
): string[] {
  return state.enrollments
    .filter(
      (enrollment) =>
        enrollment.memberId === memberId && enrollment.status === "activa",
    )
    .map(({ disciplineId }) => disciplineId);
}

// Plain text comparison, so the server and the browser sort alike.
function sortKey(member: Member): string {
  return searchable(`${member.lastName} ${member.firstName} ${member.id}`);
}

export function buildMemberRows(state: SystemState, on: string): MemberRow[] {
  return state.members
    .map((member) => {
      const accountId = billingMemberId(member, state.familyGroups);
      const account =
        state.members.find(({ id }) => id === accountId) ?? member;
      const balance = memberBalance(account, state, on);
      const group = state.familyGroups.find(
        ({ id }) => id === member.familyGroupId,
      );
      return {
        member,
        feeStatus: balance.status,
        debt: balance.overdueTotal,
        lastPayment: lastPaymentOf(accountId, state.payments),
        group: group && familyGroupName(group, state.members),
        disciplineIds: activeDisciplineIds(member.id, state),
      };
    })
    .sort((a, b) => (sortKey(a.member) < sortKey(b.member) ? -1 : 1));
}

export function filterMemberRows(
  rows: MemberRow[],
  filters: MemberFilters,
): MemberRow[] {
  return rows.filter(
    (row) =>
      matchesMember(row.member, filters.query) &&
      (!filters.category || row.member.category === filters.category) &&
      (!filters.feeStatus || row.feeStatus === filters.feeStatus) &&
      (!filters.status || row.member.status === filters.status) &&
      (!filters.disciplineId ||
        row.disciplineIds.includes(filters.disciplineId)),
  );
}
