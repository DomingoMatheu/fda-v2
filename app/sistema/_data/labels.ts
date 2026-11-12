import type {
  ActivityKind,
  EmployeeRole,
  EmploymentType,
  FamilyPlan,
  FamilyRole,
  FeeConcept,
  FeeState,
  MemberCategory,
  MemberFeeStatus,
  MemberStatus,
  PaymentMethod,
  UserRole,
} from "../_types";

// Spanish labels for every enum the system shows.

export const CATEGORY_LABELS: Record<MemberCategory, string> = {
  individual: "Individual",
  menor: "Menor",
  jubilado: "Jubilado",
  familiar: "Familiar",
  vitalicio: "Vitalicio",
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  activo: "Activo",
  suspendido: "Suspendido",
  baja: "Baja",
};

export const FEE_STATUS_LABELS: Record<MemberFeeStatus, string> = {
  "al-dia": "Al día",
  "en-mora": "En mora",
  moroso: "Moroso",
  exento: "Exento",
};

export const FEE_STATE_LABELS: Record<FeeState, string> = {
  pendiente: "Pendiente",
  paga: "Paga",
  anulada: "Anulada",
  vencida: "Vencida",
};

export const FEE_CONCEPT_LABELS: Record<FeeConcept, string> = {
  "cuota-social": "Cuota social",
  inscripcion: "Inscripción",
  "cuota-disciplina": "Disciplina",
  "temporada-pileta": "Carnet de pileta",
  otro: "Otro",
};

export const FAMILY_PLAN_LABELS: Record<FamilyPlan, string> = {
  basico: "Básico",
  pleno: "Pleno",
};

export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  titular: "Titular",
  conyuge: "Cónyuge",
  hijo: "Hijo/a",
  otro: "Otro",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  qr: "QR",
  transferencia: "Transferencia",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  administrador: "Administración",
  secretaria: "Secretaría",
  tesoreria: "Tesorería",
  porteria: "Portería",
};

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  secretaria: "Secretaría",
  tesoreria: "Tesorería",
  porteria: "Portería",
  mantenimiento: "Mantenimiento",
  guardavidas: "Guardavidas",
  profesor: "Profesor/a",
  buffet: "Buffet",
  administracion: "Administración",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  "relacion-dependencia": "Relación de dependencia",
  monotributo: "Monotributo",
  "ad-honorem": "Ad honorem",
};

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  pago: "Cobro",
  alta: "Alta",
  baja: "Baja",
  carnet: "Carnet",
  apto: "Apto médico",
  ingreso: "Ingreso",
  edicion: "Edición",
};
