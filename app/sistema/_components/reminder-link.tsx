"use client";

import type { Member } from "../_types";
import { useReminder } from "./use-reminder";

interface ReminderLinkProps {
  member: Member;
  compact?: boolean;
}

// "Recordar por WhatsApp": opens WhatsApp with the reminder already written.
export function ReminderLink({ member, compact = false }: ReminderLinkProps) {
  const url = useReminder(member);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`sys-button sys-button--whatsapp${compact ? " sys-button--small" : ""}`}
    >
      {compact ? "WhatsApp" : "Recordar por WhatsApp"}
    </a>
  );
}
