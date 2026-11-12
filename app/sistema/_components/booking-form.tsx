"use client";

import Link from "next/link";
import { RESPONSIBLE_KIND_LABELS } from "../_data/booking-labels";
import {
  EVENT_TYPES,
  EXCLUSIVE_MIN_GUESTS,
  SLOT_LABELS,
  VENUES,
} from "../_data/venues";
import type { ResponsibleKind } from "../_lib/bookings";
import { dayLabel } from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { formatMoney, fullName } from "../_lib/format";
import type { BookingSlot } from "../_types";
import { BookingGuestsEditor } from "./booking-guests-editor";
import { BookingMemberPicker } from "./booking-member-picker";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { useBookingForm, type BookingFormInitial } from "./use-booking-form";

const RESPONSIBLE_KINDS: ResponsibleKind[] = ["socio", "no-socio"];

function FieldError({ message }: { message?: string }) {
  return message ? <span className="sys-field__error">{message}</span> : null;
}

export function BookingForm({ initial }: { initial: BookingFormInitial }) {
  const form = useBookingForm(initial);
  const { values, errors, setValue, venue } = form;
  const slotLabels = SLOT_LABELS[venue.kind];
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <PermissionGate permission="bookings:write">
      <PageHeader
        eyebrow="Reservas"
        title="Nueva reserva"
        description="Reemplaza la planilla en papel: el turno queda tomado y portería ve la lista de invitados el día del evento."
        actions={
          <Link href="/sistema/reservas" className="sys-button">
            ← Reservas
          </Link>
        }
      />
      <form className="sys-booking-form" onSubmit={form.submit} noValidate>
        <div className="sys-booking-form__main">
          <section className="sys-card sys-form">
            <h2 className="sys-card__title">Espacio y turno</h2>
            <div className="sys-booking-form__row">
              <label className="sys-field">
                <span className="sys-field__label">Espacio</span>
                <select
                  className="sys-input"
                  value={values.venueId}
                  onChange={(event) => setValue("venueId", event.target.value)}
                >
                  {VENUES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} (hasta {option.capacity} personas)
                    </option>
                  ))}
                </select>
              </label>
              <label className="sys-field">
                <span className="sys-field__label">Fecha</span>
                <input
                  type="date"
                  className="sys-input"
                  min={DEMO_TODAY}
                  value={values.date}
                  onChange={(event) => setValue("date", event.target.value)}
                  aria-invalid={errors.date ? true : undefined}
                />
                <FieldError message={errors.date} />
              </label>
            </div>
            <fieldset className="sys-booking-form__slots">
              <legend className="sys-field__label">Turno</legend>
              {form.slots.map(({ slot, takenBy }) => (
                <label
                  key={slot}
                  className={`sys-booking-form__slot${takenBy ? " is-taken" : ""}`}
                >
                  <input
                    type="radio"
                    name="slot"
                    value={slot}
                    checked={values.slot === slot}
                    disabled={Boolean(takenBy)}
                    onChange={() => setValue("slot", slot as BookingSlot)}
                  />
                  <span>
                    <strong>{slotLabels[slot]}</strong>
                    <span className="sys-booking-form__slot-state">
                      {takenBy ? `Ocupado: ${takenBy.contactName}` : "Libre"}
                    </span>
                  </span>
                </label>
              ))}
              <FieldError message={errors.slot} />
              {!errors.slot && form.takenBy && (
                <span className="sys-field__error">
                  Ese turno ya está reservado. Elegí otro turno, fecha o
                  espacio.
                </span>
              )}
            </fieldset>
          </section>

          <section className="sys-card sys-form">
            <h2 className="sys-card__title">Responsable</h2>
            {venue.kind === "salon" ? (
              <fieldset className="sys-booking-form__kinds">
                <legend className="sys-field__label">Quién alquila</legend>
                {RESPONSIBLE_KINDS.map((kind) => (
                  <label key={kind} className="sys-booking-form__kind">
                    <input
                      type="radio"
                      name="responsibleKind"
                      value={kind}
                      checked={values.responsibleKind === kind}
                      onChange={() => setValue("responsibleKind", kind)}
                    />
                    {RESPONSIBLE_KIND_LABELS[kind]}
                  </label>
                ))}
              </fieldset>
            ) : (
              <p className="sys-booking-form__hint">
                Los quinchos se reservan sin costo y solo los reserva un socio,
                que tiene que estar en el evento.
              </p>
            )}
            {form.isMemberBooking ? (
              <BookingMemberPicker
                member={form.member}
                onChoose={(memberId) => setValue("memberId", memberId)}
                error={errors.member}
              />
            ) : (
              <div className="sys-booking-form__row">
                <label className="sys-field">
                  <span className="sys-field__label">Nombre y apellido</span>
                  <input
                    className="sys-input"
                    autoComplete="off"
                    value={values.contactName}
                    onChange={(event) =>
                      setValue("contactName", event.target.value)
                    }
                    aria-invalid={errors.contactName ? true : undefined}
                  />
                  <FieldError message={errors.contactName} />
                </label>
                <label className="sys-field">
                  <span className="sys-field__label">Teléfono</span>
                  <input
                    type="tel"
                    className="sys-input"
                    autoComplete="off"
                    value={values.contactPhone}
                    onChange={(event) =>
                      setValue("contactPhone", event.target.value)
                    }
                    aria-invalid={errors.contactPhone ? true : undefined}
                  />
                  <FieldError message={errors.contactPhone} />
                </label>
              </div>
            )}
          </section>

          <section className="sys-card sys-form">
            <h2 className="sys-card__title">Evento e invitados</h2>
            <div className="sys-booking-form__row">
              <label className="sys-field">
                <span className="sys-field__label">Tipo de evento</span>
                <select
                  className="sys-input"
                  value={values.eventType}
                  onChange={(event) =>
                    setValue("eventType", event.target.value)
                  }
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="sys-field">
                <span className="sys-field__label">
                  Personas esperadas (socios e invitados)
                </span>
                <input
                  type="number"
                  className="sys-input"
                  min={1}
                  max={venue.capacity}
                  inputMode="numeric"
                  value={values.expectedPeople}
                  onChange={(event) =>
                    setValue("expectedPeople", event.target.value)
                  }
                  aria-invalid={errors.expectedPeople ? true : undefined}
                />
                <FieldError message={errors.expectedPeople} />
              </label>
            </div>
            <BookingGuestsEditor
              guests={values.guests}
              onChange={form.setGuests}
              showErrors={form.submitted}
              error={errors.guests}
              capacity={venue.capacity}
            />
            {venue.kind === "quincho" && (
              <label
                className={`sys-booking-form__exclusive${form.exclusiveAllowed ? "" : " is-disabled"}`}
              >
                <input
                  type="checkbox"
                  checked={values.exclusive && form.exclusiveAllowed}
                  disabled={!form.exclusiveAllowed}
                  onChange={(event) =>
                    setValue("exclusive", event.target.checked)
                  }
                />
                <span>
                  <strong>Uso exclusivo del quincho</strong>
                  <span className="sys-booking-form__hint">
                    {form.exclusiveAllowed
                      ? `Cada invitado no socio paga ${formatMoney(form.guestPrice)} (la mitad de la entrada de visitante).`
                      : `Solo con más de ${EXCLUSIVE_MIN_GUESTS} invitados no socios (cargaste ${values.guests.length}).`}
                  </span>
                </span>
              </label>
            )}
            <label className="sys-field">
              <span className="sys-field__label">Notas (opcional)</span>
              <textarea
                className="sys-input sys-booking-form__notes"
                rows={3}
                value={values.notes}
                onChange={(event) => setValue("notes", event.target.value)}
              />
            </label>
          </section>
        </div>

        <aside
          className="sys-card sys-booking-form__summary"
          aria-label="Resumen de la reserva"
        >
          <h2 className="sys-card__title">Resumen</h2>
          <dl className="sys-booking-form__facts">
            <div>
              <dt>Espacio</dt>
              <dd>{venue.name}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{values.date ? dayLabel(values.date) : "—"}</dd>
            </div>
            <div>
              <dt>Turno</dt>
              <dd>{slotLabels[values.slot]}</dd>
            </div>
            <div>
              <dt>Invitados no socios</dt>
              <dd>{values.guests.length}</dd>
            </div>
            <div className="is-total">
              <dt>Costo</dt>
              <dd>
                {form.amount > 0 ? formatMoney(form.amount) : "Sin costo"}
              </dd>
            </div>
          </dl>
          <p className="sys-booking-form__hint">
            {form.amount === 0
              ? "Los quinchos no tienen costo para los socios."
              : form.isMemberBooking
                ? form.account
                  ? `Se carga como cuota en la cuenta de ${fullName(form.account)} y se cobra desde Cobranza o el detalle de la reserva.`
                  : "Se carga como cuota en la cuenta del socio responsable."
                : "Quien alquila paga en Secretaría: registrá la seña o el pago desde el detalle de la reserva."}
          </p>
          {hasErrors && (
            <p className="sys-form__error" role="alert">
              Revisá los datos marcados antes de guardar.
            </p>
          )}
          <button
            type="submit"
            className="sys-button sys-button--primary sys-button--block"
          >
            Guardar reserva
          </button>
        </aside>
      </form>
    </PermissionGate>
  );
}
