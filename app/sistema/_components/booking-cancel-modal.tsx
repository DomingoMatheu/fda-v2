"use client";

import { formatMoney } from "../_lib/format";
import type { BookingCharge } from "../_lib/bookings";
import type { Booking } from "../_types";
import { Modal } from "./modal";

interface BookingCancelModalProps {
  booking: Booking;
  charge: BookingCharge;
  onCancel: () => void;
  onClose: () => void;
}

function chargeNote(booking: Booking, charge: BookingCharge): string {
  if (charge.amount === 0) return "La reserva no tenía costo.";
  if (booking.memberId) {
    return charge.state === "pagada"
      ? "La cuota ya está paga: si corresponde devolverla, registralo en Caja."
      : `La cuota de ${formatMoney(charge.amount)} se anula en la cuenta del socio.`;
  }
  return charge.paid > 0
    ? `Ya pagó ${formatMoney(charge.paid)}: si corresponde devolverlo, registralo en Caja.`
    : "No había pagos registrados.";
}

export function BookingCancelModal({
  booking,
  charge,
  onCancel,
  onClose,
}: BookingCancelModalProps) {
  return (
    <Modal
      title="Cancelar reserva"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sys-button" onClick={onClose}>
            Volver
          </button>
          <button
            type="button"
            className="sys-button sys-button--danger"
            onClick={onCancel}
          >
            Sí, cancelar reserva
          </button>
        </>
      }
    >
      <div className="sys-form">
        <p>
          El turno queda libre para otra reserva y la lista de invitados deja de
          aparecer en portería.
        </p>
        <p className="sys-booking-form__hint">{chargeNote(booking, charge)}</p>
      </div>
    </Modal>
  );
}
