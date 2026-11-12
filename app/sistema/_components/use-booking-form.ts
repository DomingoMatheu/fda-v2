"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { EVENT_TYPES, findVenue, VENUES } from "../_data/venues";
import {
  BOOKING_SLOTS,
  bookingAmount,
  bookingAt,
  canBeExclusive,
  exclusiveGuestPrice,
  toNewBookingInput,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { formatDate, fullName } from "../_lib/format";
import { accountHolder, findMember } from "../_lib/members";
import type {
  Booking,
  BookingGuest,
  BookingSlot,
  Member,
  Venue,
} from "../_types";
import { useSystem } from "./use-system";

export interface BookingFormInitial {
  venueId?: string;
  date?: string;
  slot?: BookingSlot;
}

export interface SlotOption {
  slot: BookingSlot;
  takenBy?: Booking;
}

interface BookingForm {
  values: BookingFormValues;
  errors: BookingFormErrors;
  submitted: boolean;
  setValue: <Key extends keyof BookingFormValues>(
    key: Key,
    value: BookingFormValues[Key],
  ) => void;
  setGuests: (guests: BookingGuest[]) => void;
  venue: Venue;
  slots: SlotOption[];
  takenBy?: Booking;
  member?: Member;
  // Whose account the fee goes to (the family holder for family members).
  account?: Member;
  isMemberBooking: boolean;
  exclusiveAllowed: boolean;
  guestPrice: number;
  amount: number;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

function initialValues(initial: BookingFormInitial): BookingFormValues {
  return {
    venueId: findVenue(initial.venueId ?? "")?.id ?? VENUES[0].id,
    date:
      initial.date && initial.date >= DEMO_TODAY ? initial.date : DEMO_TODAY,
    slot: initial.slot ?? "dia",
    responsibleKind: "socio",
    contactName: "",
    contactPhone: "",
    eventType: EVENT_TYPES[0],
    expectedPeople: "",
    guests: [],
    exclusive: false,
    notes: "",
  };
}

// "Nueva reserva": space, date and slot (never one already taken), who is
// responsible, guests and the cost. Validates on submit and then on every
// change, saves the booking and opens it.
export function useBookingForm(initial: BookingFormInitial): BookingForm {
  const router = useRouter();
  const { state, createBooking, notify } = useSystem();
  const [values, setValues] = useState(() => initialValues(initial));
  const [submitted, setSubmitted] = useState(false);
  // The booking just saved, so it does not show as taking its own slot
  // while the page moves to it.
  const [savedId, setSavedId] = useState<string>();
  const formState = savedId
    ? { ...state, bookings: state.bookings.filter(({ id }) => id !== savedId) }
    : state;
  const venue = findVenue(values.venueId) ?? VENUES[0];
  const isMemberBooking =
    venue.kind === "quincho" || values.responsibleKind === "socio";
  const member =
    isMemberBooking && values.memberId
      ? findMember(state.members, values.memberId)
      : undefined;
  const exclusiveAllowed = canBeExclusive(venue, values.guests.length);
  const errors = submitted
    ? validateBookingForm(values, formState, DEMO_TODAY)
    : {};

  return {
    values,
    errors,
    submitted,
    setValue: (key, value) =>
      setValues((current) => ({ ...current, [key]: value })),
    setGuests: (guests) => setValues((current) => ({ ...current, guests })),
    venue,
    slots: BOOKING_SLOTS.map((slot) => ({
      slot,
      takenBy: bookingAt(formState.bookings, venue.id, values.date, slot),
    })),
    takenBy: bookingAt(formState.bookings, venue.id, values.date, values.slot),
    member,
    account: member && accountHolder(member, state),
    isMemberBooking,
    exclusiveAllowed,
    guestPrice: exclusiveGuestPrice(state.settings.bookingRates),
    amount: bookingAmount(
      venue,
      values.slot,
      values.exclusive,
      values.guests.length,
      state.settings.bookingRates,
    ),
    submit: (event) => {
      event.preventDefault();
      setSubmitted(true);
      const found = validateBookingForm(values, state, DEMO_TODAY);
      const input = toNewBookingInput(values, state);
      if (Object.keys(found).length > 0 || !input) return;
      const id = createBooking(input);
      setSavedId(id);
      notify(
        `Reserva de ${venue.name} para el ${formatDate(input.date)} a nombre de ${member ? fullName(member) : input.contactName}.`,
      );
      router.push(`/sistema/reservas/${id}`);
    },
  };
}
