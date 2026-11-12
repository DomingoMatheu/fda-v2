"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DEMO_TODAY } from "../_lib/clock";
import { fullName } from "../_lib/format";
import {
  EMPTY_NEW_MEMBER,
  signUpFees,
  toNewMemberInput,
  validateNewMember,
  type FeePreviewItem,
  type NewMemberErrors,
  type NewMemberValues,
} from "../_lib/new-member";
import { nextMemberNumber } from "../_lib/system-reducer";
import { useSystem } from "./use-system";

interface NewMemberForm {
  values: NewMemberValues;
  errors: NewMemberErrors;
  setValue: <Key extends keyof NewMemberValues>(
    key: Key,
    value: NewMemberValues[Key],
  ) => void;
  toggleDiscipline: (disciplineId: string) => void;
  fees: FeePreviewItem[];
  feesTotal: number;
  nextNumber: number;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

// "Nuevo socio": validates on submit (and again on every change after a
// failed attempt), saves the member and opens their page.
export function useNewMemberForm(): NewMemberForm {
  const router = useRouter();
  const { state, addMember, notify } = useSystem();
  const [values, setValues] = useState<NewMemberValues>(EMPTY_NEW_MEMBER);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted
    ? validateNewMember(values, state.members, DEMO_TODAY)
    : {};
  const fees = signUpFees(values, state.settings);

  return {
    values,
    errors,
    setValue: (key, value) =>
      setValues((current) => ({ ...current, [key]: value })),
    toggleDiscipline: (disciplineId) =>
      setValues((current) => ({
        ...current,
        disciplineIds: current.disciplineIds.includes(disciplineId)
          ? current.disciplineIds.filter((id) => id !== disciplineId)
          : [...current.disciplineIds, disciplineId],
      })),
    fees,
    feesTotal: fees.reduce((total, { amount }) => total + amount, 0),
    nextNumber: nextMemberNumber(state.members),
    submit: (event) => {
      event.preventDefault();
      setSubmitted(true);
      const found = validateNewMember(values, state.members, DEMO_TODAY);
      if (Object.keys(found).length > 0) {
        notify("Revisá los datos marcados antes de guardar.", "error");
        return;
      }
      const input = toNewMemberInput(values);
      const memberId = addMember(input);
      notify(`Alta de ${fullName(input)} registrada.`);
      router.push(`/sistema/socios/${memberId}`);
    },
  };
}
