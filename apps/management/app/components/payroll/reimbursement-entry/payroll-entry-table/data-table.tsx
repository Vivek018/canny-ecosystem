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
import { ReimbursementEntrySheet } from "./reimbursement-entry-sheet";
import { useState } from "react";
import type { ReimbursementPayrollEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";

interface ReimbursementEntryTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  editable: boolean;
  type: string;
}

export function ReimbursementEntryDataTable<TData, TValue>({
  columns,
  data,
  editable,
  type,
}: ReimbursementEntryTableProps<TData, TValue>) {
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
              table.getRowModel()?.rows?.map((row) => {
                const rowData = row.original;
                return (
                  <ReimbursementEntrySheet
                    key={row.id}
                    type={type}
                    row={row}
                    rowData={rowData as ReimbursementPayrollEntriesWithEmployee}
                    editable={editable}
                  />
                );
              })
            ) : (
              <TableRow className={cn(!tableLength && "border-none")}>
                <TableCell className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize">
                  No Reimbursement Entry Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
