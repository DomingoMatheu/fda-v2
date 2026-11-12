// CSV files that Excel in Spanish opens straight away: ";" as separator,
// decimal comma and a UTF-8 BOM so accents come out right.

export type CsvCell = string | number;

const SEPARATOR = ";";
const BOM = "﻿";
const REVOKE_DELAY_MS = 1000;

function csvCell(cell: CsvCell): string {
  const text = typeof cell === "number" ? String(cell).replace(".", ",") : cell;
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: CsvCell[][]): string {
  return BOM + rows.map((row) => row.map(csvCell).join(SEPARATOR)).join("\r\n");
}

// Browser only: call it from an event handler, never while rendering.
export function downloadCsv(fileName: string, rows: CsvCell[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
