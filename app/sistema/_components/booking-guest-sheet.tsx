import { CLUB_NAME } from "@/app/_components/club-info";
import { SLOT_LABELS } from "../_data/venues";
import { dayLabel } from "../_lib/bookings";
import type { Booking, Member, Venue } from "../_types";
import { BookingGuestTable } from "./booking-guest-table";

interface BookingGuestSheetProps {
  booking: Booking;
  venue: Venue;
  member?: Member;
}

// The printed guest list for the gate (only visible when printing).
export function BookingGuestSheet({
  booking,
  venue,
  member,
}: BookingGuestSheetProps) {
  return (
    <section className="sys-booking-sheet" aria-hidden="true">
      <p className="sys-booking-sheet__club">{CLUB_NAME}</p>
      <h2 className="sys-booking-sheet__title">
        Planilla de invitados · {venue.name}
      </h2>
      <p className="sys-booking-sheet__meta">
        {dayLabel(booking.date)} · {SLOT_LABELS[venue.kind][booking.slot]} ·{" "}
        {booking.eventType}
      </p>
      <p className="sys-booking-sheet__meta">
        Responsable: {booking.contactName}
        {member ? ` (socio n.º ${member.memberNumber})` : " (no socio)"}
        {booking.contactPhone && ` · Tel. ${booking.contactPhone}`} · Personas
        esperadas: {booking.expectedPeople}
      </p>
      <BookingGuestTable
        guests={booking.guests}
        caption="Invitados no socios"
        withCheck
      />
      <p className="sys-booking-sheet__sign">
        Firma del responsable: ______________________________
      </p>
    </section>
  );
}
