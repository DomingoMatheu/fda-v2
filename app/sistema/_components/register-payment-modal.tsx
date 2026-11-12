"use client";

import { FEE_CONCEPT_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import { feeState } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import {
  formatDate,
  formatDocument,
  formatMoney,
  fullName,
  listName,
} from "../_lib/format";
import type { PaymentMethod } from "../_types";
import { Modal } from "./modal";
import { FeeStateBadge } from "./status-badge";
import { useRegisterPayment } from "./use-register-payment";
import { useSystem } from "./use-system";

interface RegisterPaymentModalProps {
  // Without a member, the modal starts with a member search.
  memberId?: string;
  onClose: () => void;
  // Called with the id of the receipt it issued, after closing.
  onRegistered?: (receiptId: string) => void;
}

export function RegisterPaymentModal({
  memberId,
  onClose,
  onRegistered,
}: RegisterPaymentModalProps) {
  const { state } = useSystem();
  const payment = useRegisterPayment(memberId, (receiptId) => {
    onClose();
    onRegistered?.(receiptId);
  });
  const { member, account } = payment;
  const ratePercent = Math.round(state.settings.lateFeeRate * 100);

  return (
    <Modal
      title="Registrar cobro"
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="sys-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={payment.confirm}
            disabled={!payment.canConfirm}
          >
            Confirmar cobro de {formatMoney(payment.total)}
          </button>
        </>
      }
    >
      {!member || !account ? (
        <div className="sys-payment__picker">
          <label className="sys-field">
            <span className="sys-field__label">Socio</span>
            <input
              className="sys-input"
              placeholder="Nombre, DNI o número de socio"
              value={payment.query}
              onChange={(event) => payment.setQuery(event.target.value)}
            />
          </label>
          <ul className="sys-payment__results">
            {payment.results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => payment.chooseMember(result.id)}
                >
                  <strong>{listName(result)}</strong>
                  <span>
                    N.º {result.memberNumber} · DNI{" "}
                    {formatDocument(result.documentNumber)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="sys-payment">
          <div className="sys-payment__member">
            <div>
              <p className="sys-payment__name">{fullName(member)}</p>
              <p className="sys-payment__meta">
                Socio n.º {member.memberNumber}
                {account.id !== member.id &&
                  ` · Se cobra al titular, ${fullName(account)}`}
              </p>
            </div>
            {!memberId && (
              <button
                type="button"
                className="sys-button sys-button--small"
                onClick={payment.clearMember}
              >
                Cambiar socio
              </button>
            )}
          </div>

          {payment.pendingFees.length === 0 ? (
            <p className="sys-payment__empty">
              No tiene cuotas pendientes. Está al día.
            </p>
          ) : (
            <fieldset className="sys-payment__fees">
              <legend className="sys-field__label">Cuotas a cobrar</legend>
              {payment.pendingFees.map((fee) => (
                <label key={fee.id} className="sys-payment__fee">
                  <input
                    type="checkbox"
                    checked={payment.isSelected(fee.id)}
                    onChange={() => payment.toggleFee(fee.id)}
                  />
                  <span className="sys-payment__fee-text">
                    <span>{fee.description}</span>
                    <span className="sys-payment__fee-meta">
                      {FEE_CONCEPT_LABELS[fee.concept]} · vence{" "}
                      {formatDate(fee.dueDate)}
                    </span>
                  </span>
                  <FeeStateBadge state={feeState(fee, DEMO_TODAY)} />
                  <span className="sys-payment__amount">
                    {formatMoney(fee.amount)}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          <div className="sys-payment__bottom">
            <label className="sys-field">
              <span className="sys-field__label">Medio de pago</span>
              <select
                className="sys-input"
                value={payment.method}
                onChange={(event) =>
                  payment.setMethod(event.target.value as PaymentMethod)
                }
              >
                {payment.methods.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </label>
            <dl className="sys-payment__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(payment.subtotal)}</dd>
              </div>
              <div>
                <dt>Recargo por mora ({ratePercent} %)</dt>
                <dd>{formatMoney(payment.surcharge)}</dd>
              </div>
              <div className="is-total">
                <dt>Total</dt>
                <dd>{formatMoney(payment.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </Modal>
  );
}
