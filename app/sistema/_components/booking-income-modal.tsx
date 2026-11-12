"use client";

import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import { formatMoney } from "../_lib/format";
import type { Booking, PaymentMethod } from "../_types";
import { Modal } from "./modal";
import { useBookingIncome } from "./use-booking-income";

interface BookingIncomeModalProps {
  booking: Booking;
  onClose: () => void;
}

export function BookingIncomeModal({
  booking,
  onClose,
}: BookingIncomeModalProps) {
  const income = useBookingIncome(booking, onClose);
  return (
    <Modal
      title="Registrar pago del alquiler"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sys-button" onClick={onClose}>
            Volver
          </button>
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={income.confirm}
          >
            Registrar pago
          </button>
        </>
      }
    >
      <div className="sys-form">
        <dl className="sys-booking-pay__facts">
          <div>
            <dt>Alquila</dt>
            <dd>{booking.contactName} (no socio)</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatMoney(booking.amount)}</dd>
          </div>
          <div>
            <dt>Pagado</dt>
            <dd>{formatMoney(income.paid)}</dd>
          </div>
          <div className="is-total">
            <dt>Saldo</dt>
            <dd>{formatMoney(income.due)}</dd>
          </div>
        </dl>
        <div className="sys-booking-pay__quick">
          {income.paid === 0 && income.deposit < income.due && (
            <button
              type="button"
              className="sys-chip"
              onClick={() => income.setAmount(String(income.deposit))}
              aria-pressed={income.amount === String(income.deposit)}
            >
              Seña 50 % ({formatMoney(income.deposit)})
            </button>
          )}
          <button
            type="button"
            className="sys-chip"
            onClick={() => income.setAmount(String(income.due))}
            aria-pressed={income.amount === String(income.due)}
          >
            {income.paid > 0 ? "Saldo" : "Total"} ({formatMoney(income.due)})
          </button>
        </div>
        <label className="sys-field">
          <span className="sys-field__label">Importe</span>
          <input
            type="number"
            className="sys-input"
            inputMode="numeric"
            min={1}
            max={income.due}
            value={income.amount}
            onChange={(event) => income.setAmount(event.target.value)}
            aria-invalid={income.error ? true : undefined}
          />
          {income.error && (
            <span className="sys-field__error">{income.error}</span>
          )}
        </label>
        <label className="sys-field">
          <span className="sys-field__label">Medio de pago</span>
          <select
            className="sys-input"
            value={income.method}
            onChange={(event) =>
              income.setMethod(event.target.value as PaymentMethod)
            }
          >
            {income.methods.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </label>
        <p className="sys-booking-form__hint">
          Se registra como “{income.description}” en la caja del día.
        </p>
      </div>
    </Modal>
  );
}
