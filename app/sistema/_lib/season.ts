import type { VisitorFee } from "@/app/_components/fees";
import type { AccessLog, Fee, Member, PoolPass, Season } from "../_types";
import { memberBalance } from "./billing";
import { daysBetween } from "./clock";
import { activePass, currentSeason, hasValidClearance } from "./pool-access";
import type { SystemState } from "./state";

// Helpers of the pool season screens: the gate lookup, the state of each
// pass and today's gate log. Like pool-access.ts, they derive everything
// from the state at read time.

export type SeasonTab = "ingreso" | "carnets" | "hoy";

export function isSeasonTab(value: unknown): value is SeasonTab {
  return value === "ingreso" || value === "carnets" || value === "hoy";
}

// A clearance is flagged this many days before it expires.
export const CLEARANCE_WARNING_DAYS = 30;

// Shorter numbers at the gate are member numbers; DNIs have 7 or 8 digits.
const MIN_DOCUMENT_DIGITS = 7;

export type ClearanceState = "vigente" | "por-vencer" | "vencido" | "sin-apto";

export function clearanceState(member: Member, on: string): ClearanceState {
  const clearance = member.medicalClearance;
  if (!clearance) return "sin-apto";
  if (!hasValidClearance(member, on)) return "vencido";
  return daysBetween(on, clearance.expiresAt) <= CLEARANCE_WARNING_DAYS
    ? "por-vencer"
    : "vigente";
}

// Keeps only the digits, so "30.123.456" and "30 123 456" both work.
export function gateDigits(query: string): string {
  return query.replace(/\D/g, "");
}

export function looksLikeDocument(digits: string): boolean {
  return digits.length >= MIN_DOCUMENT_DIGITS;
}

// Exact match by document or member number: at the gate a partial match
// could let the wrong person in.
export function findMemberAtGate(
  members: Member[],
  digits: string,
): Member | undefined {
  if (!digits) return undefined;
  return members.find(
    (member) =>
      member.documentNumber === digits ||
      String(member.memberNumber) === digits,
  );
}

function seasonPassFee(
  member: Member,
  state: SystemState,
  season: Season | undefined,
): { pass?: PoolPass; fee?: Fee } {
  const pass = activePass(member, season, state.poolPasses);
  const fee = pass && state.fees.find(({ id }) => id === pass.feeId);
  return { pass, fee };
}

// What a member has to fix to get in, so the gate can offer the shortcut.
export interface GateIssues {
  owesFees: boolean;
  needsClearance: boolean;
  needsPass: boolean;
}

export function gateIssues(
  member: Member,
  state: SystemState,
  on: string,
): GateIssues {
  const { pass, fee } = seasonPassFee(
    member,
    state,
    currentSeason(state.seasons),
  );
  const overdue = memberBalance(member, state, on).overdue.length > 0;
  return {
    owesFees: overdue || (pass !== undefined && fee?.status !== "paga"),
    needsClearance: !hasValidClearance(member, on),
    needsPass: pass === undefined,
  };
}

// The season pass fee still to be paid, so "Cobrar carnet" can select it
// even though it is not overdue yet.
export function unpaidPassFeeIds(member: Member, state: SystemState): string[] {
  const { fee } = seasonPassFee(member, state, currentSeason(state.seasons));
  return fee?.status === "pendiente" ? [fee.id] : [];
}

export interface PassRow {
  pass: PoolPass;
  member: Member;
  fee?: Fee;
  paid: boolean;
  clearance: ClearanceState;
}

export function seasonPassRows(
  state: SystemState,
  season: Season,
  on: string,
): PassRow[] {
  return state.poolPasses
    .filter(({ seasonId, revokedAt }) => seasonId === season.id && !revokedAt)
    .flatMap((pass) => {
      const member = state.members.find(({ id }) => id === pass.memberId);
      if (!member) return [];
      const fee = state.fees.find(({ id }) => id === pass.feeId);
      return [
        {
          pass,
          member,
          fee,
          paid: fee?.status === "paga",
          clearance: clearanceState(member, on),
        },
      ];
    })
    .sort((a, b) =>
      `${a.member.lastName} ${a.member.firstName}`.localeCompare(
        `${b.member.lastName} ${b.member.firstName}`,
      ),
    );
}

export type PassFilter =
  "todos" | "pagos" | "pendientes" | "sin-apto" | "por-vencer";

export function matchesPassFilter(row: PassRow, filter: PassFilter): boolean {
  switch (filter) {
    case "todos":
      return true;
    case "pagos":
      return row.paid;
    case "pendientes":
      return !row.paid;
    case "sin-apto":
      return row.clearance === "sin-apto" || row.clearance === "vencido";
    case "por-vencer":
      return row.clearance === "por-vencer";
  }
}

// Members who can still ask for a pass this season.
export function canGetPass(
  member: Member,
  state: SystemState,
  season: Season | undefined,
): boolean {
  return (
    season !== undefined &&
    member.status === "activo" &&
    !activePass(member, season, state.poolPasses)
  );
}

// Today's gate log, newest first.
export function logsOn(logs: AccessLog[], on: string): AccessLog[] {
  return logs
    .filter(({ at }) => at.startsWith(on))
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function visitorReason(fee: VisitorFee): string {
  return `Visitante · ${fee.label} ${fee.amount}`;
}
