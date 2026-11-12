"use client";

import { useReducer } from "react";
import { buildSeed } from "../_data/seed";
import { nextReceiptSequence } from "../_lib/billing";
import { DEMO_TODAY, nowIso } from "../_lib/clock";
import { canEmailNotice } from "../_lib/debt-notice";
import { clearDemoState } from "../_lib/demo-storage";
import {
  nextBookingId,
  nextIncomeId,
  nextMemberNumber,
  systemReducer,
} from "../_lib/system-reducer";
import type { SystemUser } from "../_types";
import type { SystemContextValue } from "./system-context";
import { useDemoPersistence } from "./use-demo-persistence";
import { useToasts } from "./use-toasts";

// The demo's store: seeded mock data plus the actions the screens call. It is
// saved in the visitor's browser, and "Reiniciar demo" goes back to the seed.
export function useSystemStore(user: SystemUser): SystemContextValue {
  const [state, dispatch] = useReducer(systemReducer, undefined, buildSeed);
  useDemoPersistence(state, dispatch);
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
    sendDebtNotices: (memberIds) => {
      const sent = state.members.filter(
        (member) =>
          memberIds.includes(member.id) &&
          canEmailNotice(member, state, DEMO_TODAY),
      ).length;
      dispatch({ type: "sendDebtNotices", memberIds, ...stamp() });
      return sent;
    },
    createBooking: (input) => {
      dispatch({ type: "createBooking", input, ...stamp() });
      return nextBookingId(state);
    },
    updateBooking: (bookingId, changes) =>
      dispatch({ type: "updateBooking", bookingId, changes, ...stamp() }),
    registerIncome: (input) => {
      dispatch({ type: "registerIncome", input, ...stamp() });
      return nextIncomeId(state);
    },
    closeCash: (input) => dispatch({ type: "closeCash", input, ...stamp() }),
    updateMember: (memberId, changes) =>
      dispatch({ type: "updateMember", memberId, changes, ...stamp() }),
    resetDemo: () => {
      clearDemoState();
      dispatch({ type: "replaceState", state: buildSeed() });
      notify("La demo volvió a los datos de prueba iniciales.", "info");
    },
    updateSettings: (settings) =>
      dispatch({ type: "updateSettings", settings, ...stamp() }),
  };
}
