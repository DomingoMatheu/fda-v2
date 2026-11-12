"use client";

import { CLUB_BILLING_EMAIL } from "@/app/_components/club-info";
import { formatDate, formatMoney, fullName, listName } from "../_lib/format";
import { Modal } from "./modal";
import { useDebtNotice, type NoticeRecipient } from "./use-debt-notice";

interface DebtNoticeModalProps {
  memberIds: string[];
  onClose: () => void;
}

function lastNoticeLabel({ last }: NoticeRecipient): string | undefined {
  return last && `Avisado el ${formatDate(last.sentAt)}`;
}

export function DebtNoticeModal({ memberIds, onClose }: DebtNoticeModalProps) {
  const form = useDebtNotice(memberIds, onClose);
  const isBulk = form.recipients.length + form.withoutEmail.length > 1;
  const { preview } = form;

  return (
    <Modal
      title="Avisar deuda por correo"
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
            onClick={form.send}
            disabled={form.selectedCount === 0}
          >
            {form.selectedCount === 1
              ? "Enviar el aviso"
              : `Enviar ${form.selectedCount} avisos`}
          </button>
        </>
      }
    >
      <div className="sys-notice">
        <p className="sys-notice__demo">
          En la demo el envío es simulado: no sale ningún correo. En el sistema
          real sale desde <strong>{CLUB_BILLING_EMAIL}</strong> y queda
          registrado en la cuenta de cada socio.
        </p>

        {isBulk && form.recipients.length > 0 && (
          <fieldset className="sys-notice__recipients">
            <legend className="sys-field__label">
              Destinatarios ({form.selectedCount} de {form.recipients.length})
            </legend>
            {form.recipients.map((recipient) => {
              const { account, balance } = recipient;
              return (
                <div
                  key={account.id}
                  className={`sys-notice__recipient${preview?.recipient === recipient ? " is-previewed" : ""}`}
                >
                  <input
                    type="checkbox"
                    aria-label={`Enviar a ${fullName(account)}`}
                    checked={form.isSelected(account.id)}
                    onChange={() => form.toggle(account.id)}
                  />
                  <button
                    type="button"
                    className="sys-notice__who"
                    onClick={() => form.showPreview(account.id)}
                  >
                    <strong>{listName(account)}</strong>
                    <span>{account.email}</span>
                  </button>
                  <span className="sys-notice__debt">
                    {formatMoney(balance.overdueTotal)}
                    {recipient.last && (
                      <span className="sys-notice__last">
                        {lastNoticeLabel(recipient)}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </fieldset>
        )}

        {form.withoutEmail.length > 0 && (
          <p className="sys-notice__missing">
            {isBulk ? (
              <>
                <strong>
                  Sin correo cargado ({form.withoutEmail.length}):
                </strong>{" "}
                {form.withoutEmail
                  .map(({ account }) => fullName(account))
                  .join(", ")}
                . A ellos avisales por WhatsApp o cargá su correo en la ficha.
              </>
            ) : (
              <>
                {fullName(form.withoutEmail[0].account)} no tiene correo
                cargado. Avisale por WhatsApp o cargá su correo en la ficha.
              </>
            )}
          </p>
        )}

        {preview && (
          <article
            className="sys-notice__preview"
            aria-label="Vista previa del correo"
          >
            <dl className="sys-notice__headers">
              <div>
                <dt>Para</dt>
                <dd>
                  {fullName(preview.recipient.account)} &lt;
                  {preview.recipient.account.email}&gt;
                </dd>
              </div>
              <div>
                <dt>Asunto</dt>
                <dd>{preview.email.subject}</dd>
              </div>
            </dl>
            <p className="sys-notice__body">{preview.email.body}</p>
            {!isBulk && preview.recipient.last && (
              <p className="sys-notice__last">
                {lastNoticeLabel(preview.recipient)}.
              </p>
            )}
          </article>
        )}
      </div>
    </Modal>
  );
}
