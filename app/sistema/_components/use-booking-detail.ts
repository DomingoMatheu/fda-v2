"use client";

import { useState } from "react";
import { findVenue } from "../_data/venues";
import {
  bookingCharge,
  bookingIncomes,
  cleanGuests,
  validateGuests,
  type BookingCharge,
} from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { findMember } from "../_lib/members";
import { can } from "../_lib/permissions";
import { findUserById } from "../_lib/receipts";
import type {
  Booking,
  BookingGuest,
  Member,
  OtherIncome,
  SystemUser,
  Venue,
} from "../_types";
import { useSystem } from "./use-system";

export type BookingModal = "cancelar" | "cobrar-cuota" | "registrar-pago";

interface BookingDetail {
  booking?: Booking;
  venue?: Venue;
  member?: Member;
  createdBy?: SystemUser;
  charge?: BookingCharge;
  incomes: OtherIncome[];
  canWrite: boolean;
  // Guests and notes can change until the booking is cancelled.
  isEditable: boolean;
  confirm: () => void;
  modal?: BookingModal;
  openModal: (modal: BookingModal) => void;
  closeModal: () => void;
  cancel: () => void;
  // Guest list being edited, or undefined while only shown.
  draftGuests?: BookingGuest[];
  startEditingGuests: () => void;
  setDraftGuests: (guests: BookingGuest[]) => void;
  stopEditingGuests: () => void;
  guestsTried: boolean;
  guestsError?: string;
  saveGuests: () => void;
  notes: string;
  setNotes: (notes: string) => void;
  expectedPeople: string;
  setExpectedPeople: (value: string) => void;
  detailsError?: string;
  detailsChanged: boolean;
  saveDetails: () => void;
  print: () => void;
}

function peopleError(
  value: string,
  booking: Booking,
  venue: Venue,
): string | undefined {
  const people = Number(value);
  if (!Number.isInteger(people) || people < 1) {
    return "Escribí cuántas personas esperan.";
  }
  if (people > venue.capacity) {
    return `El ${venue.name} admite hasta ${venue.capacity} personas.`;
  }
  if (people < booking.guests.length) {
    return `Hay ${booking.guests.length} invitados cargados: las personas esperadas no pueden ser menos.`;
  }
  return undefined;
}

// The booking page: its data, the guest list, status changes and payment.
export function useBookingDetail(bookingId: string): BookingDetail {
  const { state, user, updateBooking, notify } = useSystem();
  const booking = state.bookings.find(({ id }) => id === bookingId);
  const venue = booking && findVenue(booking.venueId);
  const canWrite = can(user, "bookings:write");
  const [modal, setModal] = useState<BookingModal>();
  const [draftGuests, setDraftGuests] = useState<BookingGuest[]>();
  const [guestsTried, setGuestsTried] = useState(false);
  // Edited values; undefined means "as saved".
  const [notesDraft, setNotesDraft] = useState<string>();
  const [peopleDraft, setPeopleDraft] = useState<string>();
  const [detailsTried, setDetailsTried] = useState(false);

  const notes = notesDraft ?? booking?.notes ?? "";
  const expectedPeople = peopleDraft ?? String(booking?.expectedPeople ?? "");
  const guestsError =
    draftGuests && venue && guestsTried
      ? validateGuests(draftGuests, venue)
      : undefined;
  const detailsError =
    booking && venue && detailsTried
      ? peopleError(expectedPeople, booking, venue)
      : undefined;

  return {
    booking,
    venue,
    member: booking?.memberId
      ? findMember(state.members, booking.memberId)
      : undefined,
    createdBy: booking && findUserById(booking.createdByUserId),
    charge: booking && bookingCharge(booking, state, DEMO_TODAY),
    incomes: booking ? bookingIncomes(state.incomes, booking.id) : [],
    canWrite,
    isEditable: canWrite && booking?.status !== "cancelada",
    confirm: () => {
      if (!booking) return;
      updateBooking(booking.id, { status: "confirmada" });
      notify(`Reserva de ${booking.contactName} confirmada.`);
    },
    modal,
    openModal: setModal,
    closeModal: () => setModal(undefined),
    cancel: () => {
      if (!booking) return;
      updateBooking(booking.id, { status: "cancelada" });
      setModal(undefined);
      setDraftGuests(undefined);
      notify(`Reserva de ${booking.contactName} cancelada.`, "info");
    },
    draftGuests,
    startEditingGuests: () => {
      setDraftGuests(booking?.guests ?? []);
      setGuestsTried(false);
    },
    setDraftGuests,
    stopEditingGuests: () => setDraftGuests(undefined),
    guestsTried,
    guestsError,
    saveGuests: () => {
      if (!booking || !venue || !draftGuests) return;
      setGuestsTried(true);
      if (validateGuests(draftGuests, venue)) return;
      const guests = cleanGuests(draftGuests);
      updateBooking(booking.id, {
        guests,
        expectedPeople: Math.max(booking.expectedPeople, guests.length),
      });
      setDraftGuests(undefined);
      notify(`Lista de invitados guardada (${guests.length}).`);
    },
    notes,
    setNotes: setNotesDraft,
    expectedPeople,
    setExpectedPeople: setPeopleDraft,
    detailsError,
    detailsChanged:
      notes !== (booking?.notes ?? "") ||
      expectedPeople !== String(booking?.expectedPeople ?? ""),
    saveDetails: () => {
      if (!booking || !venue) return;
      setDetailsTried(true);
      if (peopleError(expectedPeople, booking, venue)) return;
      updateBooking(booking.id, {
        notes: notes.trim() || undefined,
        expectedPeople: Number(expectedPeople),
      });
      setNotesDraft(undefined);
      setPeopleDraft(undefined);
      setDetailsTried(false);
      notify("Cambios guardados.");
    },
    print: () => window.print(),
  };
}
