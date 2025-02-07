import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AttendanceTableHeader } from "./attendance-table-header";
import { useEffect, useState } from "react";
import type { AttendanceDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { useAttendanceStore } from "@/store/attendance";
import type { AttendanceFilterType } from "@/routes/_protected+/dashboard";
import { ExportBar } from "../export-bar";
import type { TransformedAteendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";
import { useSearchParams } from "@remix-run/react";

interface DataTableProps {
  days: { day: number; fullDate: string };
  columns: any;
  data: TransformedAteendanceDataType[];
  noFilters?: boolean;
  filters?: AttendanceFilterType;
}

export function AttendanceTable({
  days,
  columns,
  data: initialData,
  noFilters,
  filters,
}: DataTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] =
    useState<TransformedAteendanceDataType[]>(initialData);

  const { rowSelection, setSelectedRows, setRowSelection } =
    useAttendanceStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const selectedRowsData = table
    .getSelectedRowModel()
    .rows?.map((row) => row.original);

  useEffect(() => {
    const rowArray = [];
    for (const row of table.getSelectedRowModel().rows) {
      rowArray.push(row.original);
    }
    setSelectedRows(rowArray as unknown as AttendanceDataType[]);
  }, [rowSelection]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none"
        )}
      >
        <div className="relative">
          <Table>
            <AttendanceTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
              days={days}
            />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="relative cursor-default select-text"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-4 hidden md:table-cell",
                            cell.column.id === "select" &&
                              "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                            cell.column.id === "employee_code" &&
                              "sticky left-12 bg-card z-10",
                            cell.column.id === "employee_name" &&
                              "sticky left-[224px] bg-card z-10"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className={cn(!tableLength && "border-none")}>
                  <TableCell
                    colSpan={columns.length}
                    className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <h2 className="text-xl">No Attendance Found.</h2>
                      <p
                        className={cn(
                          "text-muted-foreground",
                          !data?.length && noFilters && "hidden"
                        )}
                      >
                        Try another search, or adjusting the filters
                      </p>
                      <Button
                        variant="outline"
                        className={cn(
                          "mt-4",
                          !data?.length && noFilters && "hidden"
                        )}
                        onClick={() => {
                          setSearchParams();
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ExportBar
        className={cn(!table.getSelectedRowModel().rows.length && "hidden")}
        rows={table.getSelectedRowModel().rows.length}
        data={selectedRowsData as any}
        fMonth={filters?.month}
        fYear={filters?.year}
      />
    </div>
  );
}
