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
import { useToast } from "@canny_ecosystem/ui/use-toast";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[] | unknown | any;
  data: TData[];
  error: { message: string } | null | unknown;
  searchString: string;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  error,
  searchString,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);

  const { rowSelection, setRowSelection, setColumns } = useEmployeesStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { toast } = useToast();

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
    if (!error && !data?.length) {
      toast({
        description: "No employees found",
      })
    }
  }, [error]);


  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const tableLength = table.getRowModel().rows?.length;

  useEffect(() => {
    if (!searchString) {
      setData(initialData)
    } else {
      const filteredData = initialData?.filter((item) => Object.values(item as Record<string, unknown>).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
      );

      setData(filteredData);
    }
  }, [searchString, data]);

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
            <DataTableHeader
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
                            "px-3 py-1 md:px-4 md:py-2",
                            ( cell.column.id === "employee_code" ||
                              cell.column.id === "full_name" ||
                              cell.column.id === "primary_mobile_number" ||
                              cell.column.id === "date_of_birth" ||
                              cell.column.id === "education" ||
                              cell.column.id === "gender" ||
                              cell.column.id === "is_active") &&
                            " md:table-cell",
                            cell.column.id === "employee_code" &&
                            "md:sticky left-0 bg-card z-10",
                            cell.column.id === "full_name" &&
                            "md:sticky left-32 bg-card z-10",
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
                <TableRow
                  className={cn("flex flex-col", !tableLength && "border-none")}
                >
                  <TableCell
                    colSpan={columns?.length}
                    className={cn(
                      "h-96 bg-background grid place-items-center text-center tracking-wide"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <h2 className="text-xl">No employees found.</h2>
                      <p
                        className={cn(
                          "text-muted-foreground",
                          !data?.length && "hidden"
                        )}
                      >
                        Try another search, or adjusting the filters
                      </p>
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
