import type { BookingSlot, Venue, VenueKind } from "../_types";

export const VENUES: Venue[] = [
  {
    id: "quincho-grande",
    name: "Quincho grande",
    kind: "quincho",
    capacity: 60,
  },
  { id: "quincho-chico", name: "Quincho chico", kind: "quincho", capacity: 30 },
  { id: "salon", name: "Salón de eventos", kind: "salon", capacity: 120 },
];

// What each slot means for each kind of space (see the FAQ on the landing).
export const SLOT_LABELS: Record<VenueKind, Record<BookingSlot, string>> = {
  quincho: { dia: "Día (11 a 19 h)", noche: "Noche (20 a 1 h)" },
  salon: { dia: "Horario del club", noche: "Nocturno (21 a 4 h)" },
};

// A quincho is exclusive for groups of more than this many non-member guests.
export const EXCLUSIVE_MIN_GUESTS = 30;

export const EVENT_TYPES = [
  "Cumpleaños",
  "Reunión familiar",
  "Asado con amigos",
  "Fiesta de 15",
  "Casamiento",
  "Evento institucional",
];

export function findVenue(id: string): Venue | undefined {
  return VENUES.find((venue) => venue.id === id);
}
