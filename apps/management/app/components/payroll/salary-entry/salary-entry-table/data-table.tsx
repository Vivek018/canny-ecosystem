import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

import { SalaryTableHeader } from "./data-table-header";
import type { SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { ExportBar } from "../../export-bar";
import { useSalaryEntriesStore } from "@/store/salary-entries";
import { roundToNearest } from "@canny_ecosystem/utils";

import {
  useVirtualizer,
} from '@tanstack/react-virtual'

interface SalaryEntryTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalNet: number;
  uniqueFields: string[];
}

export function SalaryEntryDataTable<TData, TValue>({
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

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 7,
    getScrollElement: () => parentRef.current,
    measureElement:
      typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 1,
  })

  return (
    <div className={cn("border rounded max-h-fit overflow-auto", !tableLength && "border-none")}>
      <div
        ref={parentRef}
        className={cn(
          "relative rounded overflow-auto",
        )}
        style={{
          height: `calc(100vh - ${parentRef.current?.getBoundingClientRect().top ?? 0}px - 16px)`,
          minHeight: "40px",
        }}
      >
        <table className="w-full bg-card shadow text-sm">
          <SalaryTableHeader
            table={table}
            className={cn("sticky z-10 top-0", !tableLength && "hidden")}
            uniqueFields={uniqueFields}
          />
          <TableBody style={{
            height: `${rowVirtualizer.getTotalSize()}px`
          }}>
            {tableLength ? (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<any>;
                return (
                  <TableRow
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={node => rowVirtualizer.measureElement(node)}
                    data-state={
                      (row.getIsSelected() &&
                        row.original?.salary_entries?.invoice_id &&
                        "both") ||
                      (row.getIsSelected() && "selected")
                    }
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      "absolute flex cursor-default select-text",
                      row.original?.salary_entries?.invoice_id &&
                      "bg-primary/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-2 hidden md:flex items-center min-w-24 max-w-24",
                            cell.column.id === "select" &&
                            "sticky left-0 min-w-12 max-w-12 bg-card z-10 pb-3",
                            cell.column.id === "sr_no" &&
                            "sticky left-12 bg-card min-w-20 max-w-20 z-10",
                            cell.column.id === "employee_code" &&
                            "sticky left-32 z-10 min-w-36 max-w-36 bg-card",
                            cell.column.id === "name" &&
                            "min-w-52 max-w-52",
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
        </table>
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
