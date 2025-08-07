import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { type RefObject, useEffect, useState } from "react";

import { SalaryTableHeader } from "./data-table-header";
import type { SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { ExportBar } from "../../export-bar";
import { useSalaryEntriesStore } from "@/store/salary-entries";
import { roundToNearest } from "@canny_ecosystem/utils";
import type { Virtualizer } from "@tanstack/react-virtual";

interface SalaryEntryTableProps<TData, TValue> {
  parentRef: RefObject<HTMLDivElement>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalNet: number;
  uniqueFields: string[];
}

export function SalaryEntryDataTable<TData, TValue>({
  parentRef,
  virtualizer,
  columns,
  data,
  totalNet,
  uniqueFields,
}: SalaryEntryTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { rowSelection, setSelectedRows, setRowSelection } =
    useSalaryEntriesStore();

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting, rowSelection },
  });

  const { rows } = table.getRowModel()

  useEffect(() => {
    const rowArray = [];
    for (const row of table.getSelectedRowModel().rows) {
      rowArray.push(row.original);
    }
    setSelectedRows(rowArray as SalaryEntriesDatabaseRow[]);
  }, [rowSelection]);

  const tableLength = table.getRowModel().rows?.length;

  const selectedRowsData = table
    .getSelectedRowModel()
    .rows?.map((row) => row.original);

  return (
    <div ref={parentRef}  className="relative h-40 border rounded overflow-auto">
      <div
        className={cn(
          "relative overflow-x-auto rounded",
        )}
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <Table>
          <SalaryTableHeader
            table={table}
            className={cn(!tableLength && "hidden")}
            uniqueFields={uniqueFields}
          />
          <TableBody>
            {tableLength ? (
              virtualizer.getVirtualItems().map((virtualRow, index) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    data-state={
                      (row.getIsSelected() &&
                        row.original?.salary_entries?.invoice_id &&
                        "both") ||
                      (row.getIsSelected() && "selected")
                    }
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start - index * virtualRow.size
                        }px)`,
                    }}
                    className={cn(
                      "relative h-[40px] md:h-[45px] cursor-default select-text",
                      row.original?.salary_entries?.invoice_id &&
                      "bg-primary/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-4 hidden md:table-cell",
                            cell.column.id === "select" &&
                            "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                            cell.column.id === "sr_no" &&
                            "sticky left-12 bg-card z-10",
                            cell.column.id === "employee_code" &&
                            "sticky left-32 z-10 bg-card",
                            cell.column.id === "actions" &&
                            "sticky right-0 min-w-20 max-w-20 bg-card z-10",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className={cn(!tableLength && "border-none")}>
                <TableCell className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize">
                  No Salary Entry Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ExportBar
        totalNet={roundToNearest(totalNet)}
        className={cn(!table.getSelectedRowModel().rows.length && "hidden")}
        rows={table.getSelectedRowModel().rows.length}
        data={selectedRowsData as SalaryEntriesDatabaseRow[]}
      />
    </div>
  );
}
