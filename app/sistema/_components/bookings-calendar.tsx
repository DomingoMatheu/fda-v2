"use client";

import Link from "next/link";
import {
  SLOT_SHORT_LABELS,
  VENUE_SHORT_NAMES,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
} from "../_data/booking-labels";
import { BOOKING_STATUS_LABELS } from "../_data/labels";
import { dayLabel, shortDayLabel } from "../_lib/bookings";
import type { Venue } from "../_types";
import {
  useBookingsCalendar,
  type CalendarDay,
  type CalendarSlot,
} from "./use-bookings-calendar";

function slotDescription(
  venue: Venue,
  date: string,
  { slot, booking, href }: CalendarSlot,
): string {
  const where = `${venue.name}, ${SLOT_SHORT_LABELS[slot].toLowerCase()} del ${dayLabel(date)}`;
  if (booking) {
    return `${where}: reservado por ${booking.contactName} (${BOOKING_STATUS_LABELS[booking.status].toLowerCase()})`;
  }
  return href ? `${where}: libre, reservar` : `${where}: libre`;
}

function SlotCell({
  venue,
  date,
  slot,
}: {
  venue: Venue;
  date: string;
  slot: CalendarSlot;
}) {
  const state = slot.booking ? slot.booking.status : "libre";
  const content = (
    <>
      <span className="sys-cal__slot-name">{SLOT_SHORT_LABELS[slot.slot]}</span>
      <span className="sys-cal__slot-who">
        {slot.booking ? slot.booking.contactName : "Libre"}
      </span>
    </>
  );
  const label = slotDescription(venue, date, slot);
  const className = `sys-cal__slot is-${state}`;
  return slot.href ? (
    <Link
      href={slot.href}
      className={className}
      aria-label={label}
      title={label}
    >
      {content}
    </Link>
  ) : (
    <span className={className} aria-label={label} title={label} role="img">
      {content}
    </span>
  );
}

function DayCell({ day }: { day: CalendarDay }) {
  const className = [
    "sys-cal__day",
    day.isToday ? "is-today" : "",
    day.isPast ? "is-past" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <li className={className} aria-current={day.isToday ? "date" : undefined}>
      <p className="sys-cal__date">
        <span className="sys-cal__date-number" aria-hidden="true">
          {Number(day.date.slice(8))}
        </span>
        <span className="sys-cal__date-long">
          {shortDayLabel(day.date)}
          {day.isToday && " · hoy"}
        </span>
      </p>
      <div className="sys-cal__venues">
        {day.venues.map(({ venue, slots }) => (
          <div key={venue.id} className="sys-cal__venue">
            <span className="sys-cal__venue-name">
              <span className="sys-cal__venue-short">
                {VENUE_SHORT_NAMES[venue.id] ?? venue.name}
              </span>
              <span className="sys-cal__venue-full">{venue.name}</span>
            </span>
            {slots.map((slot) => (
              <SlotCell
                key={slot.slot}
                venue={venue}
                date={day.date}
                slot={slot}
              />
            ))}
          </div>
        ))}
      </div>
    </li>
  );
}

// Month grid on wide screens; one row per day on a phone (CSS only).
export function BookingsCalendar() {
  const calendar = useBookingsCalendar();
  return (
    <section className="sys-cal" aria-label="Calendario de reservas">
      <div className="sys-cal__toolbar">
        <button
          type="button"
          className="sys-button sys-button--small"
          onClick={calendar.previous}
          aria-label="Mes anterior"
        >
          ←
        </button>
        <h2 className="sys-cal__month" aria-live="polite">
          {calendar.label}
        </h2>
        <button
          type="button"
          className="sys-button sys-button--small"
          onClick={calendar.next}
          aria-label="Mes siguiente"
        >
          →
        </button>
        {!calendar.isCurrentMonth && (
          <button
            type="button"
            className="sys-button sys-button--small"
            onClick={calendar.goToday}
          >
            Hoy
          </button>
        )}
        <ul className="sys-cal__legend" aria-label="Referencias">
          <li className="is-libre">Libre</li>
          <li className="is-pendiente">Pendiente</li>
          <li className="is-confirmada">Confirmada</li>
        </ul>
      </div>
      <ol className="sys-cal__grid">
        {WEEKDAY_SHORT.map((weekday, index) => (
          <li key={weekday} className="sys-cal__weekday" aria-hidden="true">
            <abbr title={WEEKDAY_NAMES[index]}>{weekday}</abbr>
          </li>
        ))}
        {Array.from({ length: calendar.leadingBlanks }, (_, index) => (
          <li
            key={`blank-${index}`}
            className="sys-cal__blank"
            aria-hidden="true"
          />
        ))}
        {calendar.days.map((day) => (
          <DayCell key={day.date} day={day} />
        ))}
      </ol>
    </section>
  );
}
