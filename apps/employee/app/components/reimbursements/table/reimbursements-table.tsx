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
import { ReimbursementsTableHeader } from "./reimbursements-table-header";
import { useEffect, useState } from "react";
import type {
  ReimbursementDataType,
  ReimbursementFilters,
} from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { useReimbursementStore } from "@/store/reimbursements";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
  noFilters,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);

  const { rowSelection, setSelectedRows, setRowSelection, setColumns } =
    useReimbursementStore();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
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
    setData(initialData);
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
            <ReimbursementsTableHeader
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
                            "px-3 md:px-4 py-4 md:table-cell",
                            cell.column.id === "select" &&
                            "sticky left-0 min-w-12 max-w-12 bg-card z-10",
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
                      <h2 className="text-xl">No Reimbursments Found.</h2>
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
    </div>
  );
}
