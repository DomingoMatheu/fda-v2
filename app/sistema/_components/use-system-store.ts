"use client";

import { useReducer } from "react";
import { buildSeed } from "../_data/seed";
import { nextReceiptSequence } from "../_lib/billing";
import { nowIso } from "../_lib/clock";
import { nextMemberNumber, systemReducer } from "../_lib/system-reducer";
import type { SystemUser } from "../_types";
import type { SystemContextValue } from "./system-context";
import { useToasts } from "./use-toasts";

// The demo's in-memory store: seeded mock data plus the actions the screens
// call. Nothing is persisted; reloading the page starts over.
export function useSystemStore(user: SystemUser): SystemContextValue {
  const [state, dispatch] = useReducer(systemReducer, undefined, buildSeed);
  const { toasts, notify, dismiss } = useToasts();
  const stamp = (): { at: string; userId: string } => ({
    at: nowIso(),
    userId: user.id,
  });

  return {
    state,
    user,
    toasts,
    notify,
    dismissToast: dismiss,
    registerPayment: (input) => {
      const sequence = nextReceiptSequence(state.receipts);
      dispatch({ type: "registerPayment", sequence, input, ...stamp() });
      return `recibo-${sequence}`;
    },
    addMember: (input) => {
      const memberNumber = nextMemberNumber(state.members);
      dispatch({ type: "addMember", memberNumber, input, ...stamp() });
      return `socio-${memberNumber}`;
    },
    issuePoolPass: (memberId) =>
      dispatch({ type: "issuePoolPass", memberId, ...stamp() }),
    recordMedicalClearance: (memberId, clearance) =>
      dispatch({
        type: "recordMedicalClearance",
        memberId,
        clearance,
        ...stamp(),
      }),
    recordAccess: (log) =>
      dispatch({ type: "recordAccess", log: { ...log, at: nowIso() } }),
    setMemberStatus: (memberId, status) =>
      dispatch({ type: "setMemberStatus", memberId, status, ...stamp() }),
    updateSettings: (settings) =>
      dispatch({ type: "updateSettings", settings, ...stamp() }),
  };
}
