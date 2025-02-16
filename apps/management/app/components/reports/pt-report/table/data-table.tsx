import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect } from "react";
import { useState } from "react";
import { DataTableHeader } from "./data-table-header";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "@remix-run/react";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  type EmployeeFilters,
  type EmployeeReportDataType,
  getEmployeesReportByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { ExportBar } from "../export-bar";
import { useReportsStore } from "@/store/reports";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  hasNextPage: boolean;
  query?: string | null;
  filters?: EmployeeFilters;
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
  const { rowSelection, setRowSelection, setColumns } = useReportsStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  const loadMoreReport = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");

    try {
      const { data } = await getEmployeesReportByCompanyId({
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

      const ptReportData = data?.map((employee: EmployeeReportDataType) => {
        return {
          ...employee,
          pt_amount: 4352,
          start_date: new Date(),
          end_date: new Date(),
        };
      });

      if (data) {
        setData(
          (prevData) => [...prevData, ...(ptReportData ?? [])] as TData[],
        );
      }
      setFrom(to + 1);
      setHasNextPage(count > to);
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
      loadMoreReport();
    }
  }, [inView]);

  useEffect(() => {
    setData(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData]);

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none",
        )}
      >
        <div className="relative">
          <Table>
            <DataTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
            />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="relative h-[40px] md:h-[45px] cursor-default select-text"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-2",
                            (cell.column.id === "select" ||
                              cell.column.id === "employee_code" ||
                              cell.column.id === "employee_name") &&
                              "hidden md:table-cell",
                            cell.column.id === "select" &&
                              "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                            cell.column.id === "employee_code" &&
                              "sticky left-12 bg-card z-10",
                            cell.column.id === "employee_name" &&
                              "sticky left-48 bg-card z-10",
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
                ))
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
          </Table>
        </div>
      </div>

      {hasNextPage && (
        <div className="flex items-center justify-center mt-6" ref={ref}>
          <div className="flex items-center space-x-2 px-6 py-5">
            <Spinner />
            <span className="text-sm text-[#606060]">Loading more...</span>
          </div>
        </div>
      )}
      <ExportBar
        className={cn(!table.getSelectedRowModel().rows.length && "hidden")}
        rows={table.getSelectedRowModel().rows.length}
        data={selectedRowsData as any}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
