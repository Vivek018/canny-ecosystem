import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";

import { ImportedSalaryPayrollOptionsDropdown } from "./imported-table-options";
import type { FieldConfig } from "@/routes/_protected+/payroll+/run-payroll+/import-salary-payroll+/_index";
import { replaceUnderscore } from "@canny_ecosystem/utils";

export const ImportedDataColumns = (
  fieldConfigs: FieldConfig[],
): ColumnDef<any>[] => [
  {
    accessorKey: "sr_no",
    header: "Sr No.",
    cell: ({ row }) => {
      return <p className="truncate ">{row.index + 1}</p>;
    },
  },
  ...fieldConfigs.map((field) => ({
    accessorKey: field.key.toLowerCase(),
    header: replaceUnderscore(field.key),
    cell: ({ row }: { row: { original: any } }) => {
      const key = field.key;

      const value: any = row.original?.[key as keyof any];
      const displayColor =
        typeof value === "object"
          ? value?.type === "earning"
            ? "text-green"
            : "text-destructive"
          : "";
      const displayValue =
        typeof value === "object" && value?.amount !== undefined
          ? value.amount
          : value ?? "--";
      return <p className={displayColor}>{displayValue}</p>;
    },
  })),

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ImportedSalaryPayrollOptionsDropdown
          key={JSON.stringify(row.original)}
          index={row.index}
          data={row.original}
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
  },
];
