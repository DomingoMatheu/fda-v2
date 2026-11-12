"use client";

import { findMember } from "../_lib/members";
import { findUserById } from "../_lib/receipts";
import type { Member, Receipt, SystemUser } from "../_types";
import { useSystem } from "./use-system";

interface ReceiptDetail {
  receipt?: Receipt;
  member?: Member;
  registeredBy?: SystemUser;
  print: () => void;
}

// One receipt with its member and the user who registered the payment.
export function useReceipt(receiptId: string): ReceiptDetail {
  const { state } = useSystem();
  const receipt = state.receipts.find(({ id }) => id === receiptId);
  const payment = state.payments.find(({ id }) => id === receipt?.paymentId);
  return {
    receipt,
    member: receipt && findMember(state.members, receipt.memberId),
    registeredBy: payment && findUserById(payment.registeredByUserId),
    print: () => window.print(),
  };
}
