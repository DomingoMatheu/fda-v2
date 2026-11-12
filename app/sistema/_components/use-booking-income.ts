"use client";

import { useState } from "react";
import { findVenue } from "../_data/venues";
import { bookingCharge } from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { formatMoney } from "../_lib/format";
import type { Booking, PaymentMethod } from "../_types";
import { useSystem } from "./use-system";

interface BookingIncome {
  amount: string;
  setAmount: (amount: string) => void;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  methods: PaymentMethod[];
  due: number;
  paid: number;
  deposit: number;
  description: string;
  error?: string;
  confirm: () => void;
}

// A payment of a renter who is not a member: a deposit or the balance. It
// goes to the day's cash register as an income tied to the booking.
export function useBookingIncome(
  booking: Booking,
  onDone: () => void,
): BookingIncome {
  const { state, registerIncome, notify } = useSystem();
  const {
    due,
    paid,
    amount: total,
  } = bookingCharge(booking, state, DEMO_TODAY);
  // The club asks for half as a deposit to hold the date.
  const deposit = Math.min(Math.round(total / 2), due);
  const [amount, setAmount] = useState(String(paid === 0 ? deposit : due));
  const [method, setMethod] = useState<PaymentMethod>("transferencia");
  const [tried, setTried] = useState(false);
  const value = Number(amount);
  const venueName = findVenue(booking.venueId)?.name.toLowerCase() ?? "espacio";
  const kind =
    value >= due
      ? paid > 0
        ? "Saldo"
        : "Alquiler"
      : paid > 0
        ? "Pago a cuenta"
        : "Seña";
  const description = `${kind} del ${venueName}, ${booking.contactName}`;
  const problem =
    !Number.isInteger(value) || value <= 0
      ? "Escribí el importe que pagó."
      : value > due
        ? `El saldo es ${formatMoney(due)}: no puede pagar más.`
        : undefined;

  return {
    amount,
    setAmount,
    method,
    setMethod,
    methods: state.settings.paymentMethods,
    due,
    paid,
    deposit,
    description,
    error: tried ? problem : undefined,
    confirm: () => {
      setTried(true);
      if (problem) return;
      registerIncome({
        source: "alquiler",
        description,
        amount: value,
        method,
        bookingId: booking.id,
      });
      notify(
        `${kind} de ${formatMoney(value)} registrado. Entra en la caja del día.`,
      );
      onDone();
    },
  };
}
