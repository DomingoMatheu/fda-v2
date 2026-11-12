"use client";

import type { BookingGuest } from "../_types";
import { useBookingGuests } from "./use-booking-guests";

interface BookingGuestsEditorProps {
  guests: BookingGuest[];
  onChange: (guests: BookingGuest[]) => void;
  showErrors: boolean;
  error?: string;
  capacity: number;
}

const GUEST_FIELDS: {
  key: keyof BookingGuest;
  label: string;
  inputMode?: "numeric";
}[] = [
  { key: "firstName", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "documentNumber", label: "DNI", inputMode: "numeric" },
];

// Non-member guests: typed one by one or pasted from a spreadsheet.
export function BookingGuestsEditor({
  guests,
  onChange,
  showErrors,
  error,
  capacity,
}: BookingGuestsEditorProps) {
  const editor = useBookingGuests(guests, onChange, showErrors);
  return (
    <fieldset className="sys-guest-editor">
      <legend className="sys-field__label">
        Invitados no socios ({guests.length} de hasta {capacity})
      </legend>
      <p className="sys-guest-editor__hint">
        Nombre, apellido y DNI de cada invitado que no es socio. Portería los
        controla en la entrada.
      </p>
      {guests.length > 0 && (
        <ol className="sys-guest-editor__rows">
          {guests.map((guest, index) => (
            <li
              key={index}
              className={`sys-guest-editor__row${editor.isInvalid(index) ? " is-invalid" : ""}`}
            >
              <span className="sys-guest-editor__number" aria-hidden="true">
                {index + 1}
              </span>
              {GUEST_FIELDS.map((field) => (
                <input
                  key={field.key}
                  className="sys-input"
                  placeholder={field.label}
                  aria-label={`${field.label} del invitado ${index + 1}`}
                  aria-invalid={editor.isInvalid(index) || undefined}
                  inputMode={field.inputMode}
                  value={guest[field.key]}
                  onChange={(event) =>
                    editor.setGuest(index, field.key, event.target.value)
                  }
                />
              ))}
              <button
                type="button"
                className="sys-icon-button sys-guest-editor__remove"
                onClick={() => editor.removeGuest(index)}
                aria-label={`Quitar al invitado ${index + 1}`}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="sys-guest-editor__actions">
        <button
          type="button"
          className="sys-button sys-button--small"
          onClick={editor.addGuest}
        >
          + Agregar invitado
        </button>
        <button
          type="button"
          className="sys-button sys-button--small"
          onClick={editor.togglePaste}
          aria-expanded={editor.isPasting}
        >
          Pegar lista desde Excel
        </button>
      </div>
      {editor.isPasting && (
        <div className="sys-guest-editor__paste">
          <label className="sys-field">
            <span className="sys-field__label">Lista para pegar</span>
            <textarea
              className="sys-input sys-guest-editor__textarea"
              rows={6}
              placeholder={
                "Una persona por renglón: nombre, apellido y DNI\nJuan\tPérez\t30123456\nGómez, Lucía 28.456.789"
              }
              value={editor.pasteText}
              onChange={(event) => editor.setPasteText(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="sys-button sys-button--small sys-button--primary"
            onClick={editor.applyPaste}
            disabled={!editor.pasteText.trim()}
          >
            Agregar a la lista
          </button>
        </div>
      )}
      {editor.pasteResult && (
        <div role="status" className="sys-guest-editor__result">
          <p>{editor.pasteResult}</p>
          {editor.rejected.length > 0 && (
            <ul>
              {editor.rejected.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && (
        <p className="sys-field__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
