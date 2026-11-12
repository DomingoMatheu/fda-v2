"use client";

import { useState } from "react";
import { bookingsOn, findGuests, type GuestMatch } from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import type { Booking } from "../_types";
import { useSystem } from "./use-system";

interface BookingsToday {
  bookings: Booking[];
  guestCount: number;
  query: string;
  setQuery: (query: string) => void;
  matches: GuestMatch[];
  hasQuery: boolean;
}

// "Hoy": the gate checks who booked and the non-member guests by document.
export function useBookingsToday(): BookingsToday {
  const { state } = useSystem();
  const [query, setQuery] = useState("");
  const bookings = bookingsOn(state.bookings, DEMO_TODAY).filter(
    ({ status }) => status !== "cancelada",
  );
  return {
    bookings,
    guestCount: bookings.reduce(
      (total, booking) => total + booking.guests.length,
      0,
    ),
    query,
    setQuery,
    matches: findGuests(bookings, query),
    hasQuery: query.trim().length > 0,
  };
}
