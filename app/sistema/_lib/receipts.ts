import { USERS } from "../_data/users";
import type { Member, Receipt, SystemUser } from "../_types";
import { matchesMember } from "./members";
import { periodOf } from "./period";

// Item the payment adds when it charges the late surcharge (see the reducer
// and the seed), left out of the short description of a receipt.
const SURCHARGE_DESCRIPTION = "Recargo por mora";

// "Cuota social · Noviembre 2026 y 2 más", for lists.
export function receiptSummary(receipt: Receipt): string {
  const items = receipt.items.filter(
    ({ description }) => description !== SURCHARGE_DESCRIPTION,
  );
  const [first] = items;
  if (!first) return SURCHARGE_DESCRIPTION;
  return items.length > 1
    ? `${first.description} y ${items.length - 1} más`
    : first.description;
}

// Matches the receipt number ("4630" finds "0001-00004630") or its member.
export function matchesReceipt(
  receipt: Receipt,
  member: Member | undefined,
  query: string,
): boolean {
  const text = query.trim();
  if (!text) return true;
  if (receipt.number.includes(text)) return true;
  return member ? matchesMember(member, text) : false;
}

export function receiptPeriod(receipt: Receipt): string {
  return periodOf(receipt.issuedAt);
}

export function findUserById(id: string): SystemUser | undefined {
  return USERS.find((user) => user.id === id);
}
