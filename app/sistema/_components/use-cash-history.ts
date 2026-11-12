"use client";

import { PAYMENT_METHOD_LABELS } from "../_data/labels";
import { closingsNewestFirst, differenceLabel, totalOf } from "../_lib/cash";
import { downloadCsv, type CsvCell } from "../_lib/csv";
import { formatDate, formatDateTime } from "../_lib/format";
import { findUserById } from "../_lib/receipts";
import type { CashClosing, PaymentMethod } from "../_types";
import { useSystem } from "./use-system";

export interface ClosingRow {
  closing: CashClosing;
  total: number;
  closedBy: string;
}

interface CashHistory {
  rows: ClosingRow[];
  shortCount: number;
  exportCsv: () => void;
}

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

function csvRows(rows: ClosingRow[]): CsvCell[][] {
  return [
    [
      "Fecha",
      "Total del día",
      ...METHODS.map((method) => `Esperado ${PAYMENT_METHOD_LABELS[method]}`),
      "Efectivo contado",
      "Diferencia",
      "Resultado",
      "Cerró",
      "Cerrada el",
      "Notas",
    ],
    ...rows.map(({ closing, total, closedBy }) => [
      formatDate(closing.date),
      total,
      ...METHODS.map((method) => closing.expected[method]),
      closing.countedCash,
      closing.difference,
      differenceLabel(closing.difference),
      closedBy,
      formatDateTime(closing.closedAt),
      closing.notes ?? "",
    ]),
  ];
}

// Every closing, newest first, and its export to a spreadsheet.
export function useCashHistory(): CashHistory {
  const { state } = useSystem();
  const rows = closingsNewestFirst(state.cashClosings).map((closing) => ({
    closing,
    total: totalOf(closing.expected),
    closedBy: findUserById(closing.closedByUserId)?.name ?? "—",
  }));

  return {
    rows,
    shortCount: rows.filter(({ closing }) => closing.difference !== 0).length,
    exportCsv: () => downloadCsv("cierres-de-caja.csv", csvRows(rows)),
  };
}
