import Image from "next/image";
import {
  CLUB_ADDRESS,
  CLUB_BILLING_EMAIL,
  CLUB_NAME,
  CLUB_PHONE,
} from "@/app/_components/club-info";
import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import {
  formatDate,
  formatDocument,
  formatMoney,
  formatTime,
  fullName,
} from "../_lib/format";
import type { Member, Receipt, SystemUser } from "../_types";

interface ReceiptDocumentProps {
  receipt: Receipt;
  member?: Member;
  registeredBy?: SystemUser;
}

// The printable receipt: one A4-friendly sheet with the club's details.
export function ReceiptDocument({
  receipt,
  member,
  registeredBy,
}: ReceiptDocumentProps) {
  return (
    <article className="sys-receipt" aria-label={`Recibo ${receipt.number}`}>
      <div className="sys-receipt__head">
        <div className="sys-receipt__club">
          <Image
            src="/escudo-limpio.svg"
            alt="Escudo del club"
            width={64}
            height={64}
            className="sys-receipt__crest"
          />
          <div>
            <p className="sys-receipt__club-name">{CLUB_NAME}</p>
            <p className="sys-receipt__club-data">
              {CLUB_ADDRESS.street}, {CLUB_ADDRESS.city}, {CLUB_ADDRESS.region}
            </p>
            <p className="sys-receipt__club-data">
              Tel. {CLUB_PHONE} · {CLUB_BILLING_EMAIL}
            </p>
          </div>
        </div>
        <div className="sys-receipt__id">
          <p className="sys-receipt__kind">Recibo</p>
          <p className="sys-receipt__number">N.º {receipt.number}</p>
          <p className="sys-receipt__date">
            {formatDate(receipt.issuedAt)} · {formatTime(receipt.issuedAt)} h
          </p>
        </div>
      </div>

      <dl className="sys-receipt__member">
        <div>
          <dt>Recibimos de</dt>
          <dd>{member ? fullName(member) : "—"}</dd>
        </div>
        {member && (
          <>
            <div>
              <dt>Socio n.º</dt>
              <dd>{member.memberNumber}</dd>
            </div>
            <div>
              <dt>{member.documentType}</dt>
              <dd>{formatDocument(member.documentNumber)}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{CATEGORY_LABELS[member.category]}</dd>
            </div>
          </>
        )}
      </dl>

      <table className="sys-receipt__items">
        <thead>
          <tr>
            <th scope="col">Detalle</th>
            <th scope="col" className="is-end">
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td>{item.description}</td>
              <td className="is-end">{formatMoney(item.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="is-end">{formatMoney(receipt.total)}</td>
          </tr>
        </tfoot>
      </table>

      <dl className="sys-receipt__meta">
        <div>
          <dt>Medio de pago</dt>
          <dd>{PAYMENT_METHOD_LABELS[receipt.method]}</dd>
        </div>
        <div>
          <dt>Registró</dt>
          <dd>{registeredBy?.name ?? "—"}</dd>
        </div>
      </dl>

      <p className="sys-receipt__note">
        Comprobante interno, no válido como factura.
      </p>
    </article>
  );
}
