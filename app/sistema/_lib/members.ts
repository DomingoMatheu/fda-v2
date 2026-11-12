import type { Member } from "../_types";
import { billingMemberId } from "./billing";
import type { SystemState } from "./state";
import { searchable } from "./text";

// Matches a member by name, or by document or member number when the query
// is only digits ("30.123.456" works too).
export function matchesMember(member: Member, query: string): boolean {
  const text = searchable(query);
  if (!text) return true;
  const digits = text.replace(/[.\s]/g, "");
  if (/^\d+$/.test(digits)) {
    return (
      member.documentNumber.includes(digits) ||
      String(member.memberNumber) === digits
    );
  }
  return (
    searchable(`${member.firstName} ${member.lastName}`).includes(text) ||
    searchable(`${member.lastName} ${member.firstName}`).includes(text)
  );
}

export function findMember(members: Member[], id: string): Member | undefined {
  return members.find((member) => member.id === id);
}

// The member whose account the fees go to: the holder for family members,
// the member themselves otherwise.
export function accountHolder(member: Member, state: SystemState): Member {
  return (
    findMember(state.members, billingMemberId(member, state.familyGroups)) ??
    member
  );
}
