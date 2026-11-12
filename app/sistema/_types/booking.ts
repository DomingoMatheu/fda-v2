// Bookings of the club's spaces ("Reservas"): the barbecue areas (quinchos)
// and the events hall (salón). Today the club keeps them on paper forms.

export type VenueKind = "quincho" | "salon";

export interface Venue {
  id: string;
  name: string;
  kind: VenueKind;
  capacity: number;
}

// Quinchos are booked for the day or the night; the hall either during the
// club's hours or for the night shift (21 to 4 h).
export type BookingSlot = "dia" | "noche";

// "pendiente": waiting for the signed guest list or the payment.
export type BookingStatus = "pendiente" | "confirmada" | "cancelada";

// Guests who are not members must be listed with their document.
export interface BookingGuest {
  firstName: string;
  lastName: string;
  documentNumber: string;
}

export interface Booking {
  id: string;
  venueId: string;
  date: string;
  slot: BookingSlot;
  // The member responsible for the event. Quinchos require one; the hall can
  // be rented by someone who is not a member.
  memberId?: string;
  contactName: string;
  contactPhone?: string;
  eventType: string;
  expectedPeople: number;
  guests: BookingGuest[];
  // A quincho for the group alone: more than 30 non-member guests, who pay
  // half the visitor entrance each.
  exclusive: boolean;
  status: BookingStatus;
  // What the booking costs (0 when free). Billed to the member's account as
  // a fee, or paid as an income when the renter is not a member.
  amount: number;
  feeId?: string;
  createdAt: string;
  createdByUserId: string;
  notes?: string;
}

// Values the booking form collects; the system fills in ids and status.
export type NewBookingInput = Omit<
  Booking,
  "id" | "status" | "feeId" | "createdAt" | "createdByUserId"
>;

export type BookingChanges = Partial<
  Pick<Booking, "guests" | "status" | "notes" | "expectedPeople">
>;
