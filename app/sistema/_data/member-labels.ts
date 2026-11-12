import type { ClearanceState } from "../_lib/member-account";
import type { DocumentType, Gender } from "../_types";

// Spanish labels used only by the members screens.

export const CLEARANCE_LABELS: Record<ClearanceState, string> = {
  vigente: "Vigente",
  "por-vencer": "Por vencer",
  vencido: "Vencido",
  "sin-apto": "Sin apto",
};

export const GENDER_LABELS: Record<Gender, string> = {
  F: "Femenino",
  M: "Masculino",
  X: "No binario",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  DNI: "DNI",
  LC: "Libreta cívica",
  LE: "Libreta de enrolamiento",
  CI: "Cédula de identidad",
  PAS: "Pasaporte",
};
