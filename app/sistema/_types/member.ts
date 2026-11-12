// Domain types of the members module ("Socios"). They are the contract the
// future API and the Prisma schema should follow, so every field that the
// club tracks today has a home here.

export type DocumentType = "DNI" | "LC" | "LE" | "CI" | "PAS";

export type Gender = "F" | "M" | "X";

// "familiar" members are billed through their family group (see FamilyGroup);
// "vitalicio" members are exempt from the monthly fee.
export type MemberCategory =
  "individual" | "menor" | "jubilado" | "familiar" | "vitalicio";

export type MemberStatus = "activo" | "suspendido" | "baja";

export type FamilyRole = "titular" | "conyuge" | "hijo" | "otro";

// Payment methods the club accepts (see the FAQ on the landing).
export type PaymentMethod =
  "efectivo" | "debito" | "credito" | "qr" | "transferencia";

export interface Address {
  street: string;
  number: string;
  floor?: string;
  city: string;
  province: string;
  postalCode?: string;
}

// Medical clearance ("apto médico") required to use the pool.
export interface MedicalClearance {
  issuedAt: string;
  expiresAt: string;
  physician?: string;
}

export interface Member {
  id: string;
  memberNumber: number;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  gender: Gender;
  email?: string;
  phone?: string;
  address: Address;
  category: MemberCategory;
  status: MemberStatus;
  joinedAt: string;
  leftAt?: string;
  familyGroupId?: string;
  familyRole?: FamilyRole;
  preferredPaymentMethod: PaymentMethod;
  medicalClearance?: MedicalClearance;
  notes?: string;
}

// "básico": parents with no children or one under 5. "pleno": one child over
// 5 or more than one child, up to 17 years old.
export type FamilyPlan = "basico" | "pleno";

export interface FamilyGroup {
  id: string;
  holderMemberId: string;
  plan: FamilyPlan;
  createdAt: string;
}

// Values the member form collects; the system fills in ids, numbers and dates.
export interface NewMemberInput {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  gender: Gender;
  email?: string;
  phone?: string;
  address: Address;
  category: MemberCategory;
  preferredPaymentMethod: PaymentMethod;
  disciplineIds: string[];
  notes?: string;
}

// Fields Secretaría can correct on a member's page. Category changes into or
// out of a family group are not allowed here: they change who is billed.
export type MemberChanges = Partial<
  Pick<
    Member,
    | "firstName"
    | "lastName"
    | "documentType"
    | "documentNumber"
    | "birthDate"
    | "gender"
    | "email"
    | "phone"
    | "address"
    | "category"
    | "preferredPaymentMethod"
    | "notes"
  >
>;
