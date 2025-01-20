import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Table, TableBody, TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { type ColumnDef, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { PayrollTableHeader } from "./data-table-headers";
import { PayrollSheet } from "../payroll-sheet";
import { useState, useMemo } from "react";
import { PayrollEntryDropdown } from "../payroll-entry-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

interface PayrollTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  editable: boolean;
}

export function PayrollDataTable<TData, TValue>({ columns, data, editable }: PayrollTableProps<TData, TValue>) {
  // Use useMemo to prevent unnecessary recalculations
  // Showing dynamic payment and statutory fields in the payroll table
  const { processedData, processedColumns, dynamicHeaders } = useMemo(() => {
    const newData = [...data];
    const newColumns = [...columns];
    const dynamicHeaders: string[] = [];

    const isAccessorKeyExists = (accessorKey: string) => {
      return newColumns.some((column) => column.accessorKey === accessorKey);
    };

    newData.map((newDataEntry) => {
      newDataEntry?.templateComponents?.map((template) => {
        newDataEntry[template.name] = template.amount;
        if (!isAccessorKeyExists(template.name)) {
          dynamicHeaders.push(template.name);
          newColumns.push({
            accessorKey: template.name,
            header: template.name,
            cell: ({ row }) => {
              return <p className="truncate capitalize w-48">{`${row.original[template.name] ?? "--"}`}</p>;
            },
          });
        }
      });
    });

    return { processedData: newData, processedColumns: newColumns, dynamicHeaders };
  }, [data, columns]);


  // 3 dot actions
  processedColumns.push({
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <PayrollEntryDropdown
          payrollId={row.original.payrollId}
          employeeId={row.original.employee_id}
          triggerChild={
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icon name="dots-vertical" />
              </Button>
            </DropdownMenuTrigger>
          }
        />
      );
    },
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: processedData,
    columns: processedColumns,
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
          <PayrollTableHeader
            table={table}
            className={cn(!tableLength && "hidden")}
            dynamicHeaders={dynamicHeaders}
            allColumns={processedColumns}
          />
          <TableBody>
            {tableLength ? (
              table.getRowModel().rows.map((row) => {
                const rowData = row.original;
                return <PayrollSheet key={row.id} row={row} rowData={rowData} editable={editable} />;
              })
            ) : (
              <TableRow className={cn(!tableLength && "border-none")}>
                <TableCell
                  colSpan={processedColumns.length}
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
  );
}