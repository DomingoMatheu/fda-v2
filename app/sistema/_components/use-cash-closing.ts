"use client";

import { useState, type FormEvent } from "react";
import {
  BILL_DENOMINATIONS,
  billsTotal,
  cashDifference,
  parseAmount,
} from "../_lib/cash";
import { formatDate } from "../_lib/format";
import type { AmountsByMethod, CashClosing } from "../_types";
import { useSystem } from "./use-system";

interface CashClosingForm {
  countBills: boolean;
  setCountBills: (countBills: boolean) => void;
  counted: string;
  setCounted: (counted: string) => void;
  bills: Record<number, string>;
  setBill: (bill: number, count: string) => void;
  billsCount: (bill: number) => number;
  notes: string;
  setNotes: (notes: string) => void;
  countedCash: number;
  difference: number;
  hasCount: boolean;
  error?: string;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

// State of "Cerrar caja": the cash counted in the drawer, typed as a total or
// bill by bill, and its difference with the expected cash, updated live.
// Closing a day again starts from the previous count.
export function useCashClosing(
  day: string,
  expected: AmountsByMethod,
  previous: CashClosing | undefined,
  onDone: () => void,
): CashClosingForm {
  const { closeCash, notify } = useSystem();
  const [countBills, setCountBills] = useState(false);
  const [counted, setCounted] = useState(
    previous ? String(previous.countedCash) : "",
  );
  const [bills, setBills] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState(previous?.notes ?? "");
  const [error, setError] = useState<string>();

  const billsCount = (bill: number): number => parseAmount(bills[bill] ?? "");
  const countedCash = countBills
    ? billsTotal(
        Object.fromEntries(
          BILL_DENOMINATIONS.map((bill) => [bill, billsCount(bill)]),
        ),
      )
    : parseAmount(counted);
  const hasCount = countBills
    ? BILL_DENOMINATIONS.some((bill) => (bills[bill] ?? "") !== "")
    : counted.trim() !== "";
  const difference = cashDifference(countedCash, expected.efectivo);

  return {
    countBills,
    setCountBills,
    counted,
    setCounted,
    bills,
    setBill: (bill, count) => setBills({ ...bills, [bill]: count }),
    billsCount,
    notes,
    setNotes,
    countedCash,
    difference,
    hasCount,
    error,
    submit: (event) => {
      event.preventDefault();
      if (!hasCount) {
        setError("Cargá el efectivo que contaste en la caja.");
        return;
      }
      closeCash({
        date: day,
        expected,
        countedCash,
        difference,
        notes: notes.trim() || undefined,
      });
      notify(
        difference === 0
          ? `Caja del ${formatDate(day)} cerrada sin diferencias.`
          : `Caja del ${formatDate(day)} cerrada con diferencia.`,
        difference === 0 ? "success" : "info",
      );
      onDone();
    },
  };
}
