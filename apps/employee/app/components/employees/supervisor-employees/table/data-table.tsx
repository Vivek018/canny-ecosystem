import { cn } from "@canny_ecosystem/ui/utils/cn";
import { TableBody, TableCell, TableRow } from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  type Row,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { DataTableHeader } from "./data-table-header";
import { useEmployeesStore } from "@/store/employees";
import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ExportBar } from "../../export-bar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialColumnVisibility?: VisibilityState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const { rowSelection, setRowSelection, setColumns, setSelectedRows } =
    useEmployeesStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      columnVisibility,
    },
  });

  const selectedRowsData = table
    .getSelectedRowModel()
    .rows?.map((row) => row.original);

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility]);

  const { rows } = table.getRowModel();

  useEffect(() => {
    const rowArray = [];
    for (const row of table.getSelectedRowModel().rows) {
      rowArray.push(row.original);
    }
    setSelectedRows(rowArray as unknown as EmployeeDataType[]);
  }, [rowSelection]);

  const tableLength = table.getRowModel().rows?.length;
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 12,
    getScrollElement: () => parentRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 1,
  });

  return (
    <div
      className={cn(
        "border rounded max-h-fit overflow-hidden max-sm:border-x-0",
        !tableLength && "border-none",
      )}
    >
      <div
        ref={parentRef}
        className={cn("relative rounded overflow-auto max-sm:rounded-none")}
        style={{
          maxHeight: `calc(100vh - ${parentRef.current?.getBoundingClientRect().top ?? 0}px - 16px)`,
          minHeight: "20px",
          overflowX: "auto",
        }}
      >
        <table className="w-full bg-card shadow text-sm">
          <DataTableHeader
            table={table}
            className={cn("sticky z-10 top-0", !tableLength && "hidden")}
          />
          <TableBody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {tableLength ? (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<any>;
                return (
                  <TableRow
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    data-state={row.getIsSelected() && "selected"}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      "absolute flex cursor-default select-text",
                      row.original?.salary_entries?.invoice_id &&
                        "bg-primary/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-4 py-2 min-w-36 max-36",
                            cell.column.id === "select" &&
                              "sticky left-0 min-w-12 max-w-12 bg-card z-10 table-cell",
                            cell.column.id === "employee_code" && "table-cell",
                            cell.column.id === "full_name" &&
                              "min-w-56 max-w-56 table-cell",
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
                <TableCell
                  colSpan={columns.length}
                  className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize"
                >
                  No Employees Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <ExportBar
        className={cn(!table.getSelectedRowModel().rows.length && "hidden")}
        rows={table.getSelectedRowModel().rows.length}
        data={selectedRowsData as EmployeeDataType[]}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
