import type { VisitorFee } from "@/app/_components/fees";
import type {
  AmountsByMethod,
  CashClosing,
  IncomeSource,
  OtherIncome,
  Payment,
  PaymentMethod,
} from "../_types";
import { formatMoney } from "./format";
import type { SystemState } from "./state";

// Pure helpers of the daily cash register ("Caja del día"): what came in on a
// day, by payment method, and how the closing count compares with it.

// Where a movement comes from: a fee payment or one of the other incomes.
export type MovementOrigin = "cuota" | IncomeSource;

export interface CashMovement {
  id: string;
  at: string;
  origin: MovementOrigin;
  method: PaymentMethod;
  amount: number;
  registeredByUserId: string;
  payment?: Payment;
  income?: OtherIncome;
}

export type CashStatus = "abierta" | "sin-cerrar" | "cerrada" | "diferencia";

// Bills counted in the drawer, largest first.
export const BILL_DENOMINATIONS: number[] = [
  20000, 10000, 2000, 1000, 500, 200, 100,
];

export const NO_AMOUNTS: AmountsByMethod = {
  efectivo: 0,
  debito: 0,
  credito: 0,
  qr: 0,
  transferencia: 0,
};

const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function paymentMovement(payment: Payment): CashMovement {
  return {
    id: payment.id,
    at: payment.paidAt,
    origin: "cuota",
    method: payment.method,
    amount: payment.amount,
    registeredByUserId: payment.registeredByUserId,
    payment,
  };
}

function incomeMovement(income: OtherIncome): CashMovement {
  return {
    id: income.id,
    at: income.at,
    origin: income.source,
    method: income.method,
    amount: income.amount,
    registeredByUserId: income.registeredByUserId,
    income,
  };
}

// Fee payments and other incomes of the day, newest first.
export function dayMovements(state: SystemState, day: string): CashMovement[] {
  return [
    ...state.payments
      .filter(({ paidAt }) => paidAt.startsWith(day))
      .map(paymentMovement),
    ...state.incomes.filter(({ at }) => at.startsWith(day)).map(incomeMovement),
  ].sort((a, b) => b.at.localeCompare(a.at));
}

export function amountsByMethod(movements: CashMovement[]): AmountsByMethod {
  const amounts = { ...NO_AMOUNTS };
  for (const movement of movements) amounts[movement.method] += movement.amount;
  return amounts;
}

export function totalOf(amounts: AmountsByMethod): number {
  return Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
}

export function sumMovements(movements: CashMovement[]): number {
  return movements.reduce((sum, { amount }) => sum + amount, 0);
}

// Part of the total, from 0 to 100.
export function sharePercent(amount: number, total: number): number {
  return total > 0 ? (amount / total) * 100 : 0;
}

export function closingOf(
  state: SystemState,
  day: string,
): CashClosing | undefined {
  return state.cashClosings.find(({ date }) => date === day);
}

// Movements a closing did not count because they came in afterwards.
export function isAfterClosing(
  movement: CashMovement,
  closing: CashClosing | undefined,
): boolean {
  return closing !== undefined && movement.at > closing.closedAt;
}

export function cashStatus(
  closing: CashClosing | undefined,
  day: string,
  today: string,
): CashStatus {
  if (!closing) return day === today ? "abierta" : "sin-cerrar";
  return closing.difference === 0 ? "cerrada" : "diferencia";
}

// Counted cash minus the cash the system expected: positive is a surplus,
// negative a shortage.
export function cashDifference(
  countedCash: number,
  expectedCash: number,
): number {
  return countedCash - expectedCash;
}

export function differenceLabel(difference: number): string {
  if (difference === 0) return "Sin diferencia";
  return `${difference > 0 ? "Sobrante" : "Faltante"} de ${formatMoney(Math.abs(difference))}`;
}

export function billsTotal(counts: Record<number, number>): number {
  return BILL_DENOMINATIONS.reduce(
    (sum, bill) => sum + bill * (counts[bill] ?? 0),
    0,
  );
}

// Today and every earlier day with movements or a closing since the first
// closing on record, newest first. Older days predate the register.
export function cashDays(state: SystemState, today: string): string[] {
  const since = state.cashClosings.reduce(
    (first, { date }) => (date < first ? date : first),
    today,
  );
  const days = new Set([
    today,
    ...state.payments.map(({ paidAt }) => paidAt.slice(0, 10)),
    ...state.incomes.map(({ at }) => at.slice(0, 10)),
    ...state.cashClosings.map(({ date }) => date),
  ]);
  return [...days]
    .filter((day) => day >= since && day <= today)
    .sort()
    .reverse();
}

// "Martes 10/11", built by hand so the server and the browser agree.
export function dayLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  const weekday =
    WEEKDAYS[new Date(Date.UTC(year, month - 1, date)).getUTCDay()];
  return `${weekday} ${day.slice(8, 10)}/${day.slice(5, 7)}`;
}

// "$9.000" → 9000.
export function visitorFeeAmount(fee: VisitorFee): number {
  return Number(fee.amount.replace(/\D/g, ""));
}

// Whole pesos typed in a form; empty or invalid text is 0.
export function parseAmount(text: string): number {
  const amount = Number(text.replace(/\D/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

export function closingsNewestFirst(closings: CashClosing[]): CashClosing[] {
  return [...closings].sort((a, b) => b.date.localeCompare(a.date));
}
