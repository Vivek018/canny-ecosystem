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
import { useEffect, useMemo, useState } from "react";
import { Button } from "@canny_ecosystem/ui/button";
import { useAttendanceStore } from "@/store/attendance";
import { ExportBar } from "../export-bar";
import type {
  DayType,
  TransformedAttendanceDataType,
} from "@/routes/_protected+/time-tracking+/attendance+/_index";
import { useSearchParams } from "@remix-run/react";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useInView } from "react-intersection-observer";
import { getAttendanceByCompanyId } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { formatDate } from "@canny_ecosystem/utils";

interface DataTableProps {
  days: DayType[];
  columns: any;
  data: TransformedAttendanceDataType[];
  noFilters?: boolean;
  hasNextPage: boolean;
  count: number;
  pageSize: number;
  filters?: any;
  companyId: string;
  env: SupabaseEnv;
  query?: string | null;
}

export function AttendanceTable({
  days,
  columns,
  data: initialData,
  hasNextPage: initialHasNextPage,
  noFilters,
  pageSize,
  filters,
  count,
  query,
  env,
  companyId,
}: DataTableProps) {
  const {
    rowSelection,
    setSelectedRows,
    setRowSelection,
    setColumns,
    columnVisibility,
    setColumnVisibility,
  } = useAttendanceStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] =
    useState<TransformedAttendanceDataType[]>(initialData);
  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const { supabase } = useSupabase({ env });

  const { ref, inView } = useInView();

  const transformAttendanceData = useMemo(() => {
    return (data: any[]) => {
      const groupedByEmployeeAndMonth = data.reduce((acc, employee) => {
        const empCode = employee.employee_code;
        const employeeDetails = {
          employee_id: employee.id,
          employee_code: empCode,
          employee_name: `${employee.first_name ?? ""} ${employee.middle_name ?? ""} ${employee.last_name ?? ""}`,
          project:
            employee.employee_project_assignment?.project_sites?.projects
              ?.name || null,
          project_site:
            employee.employee_project_assignment?.project_sites?.name || null,
        };

        if (!employee?.attendance?.length) {
          acc[empCode] = acc[empCode] || employeeDetails;
          return acc;
        }

        for (const record of employee?.attendance ?? []) {
          const date = new Date(record.date);
          const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
          const key = `${empCode}-${monthYear}`;

          if (!acc[key]) {
            acc[key] = { ...employeeDetails };
          }

          const fullDate = formatDate(date.toISOString().split("T")[0]);
          acc[key][fullDate!] = record.present
            ? "P"
            : record.holiday
            ? record.holiday_type === "weekly"
              ? "(WOF)"
              : record.holiday_type === "paid"
              ? "L"
              : "A"
            : "A";
        }

        return acc;
      }, {});

      return Object.values(groupedByEmployeeAndMonth);
    };
  }, [days]);

  const loadMoreEmployees = async () => {
    if (data.length >= count) {
      setHasNextPage(false);
      return;
    }
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");

    try {
      const { data: newData } = await getAttendanceByCompanyId({
        supabase,
        companyId,
        params: {
          from: formattedFrom,
          to: to,
          filters,
          searchQuery: query ?? undefined,
          sort: sortParam?.split(":") as [string, "asc" | "desc"],
        },
      });

      if (newData && newData.length > 0) {
        const transformedData = transformAttendanceData(newData);
        setData(
          (prevData) =>
            [...prevData, ...transformedData] as TransformedAttendanceDataType[]
        );
        setFrom(to + 1);
        setHasNextPage(count > to);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Error loading more employees:", error);
      setHasNextPage(false);
    }
  };

  useEffect(() => {
    setData(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData, initialHasNextPage, pageSize]);

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility, days]);

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

  useEffect(() => {
    if (inView) {
      loadMoreEmployees();
    }
  }, [inView]);

  const selectedRowsData = table
    .getSelectedRowModel()
    .rows?.map((row) => row.original);

  useEffect(() => {
    const rowArray = [];
    for (const row of table.getSelectedRowModel().rows) {
      rowArray.push(row.original);
    }
    setSelectedRows(rowArray as unknown as TransformedAttendanceDataType[]);
  }, [rowSelection]);

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
                              "sticky left-48 bg-card z-10"
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
      {hasNextPage && initialData?.length && (
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
        data={selectedRowsData}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
