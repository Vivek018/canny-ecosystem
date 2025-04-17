import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import {
  deleteRole,
  getMonthNameFromNumber,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

import { SalaryEntryDropdown } from "../salary-entry-dropdown";
import type { SalaryEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";

export const salaryEntryColumns = ({
  data,
}: {
  data: any;
  editable?: boolean;
}): ColumnDef<SalaryEntriesWithEmployee>[] => {
  const uniqueFields: string[] = Array.from(
    new Set(
      data.flatMap((emp: any) =>
        emp.salary_entries.map((entry: any) => entry.field_name)
      )
    )
  );

  return [
    {
      accessorKey: "employee_code",
      header: "Employee Code",
      cell: ({ row }) => {
        return (
          <p className="truncate w-28">{`${
            row.original?.employee_code ?? "--"
          }`}</p>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Employee Name",
      cell: ({ row }) => {
        return (
          <p className="truncate capitalize w-48">{`${
            row.original?.first_name
          } ${row.original?.middle_name ?? ""} ${
            row.original?.last_name ?? ""
          }`}</p>
        );
      },
    },
    {
      accessorKey: "present_days",
      header: "P. Days",
      cell: ({ row }) => {
        return (
          <p className="truncate">
            {row.original.salary_entries[0].present_days}
          </p>
        );
      },
    },
    {
      accessorKey: "overtime_hours",
      header: "OT Hours",
      cell: ({ row }) => {
        return (
          <p className="truncate">
            {row.original.salary_entries[0].overtime_hours}
          </p>
        );
      },
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => {
        return (
          <p className="truncate">
            {getMonthNameFromNumber(row.original.salary_entries[0].month, true)}{" "}
            {row.original.salary_entries[0].year}
          </p>
        );
      },
    },

    ...uniqueFields.map((fieldName: string) => ({
      id: fieldName,
      accessorKey: fieldName,
      header: fieldName,
      cell: ({ row }: { row: { original: SalaryEntriesWithEmployee } }) => {
        const valueObj = row.original.salary_entries.find(
          (entry: any) =>
            entry.field_name.toLowerCase() === fieldName.toLowerCase()
        );

        const displayColor =
          valueObj?.type === "earning"
            ? "text-green"
            : valueObj?.type
            ? "text-destructive"
            : "";

        const displayValue =
          valueObj?.amount !== undefined ? valueObj.amount : "--";

        return <p className={displayColor}>{displayValue}</p>;
      },
    })),
    {
      accessorKey: "actions",
      cell: ({ row }) => {
        const { role } = useUser();
        return (
          <SalaryEntryDropdown
            data={row.original}
            triggerChild={
              <DropdownMenuTrigger
                asChild
                className={cn(
                  "flex",
                  !hasPermission(role, `${updateRole}:${attribute.payroll}`) &&
                    !hasPermission(
                      role,
                      `${deleteRole}:${attribute.employees}`
                    ) &&
                    "hidden"
                )}
              >
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
};
