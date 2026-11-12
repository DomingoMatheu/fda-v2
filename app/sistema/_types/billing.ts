import type { PaymentMethod } from "./member";

// What a fee charges for. "cuota-social" is the monthly membership fee,
// "inscripcion" the one-off sign-up fee and "temporada-pileta" the pool pass.
export type FeeConcept =
  | "cuota-social"
  | "inscripcion"
  | "cuota-disciplina"
  | "temporada-pileta"
  | "otro";

// Stored status. Whether a pending fee is overdue is derived from its due
// date at read time (see _lib/billing.ts), so the data never goes stale.
export type FeeStatus = "pendiente" | "paga" | "anulada";

export type FeeState = FeeStatus | "vencida";

export interface Fee {
  id: string;
  memberId: string;
  familyGroupId?: string;
  period: string;
  concept: FeeConcept;
  disciplineId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paymentId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  paidAt: string;
  method: PaymentMethod;
  amount: number;
  surcharge: number;
  feeIds: string[];
  receiptId: string;
  registeredByUserId: string;
  notes?: string;
}

export interface ReceiptItem {
  description: string;
  amount: number;
}

export interface Receipt {
  id: string;
  number: string;
  issuedAt: string;
  memberId: string;
  paymentId: string;
  items: ReceiptItem[];
  total: number;
  method: PaymentMethod;
}

export interface RegisterPaymentInput {
  memberId: string;
  feeIds: string[];
  method: PaymentMethod;
  notes?: string;
}

// Derived view of what a member owes, computed from their pending fees.
export type MemberFeeStatus = "al-dia" | "en-mora" | "moroso" | "exento";

export interface MemberBalance {
  pending: Fee[];
  overdue: Fee[];
  pendingTotal: number;
  overdueTotal: number;
  surcharge: number;
  status: MemberFeeStatus;
}
