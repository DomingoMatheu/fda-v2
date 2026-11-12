"use client";

import { useState } from "react";
import { DEMO_TODAY } from "../_lib/clock";
import { periodOf } from "../_lib/period";
import { matchesReceipt, receiptPeriod } from "../_lib/receipts";
import type { Member, Receipt } from "../_types";
import { useSystem } from "./use-system";

// "todos" shows every period.
export const ALL_PERIODS = "todos";

export interface ReceiptRow {
  receipt: Receipt;
  member?: Member;
}

interface Receipts {
  query: string;
  setQuery: (query: string) => void;
  periods: string[];
  period: string;
  setPeriod: (period: string) => void;
  rows: ReceiptRow[];
  total: number;
}

// State of the "Comprobantes" list: search by number or member and a period
// filter, newest receipts first.
export function useReceipts(): Receipts {
  const { state } = useSystem();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(periodOf(DEMO_TODAY));

  const members = new Map(state.members.map((member) => [member.id, member]));
  const periods = [
    ...new Set([periodOf(DEMO_TODAY), ...state.receipts.map(receiptPeriod)]),
  ]
    .sort()
    .reverse();
  const rows = state.receipts
    .filter(
      (receipt) => period === ALL_PERIODS || receiptPeriod(receipt) === period,
    )
    .map((receipt) => ({ receipt, member: members.get(receipt.memberId) }))
    .filter(({ receipt, member }) => matchesReceipt(receipt, member, query))
    .sort((a, b) => b.receipt.issuedAt.localeCompare(a.receipt.issuedAt));

  return {
    query,
    setQuery,
    periods,
    period,
    setPeriod,
    rows,
    total: rows.reduce((sum, { receipt }) => sum + receipt.total, 0),
  };
}
