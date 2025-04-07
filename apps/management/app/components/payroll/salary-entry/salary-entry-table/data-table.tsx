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
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { SalaryTableHeader } from "./data-table-header";


interface SalaryEntryTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function SalaryEntryDataTable<TData, TValue>({
  columns,
  data,
}: SalaryEntryTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none",
        )}
      >
        <Table>
          <SalaryTableHeader
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
                          "px-3 md:px-4 py-4 hidden md:table-cell"
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
                <TableCell className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize">
                  No Salary Entry Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
