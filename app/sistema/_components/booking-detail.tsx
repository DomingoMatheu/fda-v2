"use client";

import Link from "next/link";
import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import { SLOT_LABELS } from "../_data/venues";
import { dayLabel } from "../_lib/bookings";
import { countLabel } from "../_lib/count-label";
import { formatDate, formatDateTime, formatMoney } from "../_lib/format";
import { BookingCancelModal } from "./booking-cancel-modal";
import { BookingChargeBadge, BookingStatusBadge } from "./booking-badges";
import { BookingGuestSheet } from "./booking-guest-sheet";
import { BookingGuestTable } from "./booking-guest-table";
import { BookingGuestsEditor } from "./booking-guests-editor";
import { BookingIncomeModal } from "./booking-income-modal";
import { BookingMissing } from "./booking-missing";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { RegisterPaymentModal } from "./register-payment-modal";
import { FeeStateBadge } from "./status-badge";
import { useBookingDetail } from "./use-booking-detail";

interface BookingDetailProps {
  bookingId: string;
}

export function BookingDetail({ bookingId }: BookingDetailProps) {
  const detail = useBookingDetail(bookingId);
  const { booking, venue, member, charge } = detail;
  if (!booking || !venue || !charge) {
    return (
      <PermissionGate permission="bookings:read">
        <BookingMissing />
      </PermissionGate>
    );
  }
  const isPending = booking.status === "pendiente";

  return (
    <PermissionGate permission="bookings:read">
      <div className="sys-booking">
        <PageHeader
          eyebrow={`Reserva · ${countLabel(booking.guests.length, "invitado", "invitados")}`}
          title={`${venue.name} · ${dayLabel(booking.date)}`}
          description={`${SLOT_LABELS[venue.kind][booking.slot]} · ${booking.eventType} a nombre de ${booking.contactName}`}
          actions={
            <>
              <Link href="/sistema/reservas" className="sys-button">
                ← Reservas
              </Link>
              <button
                type="button"
                className="sys-button"
                onClick={detail.print}
                disabled={booking.guests.length === 0}
              >
                Imprimir planilla
              </button>
              {detail.canWrite && isPending && (
                <button
                  type="button"
                  className="sys-button sys-button--primary"
                  onClick={detail.confirm}
                >
                  Confirmar reserva
                </button>
              )}
              {detail.isEditable && (
                <button
                  type="button"
                  className="sys-button sys-button--danger"
                  onClick={() => detail.openModal("cancelar")}
                >
                  Cancelar reserva
                </button>
              )}
            </>
          }
        />

        <div className="sys-booking__grid">
          <div className="sys-booking__main">
            <section className="sys-card" aria-labelledby="booking-data">
              <h2 id="booking-data" className="sys-card__title">
                Datos de la reserva
              </h2>
              <dl className="sys-booking__facts">
                <div>
                  <dt>Estado</dt>
                  <dd>
                    <BookingStatusBadge status={booking.status} />
                  </dd>
                </div>
                <div>
                  <dt>Espacio</dt>
                  <dd>
                    {venue.name} (hasta {venue.capacity} personas)
                  </dd>
                </div>
                <div>
                  <dt>Fecha y turno</dt>
                  <dd>
                    {dayLabel(booking.date)} ·{" "}
                    {SLOT_LABELS[venue.kind][booking.slot]}
                  </dd>
                </div>
                <div>
                  <dt>Responsable</dt>
                  <dd>
                    {member ? (
                      <Link href={`/sistema/socios/${member.id}`}>
                        {booking.contactName} (socio n.º {member.memberNumber})
                      </Link>
                    ) : (
                      `${booking.contactName} (no socio)`
                    )}
                  </dd>
                </div>
                {booking.contactPhone && (
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{booking.contactPhone}</dd>
                  </div>
                )}
                <div>
                  <dt>Evento</dt>
                  <dd>{booking.eventType}</dd>
                </div>
                <div>
                  <dt>Personas esperadas</dt>
                  <dd>{booking.expectedPeople}</dd>
                </div>
                {venue.kind === "quincho" && (
                  <div>
                    <dt>Uso</dt>
                    <dd>{booking.exclusive ? "Exclusivo" : "Compartido"}</dd>
                  </div>
                )}
                <div>
                  <dt>Cargada</dt>
                  <dd>
                    {formatDateTime(booking.createdAt)}
                    {detail.createdBy && ` por ${detail.createdBy.name}`}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="sys-card" aria-labelledby="booking-guests">
              <div className="sys-booking__section-head">
                <h2 id="booking-guests" className="sys-card__title">
                  Invitados no socios ({booking.guests.length})
                </h2>
                {detail.isEditable && !detail.draftGuests && (
                  <button
                    type="button"
                    className="sys-button sys-button--small"
                    onClick={detail.startEditingGuests}
                  >
                    Editar invitados
                  </button>
                )}
              </div>
              {detail.draftGuests ? (
                <div className="sys-form">
                  <BookingGuestsEditor
                    guests={detail.draftGuests}
                    onChange={detail.setDraftGuests}
                    showErrors={detail.guestsTried}
                    error={detail.guestsError}
                    capacity={venue.capacity}
                  />
                  {booking.exclusive && (
                    <p className="sys-booking-form__hint">
                      El costo de la exclusividad se calculó con los invitados
                      cargados al reservar.
                    </p>
                  )}
                  <div className="sys-booking__edit-actions">
                    <button
                      type="button"
                      className="sys-button"
                      onClick={detail.stopEditingGuests}
                    >
                      Descartar cambios
                    </button>
                    <button
                      type="button"
                      className="sys-button sys-button--primary"
                      onClick={detail.saveGuests}
                    >
                      Guardar invitados
                    </button>
                  </div>
                </div>
              ) : (
                <BookingGuestTable
                  guests={booking.guests}
                  caption="Invitados no socios"
                />
              )}
            </section>
          </div>

          <div className="sys-booking__side">
            <section className="sys-card" aria-labelledby="booking-charge">
              <h2 id="booking-charge" className="sys-card__title">
                Cobro
              </h2>
              <dl className="sys-booking__facts">
                <div>
                  <dt>Costo</dt>
                  <dd>
                    {booking.amount > 0
                      ? formatMoney(booking.amount)
                      : "Sin costo"}
                  </dd>
                </div>
                <div>
                  <dt>Situación</dt>
                  <dd>
                    <BookingChargeBadge charge={charge} />
                  </dd>
                </div>
              </dl>
              {booking.amount === 0 && (
                <p className="sys-booking-form__hint">
                  Los quinchos no tienen costo para los socios.
                </p>
              )}
              {booking.memberId && charge.fee && (
                <div className="sys-booking__fee">
                  <p>
                    Cuota en la cuenta del socio: {charge.fee.description},
                    vence el {formatDate(charge.fee.dueDate)}.
                  </p>
                  <FeeStateBadge state={charge.feeState ?? charge.fee.status} />
                  {detail.canWrite && charge.state === "debe" && member && (
                    <button
                      type="button"
                      className="sys-button sys-button--primary sys-button--block"
                      onClick={() => detail.openModal("cobrar-cuota")}
                    >
                      Cobrar cuota de la reserva
                    </button>
                  )}
                </div>
              )}
              {!booking.memberId && booking.amount > 0 && (
                <div className="sys-booking__incomes">
                  <dl className="sys-booking__facts">
                    <div>
                      <dt>Pagado</dt>
                      <dd>{formatMoney(charge.paid)}</dd>
                    </div>
                    <div>
                      <dt>Saldo</dt>
                      <dd>{formatMoney(charge.due)}</dd>
                    </div>
                  </dl>
                  {detail.incomes.length > 0 && (
                    <ul
                      className="sys-booking__payments"
                      aria-label="Pagos registrados"
                    >
                      {detail.incomes.map((income) => (
                        <li key={income.id}>
                          <span>
                            {income.description}
                            <span className="sys-bookings__meta">
                              {formatDateTime(income.at)} ·{" "}
                              {PAYMENT_METHOD_LABELS[income.method]}
                            </span>
                          </span>
                          <strong>{formatMoney(income.amount)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                  {detail.isEditable && charge.due > 0 && (
                    <button
                      type="button"
                      className="sys-button sys-button--primary sys-button--block"
                      onClick={() => detail.openModal("registrar-pago")}
                    >
                      {charge.paid > 0
                        ? "Registrar saldo"
                        : "Registrar seña o pago"}
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="sys-card" aria-labelledby="booking-notes">
              <h2 id="booking-notes" className="sys-card__title">
                Notas
              </h2>
              {detail.isEditable ? (
                <div className="sys-form">
                  <label className="sys-field">
                    <span className="sys-field__label">Personas esperadas</span>
                    <input
                      type="number"
                      className="sys-input"
                      inputMode="numeric"
                      min={1}
                      max={venue.capacity}
                      value={detail.expectedPeople}
                      onChange={(event) =>
                        detail.setExpectedPeople(event.target.value)
                      }
                      aria-invalid={detail.detailsError ? true : undefined}
                    />
                    {detail.detailsError && (
                      <span className="sys-field__error">
                        {detail.detailsError}
                      </span>
                    )}
                  </label>
                  <label className="sys-field">
                    <span className="sys-field__label">Notas</span>
                    <textarea
                      className="sys-input sys-booking-form__notes"
                      rows={3}
                      value={detail.notes}
                      onChange={(event) => detail.setNotes(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="sys-button"
                    onClick={detail.saveDetails}
                    disabled={!detail.detailsChanged}
                  >
                    Guardar cambios
                  </button>
                </div>
              ) : (
                <p className={booking.notes ? undefined : "sys-empty"}>
                  {booking.notes ?? "Sin notas."}
                </p>
              )}
            </section>
          </div>
        </div>

        <BookingGuestSheet booking={booking} venue={venue} member={member} />

        {detail.modal === "cancelar" && (
          <BookingCancelModal
            booking={booking}
            charge={charge}
            onCancel={detail.cancel}
            onClose={detail.closeModal}
          />
        )}
        {detail.modal === "cobrar-cuota" && member && charge.fee && (
          <RegisterPaymentModal
            memberId={member.id}
            includeFeeIds={[charge.fee.id]}
            onClose={detail.closeModal}
          />
        )}
        {detail.modal === "registrar-pago" && (
          <BookingIncomeModal booking={booking} onClose={detail.closeModal} />
        )}
      </div>
    </PermissionGate>
  );
}
