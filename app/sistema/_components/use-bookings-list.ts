"use client";

import { useState } from "react";
import {
  bookingCharge,
  filterBookings,
  type BookingCharge,
  type BookingFilters,
} from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import type { Booking } from "../_types";
import { useSystem } from "./use-system";

interface BookingsList {
  filters: BookingFilters;
  setFilter: <Key extends keyof BookingFilters>(
    key: Key,
    value: BookingFilters[Key],
  ) => void;
  rows: Booking[];
  chargeOf: (booking: Booking) => BookingCharge;
}

const DEFAULT_FILTERS: BookingFilters = {
  venueId: "todos",
  status: "todos",
  when: "proximas",
};

// "Lista": today's and upcoming bookings by default, filtered by space,
// status and period.
export function useBookingsList(): BookingsList {
  const { state } = useSystem();
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_FILTERS);
  return {
    filters,
    setFilter: (key, value) =>
      setFilters((current) => ({ ...current, [key]: value })),
    rows: filterBookings(state.bookings, filters, DEMO_TODAY),
    chargeOf: (booking) => bookingCharge(booking, state, DEMO_TODAY),
  };
}
