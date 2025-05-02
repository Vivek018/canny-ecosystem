import type { ImportSalaryPayrollDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";

import { ImportedSalaryPayrollOptionsDropdown } from "./imported-table-options";
import type { FieldConfig } from "@/routes/_protected+/payroll+/run-payroll+/import-salary-payroll+/_index";

export const ImportedDataColumns = (
  fieldConfigs: FieldConfig[]
): ColumnDef<ImportSalaryPayrollDataType>[] => [
  ...fieldConfigs.map((field) => ({
    accessorKey: field.key.toLowerCase(),
    header: field.key,
    cell: ({ row }: { row: { original: ImportSalaryPayrollDataType } }) => {
      const key = field.key.toLowerCase();

      const value :any = row.original?.[key as keyof ImportSalaryPayrollDataType];
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
