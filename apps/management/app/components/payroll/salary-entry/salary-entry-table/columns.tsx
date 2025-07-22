import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import {
  calculateNetAmountAfterEntryCreated,
  deleteRole,
  getMonthNameFromNumber,
  hasPermission,
  roundToNearest,
  updateRole,
} from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

import { SalaryEntryDropdown } from "../salary-entry-dropdown";
import { SalaryEntrySheet } from "./salary-entry-sheet";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

export const salaryEntryColumns = ({
  data,
  editable = false,
  uniqueFields,
}: {
  data: any;
  editable?: boolean;
  uniqueFields: string[];
}): ColumnDef<any>[] => {
  return [
    {
      id: "select",
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "sr_no",
      accessorKey: "sr_no",
      header: "Sr No.",
      sortingFn: (a, b) => a.index - b.index,
      cell: ({ row }) => <p className={cn("truncate w-12")}>{row.index + 1}</p>,
    },
    {
      id: "employee_code",
      accessorKey: "employee_code",
      header: "Employee Code",
      sortingFn: (a, b) =>
        String(a.getValue("employee_code") ?? "").localeCompare(
          String(b.getValue("employee_code") ?? "")
        ),
      cell: ({ row }) => (
        <p className="truncate w-28">
          {row.original?.employee.employee_code ?? "--"}
        </p>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Employee Name",
      accessorFn: (row) =>
        `${row.employee.first_name ?? ""} ${row.employee.middle_name ?? ""} ${
          row.employee.last_name ?? ""
        }`,
      sortingFn: (a, b) =>
        String(a.getValue("name") ?? "").localeCompare(
          String(b.getValue("name") ?? "")
        ),
      cell: ({ row }) => (
        <p className="truncate capitalize w-52">{`${
          row.original?.employee.first_name ?? ""
        } ${row.original?.employee.middle_name ?? ""} ${
          row.original?.employee.last_name ?? ""
        }`}</p>
      ),
    },
    {
      id: "present_days",
      accessorKey: "present_days",
      header: "P. Days",
      accessorFn: (row) => row.present_days ?? 0,
      sortingFn: (a, b) =>
        Number(a.getValue("present_days") ?? 0) -
        Number(b.getValue("present_days") ?? 0),
      cell: ({ row }) => (
        <p className="truncate">{row.original.present_days ?? "--"}</p>
      ),
    },
    {
      id: "overtime_hours",
      accessorKey: "overtime_hours",
      header: "OT Hours",
      accessorFn: (row) => row.overtime_hours ?? 0,
      sortingFn: (a, b) =>
        Number(a.getValue("overtime_hours") ?? 0) -
        Number(b.getValue("overtime_hours") ?? 0),
      cell: ({ row }) => (
        <p className="truncate">{row.original.overtime_hours ?? 0}</p>
      ),
    },
    {
      id: "period",
      accessorKey: "period",
      header: "Period",
      accessorFn: (row) =>
        `${getMonthNameFromNumber(row.month, true)} ${row.year}`,
      sortingFn: (a, b) =>
        String(a.getValue("period") ?? "").localeCompare(
          String(b.getValue("period") ?? "")
        ),
      cell: ({ row }) => (
        <p className="truncate">
          {getMonthNameFromNumber(row.original.month, true)} {row.original.year}
        </p>
      ),
    },

    ...uniqueFields.map((fieldName: string) => ({
      id: fieldName,
      accessorKey: fieldName,
      accessorFn: (row: any) =>
        row.salary_entries.salary_field_values.find(
          (entry: any) =>
            entry.payroll_fields.name.toLowerCase() === fieldName.toLowerCase()
        )?.amount ?? 0,
      sortingFn: (a: any, b: any) =>
        (a.getValue(fieldName) ?? 0) - (b.getValue(fieldName) ?? 0),
      header: fieldName,
      cell: ({ row }: { row: { original: (typeof data)[0] } }) => {
        const valueObj = row.original.salary_entries.salary_field_values.find(
          (entry: any) =>
            entry.payroll_fields.name.toLowerCase() === fieldName.toLowerCase()
        );

        const displayColor =
          valueObj?.payroll_fields?.type === "earning"
            ? "text-green"
            : valueObj?.payroll_fields?.type === "deduction"
              ? "text-destructive"
              : "";

        const displayValue =
          valueObj?.amount !== undefined ? valueObj.amount : 0;
        

        return (
          <SalaryEntrySheet
            triggerChild={<p className={displayColor}>{displayValue}</p>}
            editable={editable}
            employee={row.original.employee}
            salaryEntry={valueObj}
            payrollId={row.original.salary_entries.payroll_id}
          />
        );
      },
    })),

    {
      id: "net_amount",
      accessorKey: "net_amount",
      header: "Net Amount",
      sortingFn: (a, b) =>
        calculateNetAmountAfterEntryCreated(a.original) -
        calculateNetAmountAfterEntryCreated(b.original),
      cell: ({ row }) => (
        <p className="truncate">
          {roundToNearest(calculateNetAmountAfterEntryCreated(row.original))}
        </p>
      ),
    },

    {
      id: "actions",
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const { role } = useUser();
        return (
          <SalaryEntryDropdown
            data={row.original}
            editable={editable}
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
