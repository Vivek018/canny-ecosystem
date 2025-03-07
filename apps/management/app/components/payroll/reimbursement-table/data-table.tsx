import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { PayrollTableHeader } from "./data-table-header";
import { PayrollSheet } from "./reimbursement-payroll-sheet";
import { useState } from "react";

interface PayrollTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  editable: boolean;
}

export function PayrollDataTable<TData, TValue>({
  columns,
  data,
  editable,
}: PayrollTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none",
        )}
      >
        <Table>
          <PayrollTableHeader
            table={table}
            className={cn(!tableLength && "hidden")}
          />
          <TableBody>
            {tableLength ? (
              table.getRowModel()?.rows?.map((row) => {
                const rowData = row.original;
                return (
                  <PayrollSheet
                    key={row.id}
                    row={row}
                    rowData={rowData}
                    editable={editable}
                  />
                );
              })
            ) : (
              <TableRow className={cn(!tableLength && "border-none")}>
                <TableCell className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize">
                  No Reimbursement Payroll Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
