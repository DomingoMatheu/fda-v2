"use client";

import { INCOME_SOURCE_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import type { IncomeSource, PaymentMethod } from "../_types";
import { Modal } from "./modal";
import { INCOME_SOURCES, useCashIncome } from "./use-cash-income";

interface CashIncomeModalProps {
  onClose: () => void;
  onRegistered: () => void;
}

const FORM_ID = "cash-income-form";

export function CashIncomeModal({
  onClose,
  onRegistered,
}: CashIncomeModalProps) {
  const form = useCashIncome(() => {
    onClose();
    onRegistered();
  });

  return (
    <Modal
      title="Registrar otro ingreso"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sys-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form={FORM_ID}
            className="sys-button sys-button--primary"
          >
            Registrar ingreso
          </button>
        </>
      }
    >
      <form id={FORM_ID} className="sys-form" onSubmit={form.submit} noValidate>
        <p className="sys-cash__hint">
          Para lo que no es una cuota: entradas de visitantes, alquileres, el
          canon del buffet. Entra en la caja de hoy.
        </p>
        <label className="sys-field">
          <span className="sys-field__label">Origen</span>
          <select
            className="sys-input"
            value={form.source}
            onChange={(event) =>
              form.setSource(event.target.value as IncomeSource)
            }
          >
            {INCOME_SOURCES.map((source) => (
              <option key={source} value={source}>
                {INCOME_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </label>
        <label className="sys-field">
          <span className="sys-field__label">Descripción</span>
          <input
            className="sys-input"
            placeholder="Ej.: Seña del salón, familia Gómez"
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
          />
        </label>
        <div className="sys-cash__form-row">
          <label className="sys-field">
            <span className="sys-field__label">Importe</span>
            <input
              className="sys-input"
              inputMode="numeric"
              placeholder="$ 0"
              value={form.amount}
              onChange={(event) => form.setAmount(event.target.value)}
            />
          </label>
          <label className="sys-field">
            <span className="sys-field__label">Medio de pago</span>
            <select
              className="sys-input"
              value={form.method}
              onChange={(event) =>
                form.setMethod(event.target.value as PaymentMethod)
              }
            >
              {form.methods.map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {form.error && (
          <p className="sys-form__error" role="alert">
            {form.error}
          </p>
        )}
      </form>
    </Modal>
  );
}
