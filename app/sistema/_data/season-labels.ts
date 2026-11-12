import type { AccessResult, SeasonStatus } from "../_types";
import type { ClearanceState, PassFilter, SeasonTab } from "../_lib/season";

// Spanish labels of the pool season screens.

export const SEASON_TABS: { key: SeasonTab; label: string }[] = [
  { key: "ingreso", label: "Control de ingreso" },
  { key: "carnets", label: "Carnets" },
  { key: "hoy", label: "Ingresos de hoy" },
];

export const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  inscripcion: "Inscripción abierta",
  "en-curso": "En curso",
  cerrada: "Cerrada",
};

export const CLEARANCE_STATE_LABELS: Record<ClearanceState, string> = {
  vigente: "Vigente",
  "por-vencer": "Por vencer",
  vencido: "Vencido",
  "sin-apto": "Sin apto",
};

export const PASS_FILTERS: { key: PassFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pagos", label: "Pagos" },
  { key: "pendientes", label: "Pendientes de pago" },
  { key: "sin-apto", label: "Sin apto vigente" },
  { key: "por-vencer", label: "Apto por vencer" },
];

export const ACCESS_RESULT_LABELS: Record<AccessResult, string> = {
  permitido: "Permitido",
  denegado: "Denegado",
};

export type AccessLogFilter = "todos" | AccessResult;

export const ACCESS_LOG_FILTERS: { key: AccessLogFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "permitido", label: "Permitidos" },
  { key: "denegado", label: "Denegados" },
];
