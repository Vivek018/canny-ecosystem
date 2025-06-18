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
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { IncidentsTableHeader } from "./incidents-table-header";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import {
  type IncidentFilters,
  getIncidentsByCompanyId,
  type IncidentsDatabaseType,
} from "@canny_ecosystem/supabase/queries";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { useSearchParams } from "@remix-run/react";
import { Button } from "@canny_ecosystem/ui/button";
import { useIncidentStore } from "@/store/incidents";
import { ExportBar } from "../export-bar";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hasNextPage: boolean;
  count: number;
  pageSize: number;
  env: SupabaseEnv;
  companyId?: string;
  employeeId?: string;
  noFilters?: boolean;
  filters?: IncidentFilters | null;
  query?: string | null;
  initialColumnVisibility?: VisibilityState;
}

export function IncidentsTable<TData, TValue>({
  columns,
  data: initialData,
  hasNextPage: initialHasNextPage,
  count,
  pageSize,
  env,
  companyId,
  noFilters,
  filters,
  initialColumnVisibility,
  query,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [from, setFrom] = useState(pageSize);
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const { supabase } = useSupabase({ env });

  const { ref, inView } = useInView();
  const { rowSelection, setSelectedRows, setRowSelection, setColumns } =
    useIncidentStore();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );
  const loadMoreIncidents = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");
    if (companyId) {
      try {
        const { data, meta } = await getIncidentsByCompanyId({
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
    const rowArray = [];
    for (const row of table.getSelectedRowModel().rows) {
      rowArray.push(row.original);
    }
    setSelectedRows(rowArray as IncidentsDatabaseType[]);
  }, [rowSelection]);

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility]);

  useEffect(() => {
    if (inView) {
      loadMoreIncidents();
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
          !tableLength && "border-none"
        )}
      >
        <div className="relative">
          <Table>
            <IncidentsTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
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
                            "sticky left-48 bg-card z-10",
                            cell.column.id === "actions" &&
                            "sticky right-0 min-w-20 max-w-20 bg-card z-10"
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
                      <h2 className="text-xl">No Incidents Found.</h2>
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
        data={selectedRowsData as IncidentsDatabaseType[]}
      />
    </div>
  );
}
