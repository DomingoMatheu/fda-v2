import { DOCUMENT_TYPE_LABELS, GENDER_LABELS } from "../_data/member-labels";
import { DEMO_TODAY } from "../_lib/clock";
import type { NewMemberErrors, NewMemberValues } from "../_lib/new-member";
import type { DocumentType, Gender } from "../_types";
import { Field, labelEntries } from "./form-field";

export interface MemberFieldsProps {
  values: NewMemberValues;
  errors: NewMemberErrors;
  setValue: <Key extends keyof NewMemberValues>(
    key: Key,
    value: NewMemberValues[Key],
  ) => void;
}

type TextKey = {
  [Key in keyof NewMemberValues]: NewMemberValues[Key] extends string
    ? Key
    : never;
}[keyof NewMemberValues];

function textProps(
  { values, errors, setValue }: MemberFieldsProps,
  key: TextKey,
) {
  return {
    value: values[key],
    onChange: (event: { target: { value: string } }) =>
      setValue(key, event.target.value),
    "aria-invalid": errors[key] ? true : undefined,
    className: "sys-input",
  };
}

// Name, document, birth date and gender: shared by the sign-up form and the
// edit form of a member.
export function MemberPersonalFields(props: MemberFieldsProps) {
  const { values, errors, setValue } = props;
  return (
    <>
      <Field label="Nombre" error={errors.firstName}>
        <input {...textProps(props, "firstName")} autoComplete="off" />
      </Field>
      <Field label="Apellido" error={errors.lastName}>
        <input {...textProps(props, "lastName")} autoComplete="off" />
      </Field>
      <Field label="Tipo de documento">
        <select
          className="sys-input"
          value={values.documentType}
          onChange={(event) =>
            setValue("documentType", event.target.value as DocumentType)
          }
        >
          {labelEntries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Número de documento" error={errors.documentNumber}>
        <input {...textProps(props, "documentNumber")} inputMode="numeric" />
      </Field>
      <Field label="Fecha de nacimiento" error={errors.birthDate}>
        <input
          {...textProps(props, "birthDate")}
          type="date"
          max={DEMO_TODAY}
        />
      </Field>
      <Field label="Género">
        <select
          className="sys-input"
          value={values.gender}
          onChange={(event) => setValue("gender", event.target.value as Gender)}
        >
          {labelEntries(GENDER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}

// Phone, email and address.
export function MemberContactFields(props: MemberFieldsProps) {
  const { errors } = props;
  return (
    <>
      <Field label="Teléfono" hint="Para los recordatorios por WhatsApp.">
        <input
          {...textProps(props, "phone")}
          type="tel"
          placeholder="341 555 1234"
        />
      </Field>
      <Field label="Email" error={errors.email}>
        <input {...textProps(props, "email")} type="email" />
      </Field>
      <Field label="Calle" error={errors.street}>
        <input {...textProps(props, "street")} />
      </Field>
      <Field label="Número">
        <input {...textProps(props, "streetNumber")} inputMode="numeric" />
      </Field>
      <Field label="Piso y depto.">
        <input {...textProps(props, "floor")} />
      </Field>
      <Field label="Ciudad">
        <input {...textProps(props, "city")} />
      </Field>
    </>
  );
}

// Free-text notes, as a textarea.
export function MemberNotesField(
  props: MemberFieldsProps & { className?: string },
) {
  return (
    <Field label="Notas" className={props.className}>
      <textarea {...textProps(props, "notes")} rows={3} />
    </Field>
  );
}
