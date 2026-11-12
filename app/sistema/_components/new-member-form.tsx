"use client";

import Link from "next/link";
import { DISCIPLINE_PROGRAMS } from "../_data/disciplines";
import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import { formatMoney } from "../_lib/format";
import type { MemberCategory, PaymentMethod } from "../_types";
import { Field, labelEntries } from "./form-field";
import {
  MemberContactFields,
  MemberNotesField,
  MemberPersonalFields,
} from "./member-fields";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { useNewMemberForm } from "./use-new-member-form";

export function NewMemberForm() {
  const form = useNewMemberForm();
  const { values, errors, setValue } = form;
  return (
    <PermissionGate permission="members:write">
      <Link href="/sistema/socios" className="sys-member__back">
        ← Volver a socios
      </Link>
      <PageHeader
        eyebrow="Socios"
        title="Nuevo socio"
        description="Cargá los datos y el sistema le asigna el número, la inscripción y la primera cuota."
      />

      <form className="sys-new-member" onSubmit={form.submit} noValidate>
        <div className="sys-new-member__main">
          <fieldset className="sys-card sys-new-member__section">
            <legend className="sys-card__title">Datos personales</legend>
            <MemberPersonalFields {...form} />
          </fieldset>

          <fieldset className="sys-card sys-new-member__section">
            <legend className="sys-card__title">Contacto y domicilio</legend>
            <MemberContactFields {...form} />
          </fieldset>

          <fieldset className="sys-card sys-new-member__section">
            <legend className="sys-card__title">Membresía</legend>
            <Field
              label="Categoría"
              error={errors.category}
              hint={
                values.category === "familiar"
                  ? "Arranca un grupo familiar con plan básico, con este socio como titular."
                  : undefined
              }
            >
              <select
                className="sys-input"
                value={values.category}
                onChange={(event) =>
                  setValue("category", event.target.value as MemberCategory)
                }
              >
                {labelEntries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Medio de pago habitual">
              <select
                className="sys-input"
                value={values.preferredPaymentMethod}
                onChange={(event) =>
                  setValue(
                    "preferredPaymentMethod",
                    event.target.value as PaymentMethod,
                  )
                }
              >
                {labelEntries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sys-field sys-new-member__wide">
              <span className="sys-field__label" id="sys-new-disciplines">
                Disciplinas
              </span>
              <div
                className="sys-new-member__chips"
                role="group"
                aria-labelledby="sys-new-disciplines"
              >
                {DISCIPLINE_PROGRAMS.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className="sys-chip"
                    aria-pressed={values.disciplineIds.includes(program.id)}
                    onClick={() => form.toggleDiscipline(program.id)}
                  >
                    {program.name}
                  </button>
                ))}
              </div>
            </div>
            <MemberNotesField {...form} className="sys-new-member__wide" />
          </fieldset>
        </div>

        <aside className="sys-card sys-new-member__summary">
          <p className="sys-eyebrow">Socio n.º {form.nextNumber}</p>
          <h2 className="sys-card__title">Al guardar se generan</h2>
          {form.fees.length === 0 ? (
            <p className="sys-empty">
              Los socios vitalicios no pagan cuota social.
            </p>
          ) : (
            <dl className="sys-new-member__fees">
              {form.fees.map((fee) => (
                <div key={fee.description}>
                  <dt>{fee.description}</dt>
                  <dd>{formatMoney(fee.amount)}</dd>
                </div>
              ))}
              <div className="is-total">
                <dt>Total a cobrar</dt>
                <dd>{formatMoney(form.feesTotal)}</dd>
              </div>
            </dl>
          )}
          <button
            type="submit"
            className="sys-button sys-button--primary sys-button--block"
          >
            Guardar socio
          </button>
          <Link href="/sistema/socios" className="sys-button sys-button--block">
            Cancelar
          </Link>
        </aside>
      </form>
    </PermissionGate>
  );
}
