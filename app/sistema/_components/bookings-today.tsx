"use client";

import Link from "next/link";
import { SLOT_LABELS, findVenue } from "../_data/venues";
import { dayLabel } from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { countLabel } from "../_lib/count-label";
import { formatDocument } from "../_lib/format";
import { BookingStatusBadge } from "./booking-badges";
import { BookingGuestTable } from "./booking-guest-table";
import { Icon } from "./icons";
import { useBookingsToday } from "./use-bookings-today";

// The gate's view: today's bookings with their guest lists to check by DNI.
export function BookingsToday() {
  const today = useBookingsToday();
  const highlighted = today.matches.map(({ guest }) => guest.documentNumber);

  return (
    <section className="sys-bookings-today" aria-label="Reservas de hoy">
      <div className="sys-card sys-bookings-today__search">
        <label className="sys-field">
          <span className="sys-field__label">
            Buscar invitado en las listas de hoy ({dayLabel(DEMO_TODAY)})
          </span>
          <span className="sys-bookings-today__input">
            <Icon name="search" />
            <input
              type="search"
              className="sys-input"
              placeholder="DNI, nombre o apellido"
              inputMode="search"
              value={today.query}
              onChange={(event) => today.setQuery(event.target.value)}
            />
          </span>
        </label>
        {today.hasQuery && (
          <div role="status" className="sys-bookings-today__result">
            {today.matches.length === 0 ? (
              <p className="sys-bookings-today__miss">
                No figura en las listas de hoy. Si no es socio, paga la entrada
                de visitante.
              </p>
            ) : (
              <ul>
                {today.matches.map(({ booking, guest }) => (
                  <li
                    key={`${booking.id}-${guest.documentNumber}`}
                    className="sys-bookings-today__hit"
                  >
                    <strong>
                      {guest.firstName} {guest.lastName}
                    </strong>{" "}
                    (DNI {formatDocument(guest.documentNumber)}) está en la
                    lista de {findVenue(booking.venueId)?.name}, invitado por{" "}
                    {booking.contactName}.
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {today.bookings.length === 0 ? (
        <p className="sys-card sys-empty">Hoy no hay reservas.</p>
      ) : (
        <>
          <p className="sys-bookings-today__summary">
            {countLabel(today.bookings.length, "reserva", "reservas")} hoy ·{" "}
            {countLabel(today.guestCount, "invitado", "invitados")} no socios
          </p>
          {today.bookings.map((booking) => {
            const venue = findVenue(booking.venueId);
            return (
              <article
                key={booking.id}
                className="sys-card sys-bookings-today__booking"
                aria-label={`${venue?.name}, ${booking.contactName}`}
              >
                <header className="sys-bookings-today__head">
                  <div>
                    <h2 className="sys-card__title">
                      {venue?.name} ·{" "}
                      {venue ? SLOT_LABELS[venue.kind][booking.slot] : ""}
                    </h2>
                    <p className="sys-bookings-today__meta">
                      Reservó <strong>{booking.contactName}</strong>
                      {booking.memberId ? " (socio)" : " (no socio)"}
                      {booking.contactPhone &&
                        ` · Tel. ${booking.contactPhone}`}
                      {` · ${booking.eventType} · ${booking.expectedPeople} personas esperadas`}
                    </p>
                  </div>
                  <div className="sys-bookings-today__actions">
                    <BookingStatusBadge status={booking.status} />
                    <Link
                      href={`/sistema/reservas/${booking.id}`}
                      className="sys-button sys-button--small"
                    >
                      Ver reserva
                    </Link>
                  </div>
                </header>
                <BookingGuestTable
                  guests={booking.guests}
                  caption={`Invitados no socios de ${booking.contactName}`}
                  highlight={highlighted}
                />
              </article>
            );
          })}
        </>
      )}
    </section>
  );
}
