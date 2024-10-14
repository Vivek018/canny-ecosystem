import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hasNextPage?: boolean;
  hasFilters?: boolean;
  loadMore?: () => void;
  query?: string;
  pageSize?: number;
  meta?: Record<string, string>;
  initialColumnVisibility?: VisibilityState;
}

export function DataTable<TData, TValue>({
  columns,
  query,
  data: initialData,
  pageSize,
  loadMore,
  meta: pageMeta,
  hasFilters,
  hasNextPage: initialHasNextPage,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const { rowSelection, setRowSelection, setColumns } = useEmployeesStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

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
    setData(initialData);
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
    </div>
  );
}
