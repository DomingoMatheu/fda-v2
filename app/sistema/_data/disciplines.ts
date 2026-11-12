import { DISCIPLINES } from "@/app/_components/disciplines";
import type { DisciplineProgram } from "../_types";
import { slugify } from "../_lib/text";

interface ProgramDetails {
  monthlyFee: number;
  schedule: string;
  coachEmployeeId?: string;
  capacity?: number;
}

const DEFAULT_DETAILS: ProgramDetails = {
  monthlyFee: 15000,
  schedule: "A confirmar",
};

// What the system adds to each discipline listed on the landing, keyed by
// its name there.
const DETAILS: Record<string, ProgramDetails> = {
  Arquería: { monthlyFee: 18000, schedule: "Sáb y dom, 10 a 12 h" },
  "Entrenamiento funcional": {
    monthlyFee: 20000,
    schedule: "Lun, mié y vie, 19 a 20 h",
    capacity: 25,
  },
  "Wing Chun": { monthlyFee: 18000, schedule: "Mar y jue, 20 a 21:30 h" },
  Pádel: { monthlyFee: 22000, schedule: "Turnos de lun a dom" },
  "Patín artístico": {
    monthlyFee: 21000,
    schedule: "Lun a jue, 17 a 19 h",
    coachEmployeeId: "e-13",
    capacity: 40,
  },
  "Patín competitivo": {
    monthlyFee: 25000,
    schedule: "Lun a jue, 19 a 21 h",
    coachEmployeeId: "e-13",
    capacity: 20,
  },
  "Pelota paleta": { monthlyFee: 15000, schedule: "Mar y vie, 18 a 21 h" },
  Taekwondo: {
    monthlyFee: 19000,
    schedule: "Mar, jue y sáb, 18 a 20 h",
    coachEmployeeId: "e-14",
  },
  Sóftbol: { monthlyFee: 17000, schedule: "Sáb, 14 a 17 h" },
  "Ultimate Frisbee": { monthlyFee: 15000, schedule: "Dom, 10 a 12 h" },
  "Grupo Scout": { monthlyFee: 12000, schedule: "Sáb, 14:30 a 18 h" },
  Vóley: {
    monthlyFee: 19000,
    schedule: "Mar y jue, 18 a 21 h",
    coachEmployeeId: "e-12",
    capacity: 36,
  },
  Hockey: {
    monthlyFee: 24000,
    schedule: "Lun, mié y vie, 18 a 22 h",
    coachEmployeeId: "e-11",
    capacity: 60,
  },
};

export const DISCIPLINE_PROGRAMS: DisciplineProgram[] = DISCIPLINES.map(
  (discipline) => ({
    id: slugify(discipline.name),
    name: discipline.name,
    contactPhone: discipline.phone,
    ...(DETAILS[discipline.name] ?? DEFAULT_DETAILS),
  }),
);

export function findProgram(id: string): DisciplineProgram | undefined {
  return DISCIPLINE_PROGRAMS.find((program) => program.id === id);
}
