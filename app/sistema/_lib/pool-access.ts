import type { AccessCheck, Member, PoolPass, Season } from "../_types";
import { memberBalance, oldestOverduePeriod } from "./billing";
import { isBefore } from "./clock";
import { formatDate } from "./format";
import { periodLabel } from "./period";
import type { SystemState } from "./state";

// The season people are signing up for or using right now.
export function currentSeason(seasons: Season[]): Season | undefined {
  return seasons.find(({ status }) => status !== "cerrada");
}

export function activePass(
  member: Member,
  season: Season | undefined,
  passes: PoolPass[],
): PoolPass | undefined {
  if (!season) return undefined;
  return passes.find(
    (pass) =>
      pass.memberId === member.id &&
      pass.seasonId === season.id &&
      !pass.revokedAt,
  );
}

export function hasValidClearance(member: Member, on: string): boolean {
  const clearance = member.medicalClearance;
  return clearance !== undefined && !isBefore(clearance.expiresAt, on);
}

// A member gets in when they are active, up to date with their fees, have a
// valid medical clearance and a paid season pass. Every failing rule adds a
// reason, so the gate can tell the member what to fix.
export function checkPoolAccess(
  member: Member,
  state: SystemState,
  on: string,
): AccessCheck {
  const reasons: string[] = [];

  if (member.status === "baja") reasons.push("Socio dado de baja");
  if (member.status === "suspendido") reasons.push("Socio suspendido");

  const since = oldestOverduePeriod(memberBalance(member, state, on));
  if (since) reasons.push(`Cuota vencida desde ${periodLabel(since)}`);

  const clearance = member.medicalClearance;
  if (!clearance) reasons.push("Sin apto médico");
  else if (!hasValidClearance(member, on)) {
    reasons.push(`Apto médico vencido el ${formatDate(clearance.expiresAt)}`);
  }

  const pass = activePass(
    member,
    currentSeason(state.seasons),
    state.poolPasses,
  );
  const passFee = pass && state.fees.find(({ id }) => id === pass.feeId);
  if (!pass) reasons.push("Sin carnet de temporada");
  else if (passFee?.status !== "paga")
    reasons.push("Carnet de temporada sin pagar");

  return { allowed: reasons.length === 0, reasons };
}
