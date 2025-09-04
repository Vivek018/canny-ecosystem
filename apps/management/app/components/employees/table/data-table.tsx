import { cn } from "@canny_ecosystem/ui/utils/cn";
import { TableBody, TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { Spinner } from "@canny_ecosystem/ui/spinner";
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
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "@remix-run/react";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  type EmployeeDataType,
  type EmployeeFilters,
  getEmployeesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { ExportBar } from "@/components/employees/import-export/export-bar";
import { useVirtualizer } from "@tanstack/react-virtual";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  hasNextPage: boolean;
  query?: string | null;
  filters?: EmployeeFilters | null;
  noFilters?: boolean;
  pageSize: number;
  initialColumnVisibility?: VisibilityState;
  companyId: string;
  env: SupabaseEnv;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  count,
  query,
  filters,
  noFilters,
  pageSize,
  hasNextPage: initialHasNextPage,
  initialColumnVisibility,
  companyId,
  env,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [searchParams, setSearchParams] = useSearchParams();
  const { supabase } = useSupabase({ env });

  const { ref, inView } = useInView();
  const { rowSelection, setRowSelection, setColumns, setSelectedRows } =
    useEmployeesStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  const loadMoreEmployees = async () => {
    const formattedFrom = from;

    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");

    try {
      const { data, meta } = await getEmployeesByCompanyId({
        supabase,
        companyId,
        params: {
          from: from,
          to: to,
          filters,
          searchQuery: query ?? undefined,
          sort: sortParam?.split(":") as [string, "asc" | "desc"],
        },
      });
      if (data) {
        setData((prevData) => [...prevData, ...data] as TData[]);
      }
      setFrom(to + 1);
      setHasNextPage((meta?.count ?? count) > to);
    } catch {
      setHasNextPage(false);
    }
  };

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

  useEffect(() => {
    if (inView) {
      loadMoreEmployees();
    }
  }, [inView]);
  const { rows } = table.getRowModel();

  useEffect(() => {
    setData(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData]);

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
        "border rounded max-h-fit overflow-hidden",
        !tableLength && "border-none",
      )}
    >
      <div
        ref={parentRef}
        className={cn("relative rounded overflow-auto")}
        style={{
          maxHeight: `calc(100dvh - ${parentRef.current?.getBoundingClientRect().top ?? 0}px - 16px)`,
          minHeight: "20px",
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
                            "px-3 md:px-4 py-2 min-w-32 max-w-32",
                            (cell.column.id === "select" ||
                              cell.column.id === "employee_code" ||
                              cell.column.id === "first_name" ||
                              cell.column.id === "primary_mobile_number" ||
                              cell.column.id === "date_of_birth" ||
                              cell.column.id === "education" ||
                              cell.column.id === "gender" ||
                              cell.column.id === "is_active") &&
                              "hidden md:table-cell",
                            (cell.column.id.endsWith("name") ||
                              cell.column.id.endsWith("number")) &&
                              "min-w-48 max-w-48",
                            cell.column.id === "select" &&
                              "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                            cell.column.id === "employee_code" &&
                              "sticky left-12 bg-card z-10 min-w-36 max-w-36",
                            cell.column.id === "first_name" &&
                              "sticky left-48 bg-card z-10 min-w-52 max-w-52",
                            cell.column.id === "bank_name" &&
                              "min-w-72 max-w-72",
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
              <TableRow
                className={cn("flex flex-col", !tableLength && "border-none")}
              >
                <TableCell
                  colSpan={columns.length}
                  className={cn(
                    "h-96 bg-background grid place-items-center text-center tracking-wide",
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl">No employees found.</h2>
                    <p
                      className={cn(
                        "text-muted-foreground",
                        !data?.length && noFilters && "hidden",
                      )}
                    >
                      Try another search, or adjusting the filters
                    </p>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-4",
                        !data?.length && noFilters && "hidden",
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
        </table>
        {hasNextPage && initialData?.length && (
          <div
            className="sticky left-0 min-w-max flex items-center justify-center mt-6"
            ref={ref}
          >
            <div className="flex items-center space-x-2 px-6 py-5">
              <Spinner />
              <span className="text-sm text-[#606060]">Loading more...</span>
            </div>
          </div>
        )}
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
