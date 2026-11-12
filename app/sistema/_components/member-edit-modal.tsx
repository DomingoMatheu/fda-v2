"use client";

import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "../_data/labels";
import type { Member, MemberCategory, PaymentMethod } from "../_types";
import { Field, labelEntries } from "./form-field";
import {
  MemberContactFields,
  MemberNotesField,
  MemberPersonalFields,
} from "./member-fields";
import { Modal } from "./modal";
import { useMemberEdit } from "./use-member-edit";

interface MemberEditModalProps {
  member: Member;
  onClose: () => void;
}

const FORM_ID = "sys-member-edit-form";

export function MemberEditModal({ member, onClose }: MemberEditModalProps) {
  const form = useMemberEdit(member, onClose);
  const { values, errors, setValue } = form;

  return (
    <Modal
      title="Editar datos del socio"
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
            Guardar cambios
          </button>
        </>
      }
    >
      <form
        id={FORM_ID}
        className="sys-member-edit"
        onSubmit={form.submit}
        noValidate
      >
        <fieldset className="sys-member-edit__section">
          <legend className="sys-member-edit__legend">Datos personales</legend>
          <MemberPersonalFields {...form} />
        </fieldset>
        <fieldset className="sys-member-edit__section">
          <legend className="sys-member-edit__legend">
            Contacto y domicilio
          </legend>
          <MemberContactFields {...form} />
        </fieldset>
        <fieldset className="sys-member-edit__section">
          <legend className="sys-member-edit__legend">Membresía</legend>
          <Field
            label="Categoría"
            error={errors.category}
            hint={
              member.category === "familiar"
                ? "Para sacarlo del grupo familiar hay que hacerlo desde el grupo: cambia a quién se le cobra."
                : undefined
            }
          >
            <select
              className="sys-input"
              value={values.category}
              disabled={form.categories.length === 1}
              onChange={(event) =>
                setValue("category", event.target.value as MemberCategory)
              }
            >
              {form.categories.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
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
          <MemberNotesField {...form} className="sys-member-edit__wide" />
        </fieldset>
      </form>
    </Modal>
  );
}
