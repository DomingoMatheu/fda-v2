export type EmployeeRole =
  | "secretaria"
  | "tesoreria"
  | "porteria"
  | "mantenimiento"
  | "guardavidas"
  | "profesor"
  | "buffet"
  | "administracion";

export type EmploymentType =
  "relacion-dependencia" | "monotributo" | "ad-honorem";

export type EmployeeStatus = "activo" | "licencia" | "baja";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  role: EmployeeRole;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hiredAt: string;
  phone: string;
  email?: string;
  schedule: string;
  disciplineId?: string;
  notes?: string;
}

// A discipline as the system sees it: the landing's list plus the data the
// club needs to run it (fee, schedule, who is in charge).
export interface DisciplineProgram {
  id: string;
  name: string;
  monthlyFee: number;
  schedule: string;
  contactPhone?: string;
  coachEmployeeId?: string;
  capacity?: number;
}

export type EnrollmentStatus = "activa" | "baja";

export interface Enrollment {
  id: string;
  memberId: string;
  disciplineId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
}
