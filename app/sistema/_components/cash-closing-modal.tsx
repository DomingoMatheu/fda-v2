"use client";

import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import { BILL_DENOMINATIONS, dayLabel, differenceLabel } from "../_lib/cash";
import { formatDate, formatMoney } from "../_lib/format";
import type { AmountsByMethod, CashClosing, PaymentMethod } from "../_types";
import { Modal } from "./modal";
import { useCashClosing } from "./use-cash-closing";

interface CashClosingModalProps {
  day: string;
  expected: AmountsByMethod;
  methods: PaymentMethod[];
  total: number;
  previous?: CashClosing;
  onClose: () => void;
}

const FORM_ID = "cash-closing-form";

function differenceClass(difference: number): string {
  if (difference === 0) return "is-even";
  return difference > 0 ? "is-over" : "is-short";
}

export function CashClosingModal({
  day,
  expected,
  methods,
  total,
  previous,
  onClose,
}: CashClosingModalProps) {
  const form = useCashClosing(day, expected, previous, onClose);

  return (
    <Modal
      title={`${previous ? "Volver a cerrar" : "Cerrar"} la caja del ${formatDate(day)}`}
      onClose={onClose}
      wide
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
            Confirmar cierre
          </button>
        </>
      }
    >
      <form
        id={FORM_ID}
        className="sys-form sys-cash-close"
        onSubmit={form.submit}
        noValidate
      >
        {previous && (
          <p className="sys-cash__hint">
            Este día ya tiene un cierre. Si confirmás, el nuevo conteo lo
            reemplaza.
          </p>
        )}

        <section aria-labelledby="cash-expected">
          <h3 id="cash-expected" className="sys-field__label">
            Lo que espera el sistema ({dayLabel(day)})
          </h3>
          <dl className="sys-cash-close__expected">
            {methods.map((method) => (
              <div key={method}>
                <dt>{PAYMENT_METHOD_LABELS[method]}</dt>
                <dd>{formatMoney(expected[method])}</dd>
              </div>
            ))}
            <div className="is-total">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>
        </section>

        <label className="sys-cash-close__toggle">
          <input
            type="checkbox"
            checked={form.countBills}
            onChange={(event) => form.setCountBills(event.target.checked)}
          />
          Contar por billetes
        </label>

        {form.countBills ? (
          <fieldset className="sys-cash-close__bills">
            <legend className="sys-field__label">Billetes en la caja</legend>
            {BILL_DENOMINATIONS.map((bill) => (
              <label key={bill} className="sys-cash-close__bill">
                <span>{formatMoney(bill)}</span>
                <input
                  className="sys-input"
                  inputMode="numeric"
                  placeholder="0"
                  aria-label={`Billetes de ${formatMoney(bill)}`}
                  value={form.bills[bill] ?? ""}
                  onChange={(event) => form.setBill(bill, event.target.value)}
                />
                <span className="sys-cash-close__subtotal">
                  {formatMoney(bill * form.billsCount(bill))}
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="sys-field">
            <span className="sys-field__label">Efectivo contado</span>
            <input
              className="sys-input"
              inputMode="numeric"
              placeholder="$ 0"
              value={form.counted}
              onChange={(event) => form.setCounted(event.target.value)}
            />
          </label>
        )}

        <div
          className={`sys-cash-close__result ${differenceClass(form.difference)}`}
          aria-live="polite"
        >
          <p>
            Contado <strong>{formatMoney(form.countedCash)}</strong> · esperado{" "}
            <strong>{formatMoney(expected.efectivo)}</strong>
          </p>
          <p className="sys-cash-close__difference">
            {form.hasCount
              ? differenceLabel(form.difference)
              : "Cargá el conteo para ver la diferencia"}
          </p>
        </div>

        <label className="sys-field">
          <span className="sys-field__label">Notas (opcional)</span>
          <textarea
            className="sys-input sys-cash-close__notes"
            rows={2}
            placeholder="Ej.: faltante chico, se revisa mañana"
            value={form.notes}
            onChange={(event) => form.setNotes(event.target.value)}
          />
        </label>

        {form.error && (
          <p className="sys-form__error" role="alert">
            {form.error}
          </p>
        )}
      </form>
    </Modal>
  );
}
