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
import { SalaryEntrySheet } from "./salary-entry-sheet";
import type {
  EmployeeDatabaseRow,
  SalaryEntriesDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

export const salaryEntryColumns = ({
  data,
  editable = false,
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

  const calculateNetAmount = (employee: SalaryEntriesWithEmployee): number => {
    let gross = 0;
    let statutoryContributions = 0;
    let deductions = 0;

    for (const entry of employee.salary_entries) {
      const amount = entry.amount ?? 0;
      if (entry.type === "earning") gross += amount;
      else if (entry.type === "statutory_contribution")
        statutoryContributions += amount;
      else if (entry.type === "deduction") deductions += amount;
    }
    return gross - statutoryContributions - deductions;
  };

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
      cell: ({ row }) => <p className="truncate w-12">{row.index + 1}</p>,
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
        <p className="truncate w-28">{row.original?.employee_code ?? "--"}</p>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Employee Name",
      accessorFn: (row) =>
        `${row.first_name ?? ""} ${row.middle_name ?? ""} ${
          row.last_name ?? ""
        }`,
      sortingFn: (a, b) =>
        String(a.getValue("name") ?? "").localeCompare(
          String(b.getValue("name") ?? "")
        ),
      cell: ({ row }) => (
        <p className="truncate capitalize w-52">{`${
          row.original?.first_name ?? ""
        } ${row.original?.middle_name ?? ""} ${
          row.original?.last_name ?? ""
        }`}</p>
      ),
    },
    {
      id: "present_days",
      accessorKey: "present_days",
      header: "P. Days",
      accessorFn: (row) =>
        row.salary_entries[0]?.monthly_attendance.present_days ?? 0,
      sortingFn: (a, b) =>
        Number(a.getValue("present_days") ?? 0) -
        Number(b.getValue("present_days") ?? 0),
      cell: ({ row }) => (
        <p className="truncate">
          {row.original.salary_entries[0]?.monthly_attendance.present_days ?? 0}
        </p>
      ),
    },
    {
      id: "overtime_hours",
      accessorKey: "overtime_hours",
      header: "OT Hours",
      accessorFn: (row) =>
        row.salary_entries[0]?.monthly_attendance.overtime_hours ?? 0,
      sortingFn: (a, b) =>
        Number(a.getValue("overtime_hours") ?? 0) -
        Number(b.getValue("overtime_hours") ?? 0),
      cell: ({ row }) => (
        <p className="truncate">
          {row.original.salary_entries[0]?.monthly_attendance.overtime_hours ??
            0}
        </p>
      ),
    },
    {
      id: "period",
      accessorKey: "period",
      header: "Period",
      accessorFn: (row) =>
        `${getMonthNameFromNumber(
          row.salary_entries[0]?.monthly_attendance?.month,
          true
        )} ${row.salary_entries[0]?.monthly_attendance?.year}`,
      sortingFn: (a, b) =>
        String(a.getValue("period") ?? "").localeCompare(
          String(b.getValue("period") ?? "")
        ),
      cell: ({ row }) => (
        <p className="truncate">
          {getMonthNameFromNumber(
            row.original.salary_entries[0]?.monthly_attendance?.month,
            true
          )}{" "}
          {row.original.salary_entries[0]?.monthly_attendance?.year}
        </p>
      ),
    },

    ...uniqueFields.map((fieldName: string) => ({
      id: fieldName,
      accessorKey: fieldName,
      accessorFn: (row: any) =>
        row.salary_entries.find(
          (entry: any) =>
            entry.field_name.toLowerCase() === fieldName.toLowerCase()
        )?.amount ?? 0,
      sortingFn: (a: any, b: any) =>
        (a.getValue(fieldName) ?? 0) - (b.getValue(fieldName) ?? 0),
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

        return (
          <SalaryEntrySheet
            triggerChild={<p className={displayColor}>{displayValue}</p>}
            editable={editable}
            employee={row.original as unknown as EmployeeDatabaseRow}
            salaryEntry={valueObj as unknown as SalaryEntriesDatabaseRow}
          />
        );
      },
    })),

    {
      id: "net_amount",
      accessorKey: "net_amount",
      header: "Net Amount",
      sortingFn: (a, b) =>
        calculateNetAmount(a.original) - calculateNetAmount(b.original),
      cell: ({ row }) => (
        <p className="truncate">{calculateNetAmount(row.original)}</p>
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
