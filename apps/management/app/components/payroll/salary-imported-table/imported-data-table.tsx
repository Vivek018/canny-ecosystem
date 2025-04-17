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
import { ImportedDataTableHeader } from "./imported-data-table-headers";
import type { FieldConfig } from "@/routes/_protected+/payroll+/run-payroll+/import-salary-payroll+/_index";

interface ImportedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  conflictingIndex?: number[];
  fieldConfigs: FieldConfig[];
}

export function ImportedDataTable<TData, TValue>({
  columns,
  data,
  conflictingIndex,
  fieldConfigs,
}: ImportedDataTableProps<TData, TValue>) {
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
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none"
        )}
      >
        <div className="relative">
          <Table>
            <ImportedDataTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
              fieldConfigs={fieldConfigs}
            />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row, index) => {
                  const isConflicting = conflictingIndex?.includes(index);
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "relative h-[40px] md:h-[45px] cursor-default select-text",
                        isConflicting && "bg-destructive/20"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "h-[60px] px-3 md:px-4 py-2 hidden md:table-cell",
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
                  );
                })
              ) : (
                <TableRow className={cn(!tableLength && "border-none")}>
                  <TableCell
                    colSpan={columns.length}
                    className="h-80 grid place-items-center text-center tracking-wide text-xl capitalize"
                  >
                    No Payroll Found
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
