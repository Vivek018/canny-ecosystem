import { cn } from "@canny_ecosystem/ui/utils/cn";
import { TableBody, TableCell, TableRow } from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Row,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ReimbursementsTableHeader } from "./reimbursements-table-header";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from "react";
import {
  getReimbursementsByCompanyId,
  getReimbursementsByEmployeeId,
  type ReimbursementDataType,
  type ReimbursementFilters,
} from "@canny_ecosystem/supabase/queries";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { useSearchParams } from "@remix-run/react";
import { Button } from "@canny_ecosystem/ui/button";
import { useReimbursementStore } from "@/store/reimbursements";
import { ExportBar } from "../import-export/export-bar";
import { useVirtualizer } from "@tanstack/react-virtual";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hasNextPage: boolean;
  pageSize: number;
  env: any;
  companyId?: string;
  employeeId?: string;
  noFilters?: boolean;
  filters?: ReimbursementFilters | null;
  query?: string | null;
  initialColumnVisibility?: VisibilityState;
}

export function ReimbursementsTable<TData, TValue>({
  columns,
  data: initialData,
  hasNextPage: initialHasNextPage,
  pageSize,
  env,
  companyId,
  noFilters,
  employeeId,
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
    useReimbursementStore();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  const loadMoreEmployees = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");
    if (companyId) {
      try {
        const { data, meta } = await getReimbursementsByCompanyId({
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
        setHasNextPage(meta?.count! > to);
      } catch {
        setHasNextPage(false);
      }
    } else if (employeeId) {
      try {
        const { data, meta } = await getReimbursementsByEmployeeId({
          supabase,
          employeeId,
          params: {
            from: from,
            to: to,
            filters,
            sort: sortParam?.split(":") as [string, "asc" | "desc"],
          },
        });
        if (data) {
          setData((prevData) => [...prevData, ...data] as TData[]);
        }
        setFrom(to + 1);
        setHasNextPage(meta?.count! > to);
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
    setSelectedRows(rowArray as ReimbursementDataType[]);
  }, [rowSelection]);

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

  const tableLength = table.getRowModel().rows?.length;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 8,
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
          height: `calc(100vh - ${parentRef.current?.getBoundingClientRect().top ?? 0}px - 16px)`,
          minHeight: "20px",
        }}
      >
        <table className="w-full bg-card shadow text-sm">
          <ReimbursementsTableHeader
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
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    key={row.id}
                    data-state={
                      (row.getIsSelected() &&
                        row.original?.invoice_id &&
                        "both") ||
                      (row.getIsSelected() && "selected")
                    }
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      "absolute flex cursor-default select-text",
                      row.original?.invoice_id && "bg-primary/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-4 min-w-32 max-w-32 hidden md:table-cell",
                            cell.column.id === "select" &&
                              "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                            cell.column.id === "employee_code" &&
                              "sticky left-12 min-w-32 max-w-32 bg-card z-10",
                            cell.column.id === "employee_name" &&
                              "sticky left-44 min-w-48 max-w-48 bg-card z-10",
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
                <TableCell
                  colSpan={columns.length}
                  className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize"
                >
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl">No Reimbursments Found.</h2>
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
            className="sticky left-0 flex items-center justify-center mt-6"
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
        data={selectedRowsData as ReimbursementDataType[]}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
