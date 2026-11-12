import { BOOKING_STATUS_LABELS } from "../_data/labels";
import { formatMoney } from "../_lib/format";
import type { BookingCharge, ChargeState } from "../_lib/bookings";
import type { BookingStatus } from "../_types";
import { Badge, type BadgeTone } from "./status-badge";

const STATUS_TONES: Record<BookingStatus, BadgeTone> = {
  pendiente: "warn",
  confirmada: "ok",
  cancelada: "neutral",
};

const CHARGE_TONES: Record<ChargeState, BadgeTone> = {
  "sin-costo": "neutral",
  pagada: "ok",
  seña: "info",
  debe: "warn",
  anulada: "neutral",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge tone={STATUS_TONES[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>
  );
}

function chargeLabel(charge: BookingCharge): string {
  switch (charge.state) {
    case "sin-costo":
      return "Sin costo";
    case "pagada":
      return "Pagada";
    case "seña":
      return `Seña · debe ${formatMoney(charge.due)}`;
    case "debe":
      return `Debe ${formatMoney(charge.due)}`;
    case "anulada":
      return "Cobro anulado";
  }
}

// How the booking stands with its payment, for lists and the detail.
export function BookingChargeBadge({ charge }: { charge: BookingCharge }) {
  return <Badge tone={CHARGE_TONES[charge.state]}>{chargeLabel(charge)}</Badge>;
}
