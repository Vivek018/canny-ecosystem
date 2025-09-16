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
} from "@tanstack/react-table";
import { DataTableHeader } from "./data-table-header";

interface UserDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function UserDataTable<TData, TValue>({
  columns,
  data,
}: UserDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border rounded overflow-hidden",
          !tableLength && "border-none"
        )}
      >
        <div className="relative overflow-x-auto -mr-3 md:mr-0">
          <Table className="min-w-[640px] md:w-full">
            <DataTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
            />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="relative h-[40px] md:h-[45px] cursor-default select-text"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "h-[60px] px-3 md:px-4 py-2",
                            cell.column.id === "actions" &&
                              "sticky right-0 min-w-[60px] md:min-w-20 md:max-w-20 bg-card z-10",
                            cell.column.id === "email" &&
                              "min-w-[180px] md:min-w-60 md:max-w-60"
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
                    No User Found
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
