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
import { ExitPaymentTableHeader } from "./data-table-header";
import { ExitPaymentsSheet } from "@/components/exits/exit-payments-sheet";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import {
  type ExitDataType,
  type ExitFilterType,
  getExitsBySiteIds,
} from "@canny_ecosystem/supabase/queries";
import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useInView } from "react-intersection-observer";
import { useExitsStore } from "@/store/exits";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { useSearchParams } from "@remix-run/react";
import { Button } from "@canny_ecosystem/ui/button";
import { ExportBar } from "../import-export/export-bar";
import { useVirtualizer } from "@tanstack/react-virtual";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  query?: string | null;
  filters?: ExitFilterType;
  noFilters?: boolean;
  hasNextPage: boolean;
  pageSize: number;
  initialColumnVisibility?: VisibilityState;
  env: SupabaseEnv;
  siteIdsArray: string[];
}

export function ExitPaymentTable<TData, TValue>({
  data: initialData,
  columns,
  count,
  query,
  filters,
  noFilters,
  hasNextPage: initialHasNextPage,
  pageSize,
  initialColumnVisibility,
  siteIdsArray,
  env,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);

  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [searchParams, setSearchParams] = useSearchParams();
  const { supabase } = useSupabase({ env });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState<any>(null);

  const { ref, inView } = useInView();
  const { rowSelection, setSelectedRows, setRowSelection, setColumns } =
    useExitsStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );

  const loadMoreExit = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");
    try {
      const { data } = await getExitsBySiteIds({
        supabase,
        siteIds: siteIdsArray ?? [],
        params: {
          from: from,
          to: to,
          filters,
          searchQuery: query ?? undefined,
          sort: sortParam?.split(":") as [string, "asc" | "desc"],
        },
      });
      if (data) setData((prevData) => [...prevData, ...data] as TData[]);
      setFrom(to + 1);
      setHasNextPage(count > to);
    } catch {
      setHasNextPage(false);
    }
  };

  const handleRowClick = (rowData: any) => {
    setSheetData(rowData);
    setSheetOpen(true);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: { rowSelection, columnVisibility },
  });

  const { rows } = table.getRowModel();

  useEffect(() => {
    const rowArray = [];
    for (const row of table.getSelectedRowModel().rows)
      rowArray.push(row.original);
    setSelectedRows(rowArray as ExitDataType[]);
  }, [rowSelection]);

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility]);

  useEffect(() => {
    if (inView) loadMoreExit();
  }, [inView]);

  useEffect(() => {
    setData(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData]);

  const tableLength = table.getRowModel().rows?.length;

  const selectedRowsData = table
    .getSelectedRowModel()
    .rows?.map((row) => row.original);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 8, //here
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
        !tableLength && "border-none"
      )}
    >
      <div
        ref={parentRef}
        className="relative rounded overflow-auto"
        style={{
          maxHeight: `calc(100vh - ${parentRef.current?.getBoundingClientRect().top ?? 0}px - 16px)`,
          minHeight: "20px",
        }}
      >
        <table className="w-full bg-card shadow text-sm">
          <ExitPaymentTableHeader
            table={table}
            className={cn("sticky z-10 top-0", !tableLength && "hidden")}
          />
          <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
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
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                    className={cn(
                      "absolute flex cursor-pointer select-text",
                      row.original?.invoice_id && "bg-primary/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4 py-2 hidden md:table-cell min-w-36 max-w-36",
                          cell.column.id === "select" &&
                            "sticky left-0 min-w-12 max-w-12 bg-card z-10 table-cell",
                          cell.column.id === "employee_code" && "table-cell",
                          cell.column.id === "employee_name" &&
                            "min-w-40 max-w-40",
                          cell.column.id === "final_settlement_date" &&
                            " min-w-48 max-w-48"
                        )}
                        onClick={(e) => {
                          if (
                            cell.column.id === "select" ||
                            cell.column.id === "actions"
                          ) {
                            e.stopPropagation();
                            return;
                          }
                          handleRowClick(row.original);
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
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
                    <h2 className="text-xl">No Exits Found.</h2>
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

      <ExitPaymentsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        rowData={sheetData}
      />

      <ExportBar
        className={cn(!table.getSelectedRowModel().rows.length && "hidden")}
        rows={table.getSelectedRowModel().rows.length}
        data={selectedRowsData as ExitDataType[]}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
