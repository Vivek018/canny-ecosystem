import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Table, TableBody, TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PayrollTableHeader } from "./data-table-headers";
import { PayrollSheet } from "../payroll-sheet";

interface PayrollTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  editable:boolean;
}

export function PayrollDataTable<TData, TValue>({ columns, data, editable }: PayrollTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none"
        )}
      >
        <Table>
          <PayrollTableHeader
            table={table}
            className={cn(!tableLength && "hidden")}
          />
          <TableBody>
            {tableLength ? (
              table.getRowModel().rows.map((row) => {
                const rowData = row.original;
                return <PayrollSheet key={row.id} row={row} rowData={rowData} editable={editable}/>
              })
            ) : (
              <TableRow className={cn(!tableLength && "border-none")}>
                <TableCell
                  colSpan={columns.length}
                  className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize"
                >
                  No User Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
