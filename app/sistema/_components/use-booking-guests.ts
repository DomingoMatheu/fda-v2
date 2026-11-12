"use client";

import { useState } from "react";
import {
  EMPTY_GUEST,
  invalidGuestRows,
  parseGuestLines,
} from "../_lib/bookings";
import { countLabel } from "../_lib/count-label";
import type { BookingGuest } from "../_types";

interface BookingGuestsEditor {
  setGuest: (index: number, key: keyof BookingGuest, value: string) => void;
  addGuest: () => void;
  removeGuest: (index: number) => void;
  isInvalid: (index: number) => boolean;
  isPasting: boolean;
  togglePaste: () => void;
  pasteText: string;
  setPasteText: (text: string) => void;
  applyPaste: () => void;
  // What happened with the last pasted list.
  pasteResult?: string;
  rejected: string[];
}

// Editing the guest list: one row per guest, or a list pasted from a
// spreadsheet (one person per line). The list itself belongs to the caller.
export function useBookingGuests(
  guests: BookingGuest[],
  onChange: (guests: BookingGuest[]) => void,
  // Flags wrong rows only after the first attempt to save.
  showErrors: boolean,
): BookingGuestsEditor {
  const [isPasting, setIsPasting] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteResult, setPasteResult] = useState<string>();
  const [rejected, setRejected] = useState<string[]>([]);
  const invalid = showErrors ? invalidGuestRows(guests) : [];

  return {
    setGuest: (index, key, value) =>
      onChange(
        guests.map((guest, position) =>
          position === index ? { ...guest, [key]: value } : guest,
        ),
      ),
    addGuest: () => onChange([...guests, EMPTY_GUEST]),
    removeGuest: (index) =>
      onChange(guests.filter((_, position) => position !== index)),
    isInvalid: (index) => invalid.includes(index),
    isPasting,
    togglePaste: () => setIsPasting((current) => !current),
    pasteText,
    setPasteText,
    applyPaste: () => {
      const parsed = parseGuestLines(pasteText);
      // Pasting over an empty first row replaces it.
      const kept = guests.filter(
        (guest) => guest.firstName || guest.lastName || guest.documentNumber,
      );
      onChange([...kept, ...parsed.guests]);
      setRejected(parsed.rejected);
      setPasteResult(
        `Se agregaron ${countLabel(parsed.guests.length, "invitado", "invitados")}.` +
          (parsed.rejected.length > 0
            ? ` No pudimos leer ${countLabel(parsed.rejected.length, "renglón", "renglones")}: cargalos a mano.`
            : ""),
      );
      setPasteText("");
      if (parsed.rejected.length === 0) setIsPasting(false);
    },
    pasteResult,
    rejected,
  };
}
