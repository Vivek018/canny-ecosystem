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
import { useEmployeesStore } from "@/store/employees";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "@remix-run/react";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getEmployeesByCompanyId } from "@canny_ecosystem/supabase/queries";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  hasNextPage: boolean;
  hasFilters?: boolean;
  query?: string;
  pageSize: number;
  initialColumnVisibility?: VisibilityState;
  companyId: string;
  env: SupabaseEnv;
}

export function DataTable<TData, TValue>({
  columns,
  query,
  data: initialData,
  count,
  pageSize,
  hasFilters,
  hasNextPage: initialHasNextPage,
  initialColumnVisibility,
  companyId,
  env,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [searchParams] = useSearchParams();
  const { supabase } = useSupabase({ env });

  const { ref, inView } = useInView();
  const { rowSelection, setRowSelection, setColumns } = useEmployeesStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  const loadMoreEmployees = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    const sortParam = searchParams.get("sort");
    try {
      const { data } = await getEmployeesByCompanyId({
        supabase,
        companyId,
        params: {
          from: from,
          to: to,
          sort: sortParam?.split(":") as [string, "asc" | "desc"],
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
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      columnVisibility,
    },
  });

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility]);

  useEffect(() => {
    if (inView) {
      loadMoreEmployees();
    }
  }, [inView]);

  useEffect(() => {
    setData(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData]);

  return (
    <div className="mb-8 relative">
      <Table>
        <DataTableHeader table={table} />

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-[40px] md:h-[45px] cursor-default select-text"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-3 md:px-4 py-2",
                      (cell.column.id === "select" ||
                        cell.column.id === "employee_code" ||
                        cell.column.id === "full_name" ||
                        cell.column.id === "mobile_number" ||
                        cell.column.id === "date_of_birth" ||
                        cell.column.id === "education" ||
                        cell.column.id === "gender" ||
                        cell.column.id === "is_active" ||
                        cell.column.id === "actions") &&
                        "hidden md:table-cell",
                    )}
                    onClick={() => {}}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-lg tracking-wide"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div className="flex items-center justify-center mt-6" ref={ref}>
          <div className="flex items-center space-x-2 px-6 py-5">
            <Spinner />
            <span className="text-sm text-[#606060]">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}
