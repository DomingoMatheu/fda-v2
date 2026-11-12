"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DISCIPLINE_PROGRAMS } from "../_data/disciplines";
import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import { DOCUMENT_TYPE_LABELS, GENDER_LABELS } from "../_data/member-labels";
import { DEMO_TODAY } from "../_lib/clock";
import { formatMoney } from "../_lib/format";
import type { NewMemberValues } from "../_lib/new-member";
import type {
  DocumentType,
  Gender,
  MemberCategory,
  PaymentMethod,
} from "../_types";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { useNewMemberForm } from "./use-new-member-form";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}

function Field({ label, error, hint, wide = false, children }: FieldProps) {
  return (
    <label className={`sys-field${wide ? " sys-new-member__wide" : ""}`}>
      <span className="sys-field__label">{label}</span>
      {children}
      {error ? (
        <span className="sys-field__error">{error}</span>
      ) : (
        hint && <span className="sys-field__hint">{hint}</span>
      )}
    </label>
  );
}

function entries<Key extends string>(
  labels: Record<Key, string>,
): [Key, string][] {
  return Object.entries(labels) as [Key, string][];
}

type TextKey = {
  [Key in keyof NewMemberValues]: NewMemberValues[Key] extends string
    ? Key
    : never;
}[keyof NewMemberValues];

export function NewMemberForm() {
  const form = useNewMemberForm();
  const { values, errors, setValue } = form;
  const text = (key: TextKey) => ({
    value: values[key],
    onChange: (event: { target: { value: string } }) =>
      setValue(key, event.target.value),
    "aria-invalid": errors[key] ? true : undefined,
    className: "sys-input",
  });

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
            <Field label="Nombre" error={errors.firstName}>
              <input {...text("firstName")} autoComplete="off" />
            </Field>
            <Field label="Apellido" error={errors.lastName}>
              <input {...text("lastName")} autoComplete="off" />
            </Field>
            <Field label="Tipo de documento">
              <select
                className="sys-input"
                value={values.documentType}
                onChange={(event) =>
                  setValue("documentType", event.target.value as DocumentType)
                }
              >
                {entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento" error={errors.documentNumber}>
              <input {...text("documentNumber")} inputMode="numeric" />
            </Field>
            <Field label="Fecha de nacimiento" error={errors.birthDate}>
              <input {...text("birthDate")} type="date" max={DEMO_TODAY} />
            </Field>
            <Field label="Género">
              <select
                className="sys-input"
                value={values.gender}
                onChange={(event) =>
                  setValue("gender", event.target.value as Gender)
                }
              >
                {entries(GENDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </fieldset>

          <fieldset className="sys-card sys-new-member__section">
            <legend className="sys-card__title">Contacto y domicilio</legend>
            <Field label="Teléfono" hint="Para los recordatorios por WhatsApp.">
              <input {...text("phone")} type="tel" placeholder="341 555 1234" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input {...text("email")} type="email" />
            </Field>
            <Field label="Calle" error={errors.street}>
              <input {...text("street")} />
            </Field>
            <Field label="Número">
              <input {...text("streetNumber")} inputMode="numeric" />
            </Field>
            <Field label="Piso y depto.">
              <input {...text("floor")} />
            </Field>
            <Field label="Ciudad">
              <input {...text("city")} />
            </Field>
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
                {entries(CATEGORY_LABELS).map(([value, label]) => (
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
                {entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
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
            <Field label="Notas" wide>
              <textarea {...text("notes")} rows={3} />
            </Field>
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
