import type { BookingSlot, BookingStatus } from "../_types";
import type {
  BookingTab,
  BookingWhen,
  ResponsibleKind,
} from "../_lib/bookings";

// Spanish labels of the bookings screens ("Reservas").

export const BOOKING_TABS: { key: BookingTab; label: string }[] = [
  { key: "calendario", label: "Calendario" },
  { key: "lista", label: "Lista" },
  { key: "hoy", label: "Hoy (portería)" },
];

export const BOOKING_WHEN_FILTERS: { key: BookingWhen; label: string }[] = [
  { key: "proximas", label: "Hoy y próximas" },
  { key: "pasadas", label: "Pasadas" },
  { key: "todas", label: "Todas" },
];

export const BOOKING_STATUS_FILTERS: {
  key: BookingStatus | "todos";
  label: string;
}[] = [
  { key: "todos", label: "Todos los estados" },
  { key: "pendiente", label: "Pendientes" },
  { key: "confirmada", label: "Confirmadas" },
  { key: "cancelada", label: "Canceladas" },
];

export const RESPONSIBLE_KIND_LABELS: Record<ResponsibleKind, string> = {
  socio: "Socio del club",
  "no-socio": "No socio",
};

// Short names for the calendar cells, where space is tight.
export const VENUE_SHORT_NAMES: Record<string, string> = {
  "quincho-grande": "Q. grande",
  "quincho-chico": "Q. chico",
  salon: "Salón",
};

export const SLOT_SHORT_LABELS: Record<BookingSlot, string> = {
  dia: "Día",
  noche: "Noche",
};

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Monday first, as the club's paper calendar.
export const WEEKDAY_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

export const WEEKDAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
