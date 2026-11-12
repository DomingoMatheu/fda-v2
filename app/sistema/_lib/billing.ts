import type {
  FeeScheduleKey,
  ScheduledFee,
  SystemSettings,
} from "../_data/settings";
import type {
  Fee,
  FeeState,
  FamilyGroup,
  Member,
  MemberBalance,
  MemberFeeStatus,
  Receipt,
} from "../_types";
import { isBefore } from "./clock";
import type { SystemState } from "./state";

// Overdue is derived from the due date at read time, never stored.
export function feeState(fee: Fee, on: string): FeeState {
  if (fee.status === "pendiente" && isBefore(fee.dueDate, on)) return "vencida";
  return fee.status;
}

// Fees of family members are issued to the holder of their group, so the
// whole family shares one account.
export function billingMemberId(
  member: Member,
  familyGroups: FamilyGroup[],
): string {
  if (!member.familyGroupId) return member.id;
  const group = familyGroups.find(({ id }) => id === member.familyGroupId);
  return group?.holderMemberId ?? member.id;
}

export function memberFees(member: Member, state: SystemState): Fee[] {
  const accountId = billingMemberId(member, state.familyGroups);
  return state.fees.filter(({ memberId }) => memberId === accountId);
}

export function sumAmounts(fees: Fee[]): number {
  return fees.reduce((total, fee) => total + fee.amount, 0);
}

export function surchargeFor(fees: Fee[], on: string, rate: number): number {
  const overdue = fees.filter((fee) => feeState(fee, on) === "vencida");
  return Math.round(sumAmounts(overdue) * rate);
}

// One or two months owed is "en mora"; three or more is "moroso".
function statusFor(member: Member, overdue: Fee[]): MemberFeeStatus {
  const overdueMonths = new Set(overdue.map(({ period }) => period)).size;
  if (overdueMonths >= 3) return "moroso";
  if (overdueMonths > 0) return "en-mora";
  return member.category === "vitalicio" ? "exento" : "al-dia";
}

export function memberBalance(
  member: Member,
  state: SystemState,
  on: string,
): MemberBalance {
  const pending = memberFees(member, state).filter(
    ({ status }) => status === "pendiente",
  );
  const overdue = pending.filter((fee) => feeState(fee, on) === "vencida");
  return {
    pending,
    overdue,
    pendingTotal: sumAmounts(pending),
    overdueTotal: sumAmounts(overdue),
    surcharge: surchargeFor(overdue, on, state.settings.lateFeeRate),
    status: statusFor(member, overdue),
  };
}

// Oldest period the member owes, e.g. to say "debe desde Septiembre 2026".
export function oldestOverduePeriod(
  balance: MemberBalance,
): string | undefined {
  return balance.overdue.map(({ period }) => period).sort()[0];
}

// Which line of the fee schedule a member pays. Lifetime members pay none.
export function scheduleKeyFor(
  member: Member,
  familyGroups: FamilyGroup[],
): FeeScheduleKey | undefined {
  if (member.category === "vitalicio") return undefined;
  if (member.category !== "familiar") return member.category;
  const group = familyGroups.find(({ id }) => id === member.familyGroupId);
  return group?.plan === "pleno" ? "familiar-pleno" : "familiar-basico";
}

export function scheduledFee(
  settings: SystemSettings,
  key: FeeScheduleKey,
): ScheduledFee {
  const fee = settings.fees.find((item) => item.key === key);
  if (!fee) throw new Error(`Missing fee schedule entry: ${key}`);
  return fee;
}

// Receipts are numbered per point of sale: "0001-00004120".
export function receiptNumber(pointOfSale: number, sequence: number): string {
  return `${String(pointOfSale).padStart(4, "0")}-${String(sequence).padStart(8, "0")}`;
}

export function nextReceiptSequence(receipts: Receipt[]): number {
  const last = receipts.reduce(
    (max, { number }) => Math.max(max, Number(number.split("-")[1])),
    0,
  );
  return last + 1;
}
