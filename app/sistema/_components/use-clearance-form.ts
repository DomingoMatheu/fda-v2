"use client";

import { useState } from "react";
import { addDays, DEMO_TODAY, isBefore } from "../_lib/clock";
import { formatDate, fullName } from "../_lib/format";
import { findMember } from "../_lib/members";
import type { Member } from "../_types";
import { useSystem } from "./use-system";

// Medical clearances usually last a year.
const CLEARANCE_DAYS = 365;

interface ClearanceForm {
  member?: Member;
  issuedAt: string;
  setIssuedAt: (date: string) => void;
  expiresAt: string;
  setExpiresAt: (date: string) => void;
  physician: string;
  setPhysician: (physician: string) => void;
  error?: string;
  save: () => void;
}

function validate(issuedAt: string, expiresAt: string): string | undefined {
  if (!issuedAt || !expiresAt) return "Completá las dos fechas.";
  if (isBefore(DEMO_TODAY, issuedAt))
    return "La fecha del apto no puede ser posterior a hoy.";
  if (!isBefore(DEMO_TODAY, expiresAt))
    return "El vencimiento tiene que ser posterior a hoy.";
  return undefined;
}

// State of the "Cargar apto médico" modal. Changing the issue date moves the
// expiry a year ahead, which is what the club's doctors sign.
export function useClearanceForm(
  memberId: string,
  onDone: () => void,
): ClearanceForm {
  const { state, recordMedicalClearance, notify } = useSystem();
  const member = findMember(state.members, memberId);
  const [issuedAt, setIssuedAtValue] = useState(DEMO_TODAY);
  const [expiresAt, setExpiresAt] = useState(
    addDays(DEMO_TODAY, CLEARANCE_DAYS),
  );
  const [physician, setPhysician] = useState("");
  const [error, setError] = useState<string>();

  return {
    member,
    issuedAt,
    setIssuedAt: (date) => {
      setIssuedAtValue(date);
      if (date) setExpiresAt(addDays(date, CLEARANCE_DAYS));
    },
    expiresAt,
    setExpiresAt,
    physician,
    setPhysician,
    error,
    save: () => {
      const problem = validate(issuedAt, expiresAt);
      setError(problem);
      if (problem || !member) return;
      recordMedicalClearance(member.id, {
        issuedAt,
        expiresAt,
        physician: physician.trim() || undefined,
      });
      notify(
        `Apto médico de ${fullName(member)} cargado. Vence el ${formatDate(expiresAt)}.`,
        "success",
      );
      onDone();
    },
  };
}
