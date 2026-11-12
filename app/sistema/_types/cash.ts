import type { PaymentMethod } from "./member";

// The daily cash register ("Caja del día"): what came in each day by payment
// method and the closing count at the end of the day. Fee payments come from
// `Payment`; everything else is an `OtherIncome`.

export type IncomeSource = "visitante" | "alquiler" | "otro";

export interface OtherIncome {
  id: string;
  at: string;
  source: IncomeSource;
  description: string;
  amount: number;
  method: PaymentMethod;
  registeredByUserId: string;
  // Set when the income pays a booking of someone who is not a member.
  bookingId?: string;
}

export type NewIncomeInput = Omit<
  OtherIncome,
  "id" | "at" | "registeredByUserId"
>;

export type AmountsByMethod = Record<PaymentMethod, number>;

export interface CashClosing {
  id: string;
  date: string;
  closedAt: string;
  closedByUserId: string;
  // What the system says came in that day, by payment method.
  expected: AmountsByMethod;
  // Cash counted in the drawer, and how far it is from the expected cash.
  countedCash: number;
  difference: number;
  notes?: string;
}

export type NewClosingInput = Omit<
  CashClosing,
  "id" | "closedAt" | "closedByUserId"
>;
