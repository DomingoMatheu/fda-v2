import type { Member } from "../_types";
import { daysBetween } from "./clock";

// Formats built by hand instead of with Intl so the server and the browser
// always print exactly the same text.

export function formatMoney(amount: number): string {
  const digits = String(Math.round(Math.abs(amount))).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ".",
  );
  return `${amount < 0 ? "-" : ""}$ ${digits}`;
}

export function formatDate(date: string): string {
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function formatTime(dateTime: string): string {
  return dateTime.slice(11, 16);
}

export function formatDateTime(dateTime: string): string {
  return `${formatDate(dateTime)} ${formatTime(dateTime)}`;
}

export function formatDocument(documentNumber: string): string {
  return documentNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type NamedPerson = Pick<Member, "firstName" | "lastName">;

export function fullName(person: NamedPerson): string {
  return `${person.firstName} ${person.lastName}`;
}

// "Pérez, Juan", for lists sorted by last name.
export function listName(person: NamedPerson): string {
  return `${person.lastName}, ${person.firstName}`;
}

export function age(birthDate: string, on: string): number {
  const years = Number(on.slice(0, 4)) - Number(birthDate.slice(0, 4));
  const hadBirthday = on.slice(5, 10) >= birthDate.slice(5, 10);
  return hadBirthday ? years : years - 1;
}

export function daysLabel(from: string, to: string): string {
  const days = daysBetween(from, to);
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  return `en ${days} días`;
}
