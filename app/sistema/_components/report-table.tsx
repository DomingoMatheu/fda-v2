import { formatReportCell, type ReportTable } from "../_lib/reports";

interface ReportTableViewProps {
  title: string;
  table: ReportTable;
}

// The numbers behind a chart, folded under it.
export function ReportTableView({ title, table }: ReportTableViewProps) {
  const cellClass = (index: number): string | undefined =>
    table.columns[index].kind === "text" ? undefined : "is-end";
  return (
    <details className="sys-report__data">
      <summary>Ver los datos en una tabla</summary>
      <div className="sys-table-wrap">
        <table className="sys-table">
          <caption className="sys-visually-hidden">{title}</caption>
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cellClass(index)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={String(row[0])}>
                {row.map((cell, index) => (
                  <td
                    key={table.columns[index].header}
                    className={cellClass(index)}
                  >
                    {formatReportCell(cell, table.columns[index].kind)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {table.totals && (
            <tfoot>
              <tr className="sys-report__totals">
                {table.totals.map((cell, index) => (
                  <td
                    key={table.columns[index].header}
                    className={cellClass(index)}
                  >
                    {formatReportCell(cell, table.columns[index].kind)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </details>
  );
}
