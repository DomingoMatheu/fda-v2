"use client";

import { useState } from "react";
import { VENUES } from "../_data/venues";
import {
  BOOKING_SLOTS,
  bookingAt,
  daysOfMonth,
  monthLabel,
  monthOf,
  shiftMonth,
  weekdayIndex,
} from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { can } from "../_lib/permissions";
import type { Booking, BookingSlot, Venue } from "../_types";
import { useSystem } from "./use-system";

export interface CalendarSlot {
  slot: BookingSlot;
  booking?: Booking;
  // Where tapping the slot goes: the booking, or a new one for that slot.
  href?: string;
}

export interface CalendarVenueRow {
  venue: Venue;
  slots: CalendarSlot[];
}

export interface CalendarDay {
  date: string;
  isToday: boolean;
  isPast: boolean;
  venues: CalendarVenueRow[];
}

interface BookingsCalendar {
  label: string;
  // Empty cells before the 1st, so it falls on its weekday.
  leadingBlanks: number;
  days: CalendarDay[];
  isCurrentMonth: boolean;
  previous: () => void;
  next: () => void;
  goToday: () => void;
}

export function newBookingHref(
  venueId: string,
  date: string,
  slot: BookingSlot,
): string {
  return `/sistema/reservas/nueva?espacio=${venueId}&fecha=${date}&turno=${slot}`;
}

// The month grid of the bookings: each day shows every space by slot.
export function useBookingsCalendar(): BookingsCalendar {
  const { state, user } = useSystem();
  const [month, setMonth] = useState(monthOf(DEMO_TODAY));
  const canWrite = can(user, "bookings:write");
  const dates = daysOfMonth(month);

  const slotOf = (venue: Venue, date: string, slot: BookingSlot) => {
    const booking = bookingAt(state.bookings, venue.id, date, slot);
    const bookable = canWrite && date >= DEMO_TODAY;
    return {
      slot,
      booking,
      href: booking
        ? `/sistema/reservas/${booking.id}`
        : bookable
          ? newBookingHref(venue.id, date, slot)
          : undefined,
    };
  };

  return {
    label: monthLabel(month),
    leadingBlanks: weekdayIndex(dates[0]),
    days: dates.map((date) => ({
      date,
      isToday: date === DEMO_TODAY,
      isPast: date < DEMO_TODAY,
      venues: VENUES.map((venue) => ({
        venue,
        slots: BOOKING_SLOTS.map((slot) => slotOf(venue, date, slot)),
      })),
    })),
    isCurrentMonth: month === monthOf(DEMO_TODAY),
    previous: () => setMonth((current) => shiftMonth(current, -1)),
    next: () => setMonth((current) => shiftMonth(current, 1)),
    goToday: () => setMonth(monthOf(DEMO_TODAY)),
  };
}
