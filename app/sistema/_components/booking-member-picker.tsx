"use client";

import { MEMBER_STATUS_LABELS } from "../_data/labels";
import { formatDocument, fullName, listName } from "../_lib/format";
import type { Member } from "../_types";
import { useBookingMemberPicker } from "./use-booking-member-picker";

interface BookingMemberPickerProps {
  member?: Member;
  onChoose: (memberId: string | undefined) => void;
  error?: string;
}

// The member responsible for the booking: search, pick, change.
export function BookingMemberPicker({
  member,
  onChoose,
  error,
}: BookingMemberPickerProps) {
  const picker = useBookingMemberPicker();
  if (member) {
    return (
      <div className="sys-field">
        <span className="sys-field__label">Socio responsable</span>
        <div className="sys-booking-member">
          <div>
            <p className="sys-booking-member__name">{fullName(member)}</p>
            <p className="sys-booking-member__meta">
              N.º {member.memberNumber} · DNI{" "}
              {formatDocument(member.documentNumber)}
              {member.phone && ` · Tel. ${member.phone}`}
              {member.status !== "activo" &&
                ` · ${MEMBER_STATUS_LABELS[member.status]}`}
            </p>
          </div>
          <button
            type="button"
            className="sys-button sys-button--small"
            onClick={() => onChoose(undefined)}
          >
            Cambiar socio
          </button>
        </div>
        {error && <span className="sys-field__error">{error}</span>}
      </div>
    );
  }
  return (
    <div className="sys-field">
      <label className="sys-field">
        <span className="sys-field__label">Socio responsable</span>
        <input
          type="search"
          className="sys-input"
          placeholder="Nombre, DNI o número de socio"
          value={picker.query}
          onChange={(event) => picker.setQuery(event.target.value)}
          aria-invalid={error ? true : undefined}
        />
      </label>
      {picker.results.length > 0 && (
        <ul className="sys-payment__results" aria-label="Socios encontrados">
          {picker.results.map((result) => (
            <li key={result.id}>
              <button type="button" onClick={() => onChoose(result.id)}>
                <strong>{listName(result)}</strong>
                <span>
                  N.º {result.memberNumber} · DNI{" "}
                  {formatDocument(result.documentNumber)}
                  {result.status !== "activo" &&
                    ` · ${MEMBER_STATUS_LABELS[result.status]}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {picker.query.trim() && picker.results.length === 0 && (
        <p className="sys-empty">No encontramos socios con “{picker.query}”.</p>
      )}
      {error && <span className="sys-field__error">{error}</span>}
    </div>
  );
}
