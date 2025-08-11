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
import { DataTableHeader } from "./data-table-header";
import {
  getInvoicesByCompanyId,
  type InvoiceDataType,
  type InvoiceFilters,
} from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useInView } from "react-intersection-observer";
import { useInvoiceStore } from "@/store/invoices";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { Button } from "@canny_ecosystem/ui/button";
import { useSearchParams } from "@remix-run/react";
import { ExportBar } from "../export-bar";
import { useVirtualizer } from "@tanstack/react-virtual";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  hasNextPage: boolean;
  query?: string | null;
  filters?: InvoiceFilters | null;
  noFilters?: boolean;
  pageSize: number;
  companyId: string;
  env: SupabaseEnv;
  initialColumnVisibility?: VisibilityState;
}

export function InvoiceTable<TData, TValue>({
  columns,
  data: initialData,
  companyId,
  count,
  env,
  hasNextPage: initialHasNextPage,
  pageSize,
  filters,
  noFilters,
  initialColumnVisibility,
  query,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const { supabase } = useSupabase({ env });
  const [, setSearchParams] = useSearchParams();

  const { ref, inView } = useInView();
  const { rowSelection, setRowSelection, setSelectedRows, setColumns } =
    useInvoiceStore();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );
  const loadMoreInvoices = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;

    try {
      const { data } = await getInvoicesByCompanyId({
        supabase,
        companyId,
        params: {
          from: from,
          to: to,
          filters,
          searchQuery: query ?? undefined,
        },
      });
      if (data) {
        setData((prevData) => [...prevData, ...data] as TData[]);
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
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      columnVisibility,
    },
  });

  useEffect(() => {
    if (inView) {
      loadMoreInvoices();
    }
  }, [inView]);

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility]);

  const selectedRowsData = table
    .getSelectedRowModel()
    .rows?.map((row) => row.original);

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
    setSelectedRows(rowArray as unknown as InvoiceDataType[]);
  }, [rowSelection]);
  const { rows } = table.getRowModel();

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
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      "absolute flex cursor-default select-text",
                      row.original?.invoice_id && "bg-primary/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-4 hidden md:table-cell min-w-32 max-w-32",
                            cell.column.id === "select" &&
                              "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                            cell.column.id === "invoice_number" &&
                              "sticky left-12 bg-card z-10 min-w-36 max-w-36",
                            cell.column.id === "subject" && "min-w-56 max-w-56",
                            cell.column.id === "service_charge" &&
                              "min-w-56 max-w-56",
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
                    <h2 className="text-xl">No Invoices found.</h2>
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
            className="sticky  left-0 flex items-center justify-center mt-6"
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
        data={selectedRowsData as InvoiceDataType[]}
        columnVisibility={columnVisibility}
      />
    </div>
  );
}
