"use client";

import Link from "next/link";
import {
  BOOKING_STATUS_FILTERS,
  BOOKING_WHEN_FILTERS,
  SLOT_SHORT_LABELS,
} from "../_data/booking-labels";
import { findVenue, VENUES } from "../_data/venues";
import { dayLabel, type BookingWhen } from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import type { Booking, BookingStatus } from "../_types";
import { BookingChargeBadge, BookingStatusBadge } from "./booking-badges";
import { DataTable, type Column } from "./data-table";
import { useBookingsList } from "./use-bookings-list";

export function BookingsList() {
  const list = useBookingsList();
  const { filters, setFilter } = list;

  const columns: Column<Booking>[] = [
    {
      key: "date",
      header: "Fecha",
      render: (booking) => (
        <Link
          href={`/sistema/reservas/${booking.id}`}
          className="sys-bookings__date-link"
        >
          {dayLabel(booking.date)}
          {booking.date === DEMO_TODAY && (
            <span className="sys-bookings__today"> · hoy</span>
          )}
        </Link>
      ),
    },
    {
      key: "slot",
      header: "Turno",
      render: (booking) => SLOT_SHORT_LABELS[booking.slot],
    },
    {
      key: "venue",
      header: "Espacio",
      render: (booking) => findVenue(booking.venueId)?.name ?? "—",
    },
    {
      key: "contact",
      header: "Responsable",
      render: (booking) => (
        <span className="sys-bookings__who">
          {booking.contactName}
          {!booking.memberId && (
            <span className="sys-bookings__meta">No socio</span>
          )}
        </span>
      ),
    },
    {
      key: "event",
      header: "Evento",
      hideOnMobile: true,
      render: (booking) => booking.eventType,
    },
    {
      key: "guests",
      header: "Invitados",
      align: "end",
      hideOnMobile: true,
      render: (booking) => booking.guests.length,
    },
    {
      key: "status",
      header: "Estado",
      render: (booking) => <BookingStatusBadge status={booking.status} />,
    },
    {
      key: "charge",
      header: "Cobro",
      hideOnMobile: true,
      render: (booking) => (
        <BookingChargeBadge charge={list.chargeOf(booking)} />
      ),
    },
  ];

  return (
    <section aria-label="Lista de reservas">
      <div className="sys-toolbar">
        <label className="sys-bookings__filter">
          <span className="sys-visually-hidden">Espacio</span>
          <select
            className="sys-input"
            value={filters.venueId}
            onChange={(event) => setFilter("venueId", event.target.value)}
          >
            <option value="todos">Todos los espacios</option>
            {VENUES.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </label>
        <label className="sys-bookings__filter">
          <span className="sys-visually-hidden">Estado</span>
          <select
            className="sys-input"
            value={filters.status}
            onChange={(event) =>
              setFilter("status", event.target.value as BookingStatus | "todos")
            }
          >
            {BOOKING_STATUS_FILTERS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="sys-bookings__filter">
          <span className="sys-visually-hidden">Período</span>
          <select
            className="sys-input"
            value={filters.when}
            onChange={(event) =>
              setFilter("when", event.target.value as BookingWhen)
            }
          >
            {BOOKING_WHEN_FILTERS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <DataTable
        caption="Reservas"
        columns={columns}
        rows={list.rows}
        rowKey={(booking) => booking.id}
        rowHref={(booking) => `/sistema/reservas/${booking.id}`}
        empty="No hay reservas con estos filtros."
      />
    </section>
  );
}
