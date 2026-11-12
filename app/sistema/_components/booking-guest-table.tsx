import { formatDocument } from "../_lib/format";
import type { BookingGuest } from "../_types";

interface BookingGuestTableProps {
  guests: BookingGuest[];
  caption: string;
  // Adds an empty column to tick each guest at the gate (printed sheet).
  withCheck?: boolean;
  highlight?: string[];
}

// Read-only list of the non-member guests, sorted as loaded.
export function BookingGuestTable({
  guests,
  caption,
  withCheck = false,
  highlight = [],
}: BookingGuestTableProps) {
  if (guests.length === 0) {
    return <p className="sys-empty">No hay invitados no socios cargados.</p>;
  }
  return (
    <div className="sys-table-wrap sys-guests">
      <table className="sys-table">
        <caption className="sys-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="is-end">
              N.º
            </th>
            <th scope="col">Apellido y nombre</th>
            <th scope="col">DNI</th>
            {withCheck && <th scope="col">Ingresó</th>}
          </tr>
        </thead>
        <tbody>
          {guests.map((guest, index) => (
            <tr
              key={`${guest.documentNumber}-${index}`}
              className={
                highlight.includes(guest.documentNumber)
                  ? "is-highlighted"
                  : undefined
              }
            >
              <td className="is-end">{index + 1}</td>
              <td>
                {guest.lastName}, {guest.firstName}
              </td>
              <td className="sys-guests__document">
                {formatDocument(guest.documentNumber)}
              </td>
              {withCheck && (
                <td>
                  <span className="sys-guests__check" aria-hidden="true" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
