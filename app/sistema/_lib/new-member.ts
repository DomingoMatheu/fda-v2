import type { FeeScheduleKey, SystemSettings } from "../_data/settings";
import { findProgram } from "../_data/disciplines";
import type {
  DocumentType,
  Gender,
  Member,
  MemberCategory,
  NewMemberInput,
  PaymentMethod,
} from "../_types";
import { scheduledFee } from "./billing";
import { isBefore } from "./clock";
import { age } from "./format";

// The new member form ("Nuevo socio"): its values, validation and the fees
// the sign-up will generate.

export interface NewMemberValues {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  gender: Gender;
  email: string;
  phone: string;
  street: string;
  streetNumber: string;
  floor: string;
  city: string;
  category: MemberCategory;
  preferredPaymentMethod: PaymentMethod;
  disciplineIds: string[];
  notes: string;
}

export type NewMemberErrors = Partial<Record<keyof NewMemberValues, string>>;

export const EMPTY_NEW_MEMBER: NewMemberValues = {
  firstName: "",
  lastName: "",
  documentType: "DNI",
  documentNumber: "",
  birthDate: "",
  gender: "F",
  email: "",
  phone: "",
  street: "",
  streetNumber: "",
  floor: "",
  city: "Rosario",
  category: "individual",
  preferredPaymentMethod: "efectivo",
  disciplineIds: [],
  notes: "",
};

const ADULT_AGE = 18;

function documentDigits(documentNumber: string): string {
  return documentNumber.replace(/[.\s]/g, "");
}

export function validateNewMember(
  values: NewMemberValues,
  members: Member[],
  on: string,
): NewMemberErrors {
  const errors: NewMemberErrors = {};
  if (!values.firstName.trim()) errors.firstName = "Completá el nombre.";
  if (!values.lastName.trim()) errors.lastName = "Completá el apellido.";

  const document = documentDigits(values.documentNumber);
  const duplicate = members.find(
    ({ documentNumber }) => documentNumber === document,
  );
  if (!/^\d{6,9}$/.test(document))
    errors.documentNumber = "Ingresá el número sin letras (de 6 a 9 dígitos).";
  else if (duplicate)
    errors.documentNumber = `Ese documento ya es del socio n.º ${duplicate.memberNumber}.`;

  if (!values.birthDate) errors.birthDate = "Completá la fecha de nacimiento.";
  else if (isBefore(on, values.birthDate) || values.birthDate < "1900-01-01")
    errors.birthDate = "La fecha de nacimiento no es válida.";
  else if (
    values.category === "menor" &&
    age(values.birthDate, on) >= ADULT_AGE
  )
    errors.category = "La categoría Menor es para menores de 18 años.";

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "El email no parece válido.";
  if (!values.street.trim()) errors.street = "Completá la calle.";
  return errors;
}

export function toNewMemberInput(values: NewMemberValues): NewMemberInput {
  const optional = (text: string): string | undefined =>
    text.trim() || undefined;
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    documentType: values.documentType,
    documentNumber: documentDigits(values.documentNumber),
    birthDate: values.birthDate,
    gender: values.gender,
    email: optional(values.email),
    phone: optional(values.phone),
    address: {
      street: values.street.trim(),
      number: values.streetNumber.trim() || "S/N",
      floor: optional(values.floor),
      city: values.city.trim() || "Rosario",
      province: "Santa Fe",
    },
    category: values.category,
    preferredPaymentMethod: values.preferredPaymentMethod,
    disciplineIds: values.disciplineIds,
    notes: optional(values.notes),
  };
}

export interface FeePreviewItem {
  description: string;
  amount: number;
}

// New family members start a group on the basic plan; lifetime members pay
// no membership fee.
function scheduleKeyForCategory(
  category: MemberCategory,
): FeeScheduleKey | undefined {
  if (category === "vitalicio") return undefined;
  if (category === "familiar") return "familiar-basico";
  return category;
}

// The fees the sign-up generates: sign-up fee, this month's fee and one per
// discipline.
export function signUpFees(
  values: NewMemberValues,
  settings: SystemSettings,
): FeePreviewItem[] {
  const key = scheduleKeyForCategory(values.category);
  const membership = key ? scheduledFee(settings, key) : undefined;
  const programs = values.disciplineIds.flatMap((id) => {
    const program = findProgram(id);
    return program ? [program] : [];
  });
  return [
    ...(membership
      ? [
          { description: "Inscripción", amount: membership.signUp },
          { description: "Cuota social del mes", amount: membership.monthly },
        ]
      : []),
    ...programs.map((program) => ({
      description: program.name,
      amount: program.monthlyFee,
    })),
  ];
}
