import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ExitPaymentTableHeader } from "./data-table-header";
import { ExitPaymentsSheet } from "@/components/exits/exit_payments_sheet";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import {
  type ExitDataType,
  type ExitFilterType,
  getExitsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { useState, useEffect } from "react";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useInView } from "react-intersection-observer";
import { useExitsStore } from "@/store/exits";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { useSearchParams } from "@remix-run/react";
import { Button } from "@canny_ecosystem/ui/button";
import { ExportBar } from "../import-export/export-bar";
import { useCompanyId } from "@/utils/company";

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
  env,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);

  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [searchParams, setSearchParams] = useSearchParams();
  const { supabase } = useSupabase({ env });
  const { companyId } = useCompanyId();

  const { ref, inView } = useInView();
  const { rowSelection, setSelectedRows, setRowSelection, setColumns } =
    useExitsStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
    initialColumnVisibility ?? {}
  );

  const loadMoreExit = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");
    try {
      const { data } = await getExitsByCompanyId({
        supabase,
        companyId: companyId ?? "",
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: { rowSelection, columnVisibility },
  });

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

  return (
    <div className='relative mb-8'>
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none"
        )}
      >
        <div className='relative'>
          <Table>
            <ExitPaymentTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
            />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row) => {
                  const rowData = row.original;
                  return (
                    <ExitPaymentsSheet
                      key={row.id}
                      row={row}
                      rowData={rowData}
                    />
                  );
                })
              ) : (
                <TableRow className={cn(!tableLength && "border-none")}>
                  <TableCell
                    colSpan={columns.length}
                    className='h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize'
                  >
                    <div className='flex flex-col items-center gap-1'>
                      <h2 className='text-xl'>No Exits Found.</h2>
                      <p
                        className={cn(
                          "text-muted-foreground",
                          !data?.length && noFilters && "hidden"
                        )}
                      >
                        Try another search, or adjusting the filters
                      </p>
                      <Button
                        variant='outline'
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
            <span className='text-sm text-[#606060]'>Loading more...</span>
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
