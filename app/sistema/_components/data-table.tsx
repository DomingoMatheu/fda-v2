"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export interface Column<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  align?: "start" | "end";
  // Hidden on narrow screens to keep the table readable on a phone.
  hideOnMobile?: boolean;
}

interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  // When set, the whole row opens this page.
  rowHref?: (row: Row) => string;
  empty?: string;
  caption?: string;
}

function cellClass(column: Column<unknown>): string {
  return [
    column.align === "end" ? "is-end" : "",
    column.hideOnMobile ? "is-hidden-mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// Dense, scrollable table for the system's lists.
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  rowHref,
  empty = "No hay resultados.",
  caption,
}: DataTableProps<Row>) {
  const router = useRouter();
  return (
    <div className="sys-table-wrap">
      <table className="sys-table">
        {caption && (
          <caption className="sys-visually-hidden">{caption}</caption>
        )}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cellClass(column as Column<unknown>)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="sys-table__empty">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={rowHref ? "is-clickable" : undefined}
                onClick={rowHref ? () => router.push(rowHref(row)) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cellClass(column as Column<unknown>)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
