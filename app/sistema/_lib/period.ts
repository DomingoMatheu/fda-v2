import { DUE_DAY } from "../_data/settings";

// A billing period is a month written as "YYYY-MM".

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function periodOf(date: string): string {
  return date.slice(0, 7);
}

export function addMonths(period: string, months: number): string {
  const [year, month] = period.split("-").map(Number);
  const index = year * 12 + (month - 1) + months;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

// Every period from `from` to `to`, both included.
export function periodsBetween(from: string, to: string): string[] {
  const periods: string[] = [];
  for (let period = from; period <= to; period = addMonths(period, 1)) {
    periods.push(period);
  }
  return periods;
}

export function periodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function periodDueDate(
  period: string,
  dueDay: number = DUE_DAY,
): string {
  return `${period}-${pad(dueDay)}`;
}
