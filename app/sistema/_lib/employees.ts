import { DISCIPLINE_PROGRAMS } from "../_data/disciplines";
import { EMPLOYEES } from "../_data/employees";
import type { DisciplineProgram, Employee } from "../_types";

export function findEmployee(id: string | undefined): Employee | undefined {
  return EMPLOYEES.find((employee) => employee.id === id);
}

// Disciplines the employee teaches or runs.
export function disciplinesInCharge(employee: Employee): DisciplineProgram[] {
  return DISCIPLINE_PROGRAMS.filter(
    (program) =>
      program.coachEmployeeId === employee.id ||
      program.id === employee.disciplineId,
  );
}

// Argentine numbers written as "341 555 1201".
export function phoneHref(phone: string): string {
  return `tel:+54${phone.replace(/\D/g, "")}`;
}
