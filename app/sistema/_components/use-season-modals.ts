"use client";

import { useState } from "react";
import { findMember } from "../_lib/members";
import { unpaidPassFeeIds } from "../_lib/season";
import { useSystem } from "./use-system";

export type SeasonModalKind = "cobro" | "apto" | "carnet";

export interface SeasonModal {
  kind: SeasonModalKind;
  memberId?: string;
  // Fees the payment modal starts with selected besides the overdue ones.
  feeIds: string[];
}

interface SeasonModals {
  modal: SeasonModal | null;
  openModal: (kind: SeasonModalKind, memberId?: string) => void;
  closeModal: () => void;
}

// Which member action of the season screens is open, if any. Charging from
// here always includes the unpaid season pass, which is what the gate needs.
export function useSeasonModals(): SeasonModals {
  const { state } = useSystem();
  const [modal, setModal] = useState<SeasonModal | null>(null);
  return {
    modal,
    openModal: (kind, memberId) => {
      const member = memberId ? findMember(state.members, memberId) : undefined;
      const feeIds =
        kind === "cobro" && member ? unpaidPassFeeIds(member, state) : [];
      setModal({ kind, memberId, feeIds });
    },
    closeModal: () => setModal(null),
  };
}
