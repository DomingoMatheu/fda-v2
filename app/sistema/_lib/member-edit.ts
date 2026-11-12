import type { MemberCategory, Member, MemberChanges } from "../_types";
import {
  EMPTY_NEW_MEMBER,
  toMemberData,
  type NewMemberValues,
} from "./new-member";

// Editing a member ("Editar datos") reuses the sign-up form's values and
// validation; disciplines are managed elsewhere, so they are left out.

export function memberToValues(member: Member): NewMemberValues {
  return {
    ...EMPTY_NEW_MEMBER,
    firstName: member.firstName,
    lastName: member.lastName,
    documentType: member.documentType,
    documentNumber: member.documentNumber,
    birthDate: member.birthDate,
    gender: member.gender,
    email: member.email ?? "",
    phone: member.phone ?? "",
    street: member.address.street,
    streetNumber: member.address.number,
    floor: member.address.floor ?? "",
    city: member.address.city,
    category: member.category,
    preferredPaymentMethod: member.preferredPaymentMethod,
    notes: member.notes ?? "",
  };
}

export function toMemberChanges(
  values: NewMemberValues,
  member: Member,
): MemberChanges {
  const input = toMemberData(values);
  return {
    ...input,
    // Keep the province and postal code the form does not show.
    address: { ...member.address, ...input.address },
  };
}

// Joining or leaving a family group changes who is billed, so a member page
// only switches between the individual categories.
export function editableCategories(member: Member): MemberCategory[] {
  if (member.category === "familiar") return ["familiar"];
  return ["individual", "menor", "jubilado", "vitalicio"];
}
