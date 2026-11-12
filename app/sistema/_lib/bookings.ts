import { VISITOR_FEES } from "@/app/_components/fees";
import { MONTH_NAMES, WEEKDAY_SHORT } from "../_data/booking-labels";
import type { BookingRates } from "../_data/settings";
import { EXCLUSIVE_MIN_GUESTS, findVenue } from "../_data/venues";
import type {
  Booking,
  BookingGuest,
  BookingSlot,
  BookingStatus,
  Fee,
  FeeState,
  Member,
  NewBookingInput,
  OtherIncome,
  Venue,
} from "../_types";
import { feeState } from "./billing";
import { formatDate, formatDocument, fullName } from "./format";
import { findMember } from "./members";
import type { SystemState } from "./state";
import { searchable } from "./text";

// Pure helpers of the bookings module: availability, calendar days, costs,
// payments and the checks of the booking form.

export type BookingTab = "calendario" | "lista" | "hoy";
export type BookingWhen = "proximas" | "pasadas" | "todas";
export type ResponsibleKind = "socio" | "no-socio";

export const BOOKING_SLOTS: BookingSlot[] = ["dia", "noche"];

export function isBookingTab(value: unknown): value is BookingTab {
  return value === "calendario" || value === "lista" || value === "hoy";
}

export function isBookingSlot(value: unknown): value is BookingSlot {
  return value === "dia" || value === "noche";
}

// ───────── Availability ─────────

// The booking holding a slot. Cancelled bookings free it again.
export function bookingAt(
  bookings: Booking[],
  venueId: string,
  date: string,
  slot: BookingSlot,
): Booking | undefined {
  return bookings.find(
    (booking) =>
      booking.venueId === venueId &&
      booking.date === date &&
      booking.slot === slot &&
      booking.status !== "cancelada",
  );
}

export function bookingsOn(bookings: Booking[], date: string): Booking[] {
  return bookings
    .filter((booking) => booking.date === date)
    .sort(compareBookings);
}

export function compareBookings(a: Booking, b: Booking): number {
  return (
    a.date.localeCompare(b.date) ||
    a.slot.localeCompare(b.slot) ||
    a.venueId.localeCompare(b.venueId)
  );
}

// ───────── Calendar ─────────

function toUtcDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// "2026-11" for "2026-11-11".
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

export function daysOfMonth(month: string): string[] {
  const first = toUtcDate(`${month}-01`);
  const days: string[] = [];
  for (
    let day = first;
    day.getUTCMonth() === first.getUTCMonth();
    day = new Date(day.getTime() + 24 * 60 * 60 * 1000)
  ) {
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

// 0 for Monday, 6 for Sunday.
export function weekdayIndex(date: string): number {
  return (toUtcDate(date).getUTCDay() + 6) % 7;
}

export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return `${MONTH_NAMES[monthNumber - 1]} ${year}`;
}

// "sáb 14/11".
export function shortDayLabel(date: string): string {
  return `${WEEKDAY_SHORT[weekdayIndex(date)]} ${formatDate(date).slice(0, 5)}`;
}

// "sáb 14/11/2026".
export function dayLabel(date: string): string {
  return `${WEEKDAY_SHORT[weekdayIndex(date)]} ${formatDate(date)}`;
}

// ───────── Costs and payments ─────────

// Price of the visitor entrance for adults, published on the landing.
export function visitorEntrance(): number {
  const fee =
    VISITOR_FEES.find(({ label }) => label === "Mayores") ?? VISITOR_FEES[0];
  return Number(fee.amount.replace(/\D/g, ""));
}

export function canBeExclusive(venue: Venue, guestCount: number): boolean {
  return venue.kind === "quincho" && guestCount > EXCLUSIVE_MIN_GUESTS;
}

// What each non-member guest pays for an exclusive quincho.
export function exclusiveGuestPrice(rates: BookingRates): number {
  return Math.round(visitorEntrance() * rates.exclusiveGuestShare);
}

// Quinchos are free unless exclusive; the hall has a price per slot.
export function bookingAmount(
  venue: Venue,
  slot: BookingSlot,
  exclusive: boolean,
  guestCount: number,
  rates: BookingRates,
): number {
  if (venue.kind === "salon") {
    return slot === "noche" ? rates.salonNight : rates.salonDay;
  }
  if (!exclusive || !canBeExclusive(venue, guestCount)) return 0;
  return Math.round(guestCount * visitorEntrance() * rates.exclusiveGuestShare);
}

export function bookingIncomes(
  incomes: OtherIncome[],
  bookingId: string,
): OtherIncome[] {
  return incomes.filter((income) => income.bookingId === bookingId);
}

export type ChargeState = "sin-costo" | "pagada" | "seña" | "debe" | "anulada";

export interface BookingCharge {
  state: ChargeState;
  amount: number;
  paid: number;
  due: number;
  // The fee billed to a member's account, when there is one.
  fee?: Fee;
  feeState?: FeeState;
}

// How a booking stands with its payment: a fee on the member's account, or
// incomes registered for a renter who is not a member.
export function bookingCharge(
  booking: Booking,
  state: SystemState,
  on: string,
): BookingCharge {
  const { amount } = booking;
  if (amount === 0) {
    return { state: "sin-costo", amount, paid: 0, due: 0 };
  }
  if (booking.memberId) {
    const fee = state.fees.find(({ id }) => id === booking.feeId);
    const current = fee && feeState(fee, on);
    if (current === "paga") {
      return { state: "pagada", amount, paid: amount, due: 0, fee };
    }
    if (current === "anulada" || booking.status === "cancelada") {
      return { state: "anulada", amount, paid: 0, due: 0, fee };
    }
    return {
      state: "debe",
      amount,
      paid: 0,
      due: amount,
      fee,
      feeState: current,
    };
  }
  const paid = bookingIncomes(state.incomes, booking.id).reduce(
    (total, income) => total + income.amount,
    0,
  );
  const due = Math.max(amount - paid, 0);
  if (due === 0) return { state: "pagada", amount, paid, due };
  if (booking.status === "cancelada") {
    return { state: "anulada", amount, paid, due: 0 };
  }
  return { state: paid > 0 ? "seña" : "debe", amount, paid, due };
}

// ───────── Lists ─────────

export interface BookingFilters {
  venueId: string;
  status: BookingStatus | "todos";
  when: BookingWhen;
}

export function filterBookings(
  bookings: Booking[],
  filters: BookingFilters,
  today: string,
): Booking[] {
  const matching = bookings.filter(
    (booking) =>
      (filters.venueId === "todos" || booking.venueId === filters.venueId) &&
      (filters.status === "todos" || booking.status === filters.status) &&
      (filters.when === "todas" ||
        (filters.when === "proximas"
          ? booking.date >= today
          : booking.date < today)),
  );
  const sorted = matching.sort(compareBookings);
  return filters.when === "pasadas" ? sorted.reverse() : sorted;
}

export interface BookingStats {
  thisMonth: number;
  today: number;
  pending: number;
  toCollect: number;
}

export function bookingStats(state: SystemState, today: string): BookingStats {
  const active = state.bookings.filter(({ status }) => status !== "cancelada");
  return {
    thisMonth: active.filter(({ date }) => monthOf(date) === monthOf(today))
      .length,
    today: active.filter(({ date }) => date === today).length,
    pending: active.filter(
      ({ date, status }) => status === "pendiente" && date >= today,
    ).length,
    toCollect: active.reduce(
      (total, booking) => total + bookingCharge(booking, state, today).due,
      0,
    ),
  };
}

// A guest of today's bookings, for the gate's search.
export interface GuestMatch {
  booking: Booking;
  guest: BookingGuest;
}

export function findGuests(bookings: Booking[], query: string): GuestMatch[] {
  const text = searchable(query);
  if (!text) return [];
  const digits = text.replace(/[.\s]/g, "");
  const byDocument = /^\d+$/.test(digits);
  return bookings.flatMap((booking) =>
    booking.guests
      .filter((guest) =>
        byDocument
          ? guest.documentNumber.includes(digits)
          : searchable(`${guest.firstName} ${guest.lastName}`).includes(text) ||
            searchable(`${guest.lastName} ${guest.firstName}`).includes(text),
      )
      .map((guest) => ({ booking, guest })),
  );
}

// ───────── Guests ─────────

export const EMPTY_GUEST: BookingGuest = {
  firstName: "",
  lastName: "",
  documentNumber: "",
};

export function normalizeDocument(text: string): string {
  return text.replace(/\D/g, "");
}

function isDocument(text: string): boolean {
  return /^\d{7,8}$/.test(normalizeDocument(text)) && /^[\d.\s]+$/.test(text);
}

// "Pérez, Juan" or "Juan Carlos Pérez" (the last word is the last name).
function splitName(name: string): Pick<BookingGuest, "firstName" | "lastName"> {
  const [before, after] = name.split(",").map((part) => part.trim());
  if (after) return { firstName: after, lastName: before };
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return { firstName: "", lastName: words[0] };
  return {
    firstName: words.slice(0, -1).join(" "),
    lastName: words[words.length - 1],
  };
}

function parseGuestLine(line: string): BookingGuest | undefined {
  const cells = line
    .split(/\t|;/)
    .map((cell) => cell.trim())
    .filter(Boolean);
  // Three columns from a spreadsheet: first name, last name and document.
  if (cells.length >= 3 && isDocument(cells[2])) {
    return {
      firstName: cells[0],
      lastName: cells[1],
      documentNumber: normalizeDocument(cells[2]),
    };
  }
  // Otherwise the document is the last group of digits of the line.
  const match = line.trim().match(/^(.*?)[\s,;\t]+([\d.]{7,11})\s*$/);
  if (!match || !isDocument(match[2])) return undefined;
  const name = splitName(match[1].replace(/[\t;]+/g, " ").replace(/,$/, ""));
  if (!name.firstName) return undefined;
  return { ...name, documentNumber: normalizeDocument(match[2]) };
}

export interface ParsedGuests {
  guests: BookingGuest[];
  rejected: string[];
}

// A list pasted from a spreadsheet or a chat, one person per line.
export function parseGuestLines(text: string): ParsedGuests {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const guests: BookingGuest[] = [];
  const rejected: string[] = [];
  for (const line of lines) {
    const guest = parseGuestLine(line);
    if (guest) guests.push(guest);
    else rejected.push(line);
  }
  return { guests, rejected };
}

function isGuestComplete(guest: BookingGuest): boolean {
  return (
    guest.firstName.trim() !== "" &&
    guest.lastName.trim() !== "" &&
    /^\d{7,8}$/.test(normalizeDocument(guest.documentNumber))
  );
}

export function duplicateDocuments(guests: BookingGuest[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const { documentNumber } of guests) {
    const document = normalizeDocument(documentNumber);
    if (!document) continue;
    if (seen.has(document)) repeated.add(document);
    seen.add(document);
  }
  return [...repeated];
}

// Rows to flag: incomplete, with a wrong document, or a repeated one.
export function invalidGuestRows(guests: BookingGuest[]): number[] {
  const repeated = duplicateDocuments(guests);
  return guests.flatMap((guest, index) =>
    !isGuestComplete(guest) ||
    repeated.includes(normalizeDocument(guest.documentNumber))
      ? [index]
      : [],
  );
}

export function validateGuests(
  guests: BookingGuest[],
  venue: Venue,
): string | undefined {
  const incomplete = guests.flatMap((guest, index) =>
    isGuestComplete(guest) ? [] : [index + 1],
  );
  if (incomplete.length > 0) {
    return `Completá nombre, apellido y DNI (7 u 8 números) de cada invitado. Revisá ${incomplete.length === 1 ? "el renglón" : "los renglones"} ${incomplete.join(", ")}.`;
  }
  const repeated = duplicateDocuments(guests);
  if (repeated.length > 0) {
    return `Hay DNI repetidos en la lista: ${repeated.map(formatDocument).join(", ")}.`;
  }
  if (guests.length > venue.capacity) {
    return `El ${venue.name} admite hasta ${venue.capacity} personas y cargaste ${guests.length} invitados.`;
  }
  return undefined;
}

export function cleanGuests(guests: BookingGuest[]): BookingGuest[] {
  return guests.map((guest) => ({
    firstName: guest.firstName.trim(),
    lastName: guest.lastName.trim(),
    documentNumber: normalizeDocument(guest.documentNumber),
  }));
}

// ───────── Booking form ─────────

export interface BookingFormValues {
  venueId: string;
  date: string;
  slot: BookingSlot;
  responsibleKind: ResponsibleKind;
  memberId?: string;
  contactName: string;
  contactPhone: string;
  eventType: string;
  expectedPeople: string;
  guests: BookingGuest[];
  exclusive: boolean;
  notes: string;
}

export type BookingFormField =
  | "date"
  | "slot"
  | "member"
  | "contactName"
  | "contactPhone"
  | "expectedPeople"
  | "guests";

export type BookingFormErrors = Partial<Record<BookingFormField, string>>;

function validateResponsible(
  values: BookingFormValues,
  venue: Venue,
  member: Member | undefined,
): BookingFormErrors {
  if (values.responsibleKind === "socio" || venue.kind === "quincho") {
    if (!member) {
      return {
        member:
          venue.kind === "quincho"
            ? "Los quinchos los reserva un socio, que tiene que estar en el evento. Buscalo por nombre, DNI o número."
            : "Buscá al socio responsable por nombre, DNI o número.",
      };
    }
    if (member.status !== "activo") {
      return {
        member: `${fullName(member)} no está activo: solo los socios activos pueden reservar.`,
      };
    }
    return {};
  }
  const errors: BookingFormErrors = {};
  if (values.contactName.trim().length < 3) {
    errors.contactName = "Escribí el nombre y apellido de quien alquila.";
  }
  if (normalizeDocument(values.contactPhone).length < 8) {
    errors.contactPhone = "Escribí un teléfono para contactarlo.";
  }
  return errors;
}

export function validateBookingForm(
  values: BookingFormValues,
  state: SystemState,
  today: string,
): BookingFormErrors {
  const venue = findVenue(values.venueId);
  if (!venue) return { slot: "Elegí un espacio." };
  const member = values.memberId
    ? findMember(state.members, values.memberId)
    : undefined;
  const errors: BookingFormErrors = validateResponsible(values, venue, member);

  if (!values.date) {
    errors.date = "Elegí la fecha del evento.";
  } else if (values.date < today) {
    errors.date = "No se puede reservar una fecha que ya pasó.";
  } else {
    const taken = bookingAt(
      state.bookings,
      values.venueId,
      values.date,
      values.slot,
    );
    if (taken) {
      errors.slot = `Ese turno ya está reservado por ${taken.contactName}. Elegí otro turno, fecha o espacio.`;
    }
  }

  const people = Number(values.expectedPeople);
  if (!Number.isInteger(people) || people < 1) {
    errors.expectedPeople = "Escribí cuántas personas esperan.";
  } else if (people > venue.capacity) {
    errors.expectedPeople = `El ${venue.name} admite hasta ${venue.capacity} personas.`;
  } else if (people < values.guests.length) {
    errors.expectedPeople = `Cargaste ${values.guests.length} invitados: las personas esperadas no pueden ser menos.`;
  }

  const guestError = validateGuests(values.guests, venue);
  if (guestError) errors.guests = guestError;
  return errors;
}

export function toNewBookingInput(
  values: BookingFormValues,
  state: SystemState,
): NewBookingInput | undefined {
  const venue = findVenue(values.venueId);
  if (!venue) return undefined;
  const member =
    values.responsibleKind === "socio" || venue.kind === "quincho"
      ? values.memberId && findMember(state.members, values.memberId)
      : undefined;
  const guests = cleanGuests(values.guests);
  const exclusive = values.exclusive && canBeExclusive(venue, guests.length);
  return {
    venueId: venue.id,
    date: values.date,
    slot: values.slot,
    memberId: member ? member.id : undefined,
    contactName: member ? fullName(member) : values.contactName.trim(),
    contactPhone: member ? member.phone : values.contactPhone.trim(),
    eventType: values.eventType,
    expectedPeople: Number(values.expectedPeople),
    guests,
    exclusive,
    amount: bookingAmount(
      venue,
      values.slot,
      exclusive,
      guests.length,
      state.settings.bookingRates,
    ),
    notes: values.notes.trim() || undefined,
  };
}
