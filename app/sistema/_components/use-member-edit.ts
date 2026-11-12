"use client";

import { useState, type FormEvent } from "react";
import { DEMO_TODAY } from "../_lib/clock";
import { fullName } from "../_lib/format";
import {
  editableCategories,
  memberToValues,
  toMemberChanges,
} from "../_lib/member-edit";
import {
  validateNewMember,
  type NewMemberErrors,
  type NewMemberValues,
} from "../_lib/new-member";
import type { Member, MemberCategory } from "../_types";
import { useSystem } from "./use-system";

interface MemberEditForm {
  values: NewMemberValues;
  errors: NewMemberErrors;
  setValue: <Key extends keyof NewMemberValues>(
    key: Key,
    value: NewMemberValues[Key],
  ) => void;
  categories: MemberCategory[];
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

// "Editar datos": starts from the member's data, validates like the sign-up
// form (the member's own document is not a duplicate) and saves the changes.
export function useMemberEdit(
  member: Member,
  onDone: () => void,
): MemberEditForm {
  const { state, updateMember, notify } = useSystem();
  const [values, setValues] = useState(() => memberToValues(member));
  const [submitted, setSubmitted] = useState(false);
  const validate = (): NewMemberErrors =>
    validateNewMember(values, state.members, DEMO_TODAY, member.id);

  return {
    values,
    errors: submitted ? validate() : {},
    setValue: (key, value) =>
      setValues((current) => ({ ...current, [key]: value })),
    categories: editableCategories(member),
    submit: (event) => {
      event.preventDefault();
      setSubmitted(true);
      if (Object.keys(validate()).length > 0) {
        notify("Revisá los datos marcados antes de guardar.", "error");
        return;
      }
      const changes = toMemberChanges(values, member);
      updateMember(member.id, changes);
      notify(
        `Se guardaron los datos de ${fullName({ ...member, ...changes })}.`,
      );
      onDone();
    },
  };
}
