"use client";

import { useState } from "react";
import { feeState } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import {
  billingPeriods,
  debtors,
  feesOfPeriod,
  periodSummary,
  type Debtor,
  type PeriodSummary,
} from "../_lib/collections";
import { listName } from "../_lib/format";
import { periodOf } from "../_lib/period";
import { can } from "../_lib/permissions";
import type { Fee, FeeState, Member, Payment, Receipt } from "../_types";
import type { TabItem } from "./tabs";
import { useSystem } from "./use-system";

export type CollectionsTab = "pendientes" | "cobradas" | "morosos";

export interface PendingFeeRow {
  fee: Fee;
  member?: Member;
  state: FeeState;
}

export interface PaidFeeRow {
  fee: Fee;
  member?: Member;
  payment?: Payment;
}

// Who the open "Registrar cobro" modal is for; no member starts with a search.
interface ChargeTarget {
  memberId?: string;
}

interface Collections {
  periods: string[];
  period: string;
  setPeriod: (period: string) => void;
  summary: PeriodSummary;
  overdueCount: number;
  tabs: TabItem<CollectionsTab>[];
  tab: CollectionsTab;
  setTab: (tab: CollectionsTab) => void;
  pendingRows: PendingFeeRow[];
  paidRows: PaidFeeRow[];
  debtorRows: Debtor[];
  canCharge: boolean;
  charge?: ChargeTarget;
  openCharge: (memberId?: string) => void;
  closeCharge: () => void;
  onRegistered: (receiptId: string) => void;
  lastReceipt?: Receipt;
  dismissLastReceipt: () => void;
}

function byMemberName(a?: Member, b?: Member): number {
  return (a ? listName(a) : "").localeCompare(b ? listName(b) : "");
}

// State of the "Cobranza" screen: the period picked, its numbers and the
// three lists. Everything is derived from the store, so a payment updates it.
export function useCollections(): Collections {
  const { state, user } = useSystem();
  const [period, setPeriod] = useState(periodOf(DEMO_TODAY));
  const [tab, setTab] = useState<CollectionsTab>("pendientes");
  const [charge, setCharge] = useState<ChargeTarget>();
  const [lastReceiptId, setLastReceiptId] = useState<string>();

  const members = new Map(state.members.map((member) => [member.id, member]));
  const payments = new Map(
    state.payments.map((payment) => [payment.id, payment]),
  );
  const fees = feesOfPeriod(state.fees, period);

  const pendingRows = fees
    .filter(({ status }) => status === "pendiente")
    .map((fee) => ({
      fee,
      member: members.get(fee.memberId),
      state: feeState(fee, DEMO_TODAY),
    }))
    .sort((a, b) => byMemberName(a.member, b.member));
  const paidRows = fees
    .filter(({ status }) => status === "paga")
    .map((fee) => ({
      fee,
      member: members.get(fee.memberId),
      payment: fee.paymentId ? payments.get(fee.paymentId) : undefined,
    }))
    .sort((a, b) =>
      (b.payment?.paidAt ?? "").localeCompare(a.payment?.paidAt ?? ""),
    );
  const debtorRows = debtors(state, DEMO_TODAY);

  return {
    periods: billingPeriods(state.fees, periodOf(DEMO_TODAY)),
    period,
    setPeriod,
    summary: periodSummary(fees),
    overdueCount: pendingRows.filter((row) => row.state === "vencida").length,
    tabs: [
      { key: "pendientes", label: "Pendientes", count: pendingRows.length },
      { key: "cobradas", label: "Cobradas", count: paidRows.length },
      { key: "morosos", label: "Morosos", count: debtorRows.length },
    ],
    tab,
    setTab,
    pendingRows,
    paidRows,
    debtorRows,
    canCharge: can(user, "billing:write"),
    charge,
    openCharge: (memberId) => setCharge({ memberId }),
    closeCharge: () => setCharge(undefined),
    onRegistered: setLastReceiptId,
    lastReceipt: state.receipts.find(({ id }) => id === lastReceiptId),
    dismissLastReceipt: () => setLastReceiptId(undefined),
  };
}
