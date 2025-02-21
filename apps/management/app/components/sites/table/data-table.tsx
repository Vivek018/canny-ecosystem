import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Table, TableBody, TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableHeader } from "./data-table-header";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div className={cn("relative border overflow-x-auto rounded", tableLength && "border-none")}>
        <div className="relative">
          <Table>
            <DataTableHeader table={table} className={cn(!tableLength && "hidden")} />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="relative h-[40px] md:h-[45px] cursor-default select-text">
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id} className={cn("px-3 md:px-4 py-2 hidden md:table-cell")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                    No payment templates linked.
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
