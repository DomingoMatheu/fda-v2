import type { DisciplineProgram, Enrollment } from "../_types";
import { findMember } from "./members";
import type { SystemState } from "./state";

export interface DisciplineSummary {
  program: DisciplineProgram;
  enrolled: number;
  // What the discipline bills a month with its current members.
  monthlyIncome: number;
}

// Active enrollments of members who are still in the club.
export function activeEnrollments(
  state: SystemState,
  disciplineId: string,
): Enrollment[] {
  return state.enrollments.filter(
    (enrollment) =>
      enrollment.disciplineId === disciplineId &&
      enrollment.status === "activa" &&
      findMember(state.members, enrollment.memberId)?.status !== "baja",
  );
}

export function disciplineSummary(
  state: SystemState,
  program: DisciplineProgram,
): DisciplineSummary {
  const enrolled = activeEnrollments(state, program.id).length;
  return { program, enrolled, monthlyIncome: enrolled * program.monthlyFee };
}
