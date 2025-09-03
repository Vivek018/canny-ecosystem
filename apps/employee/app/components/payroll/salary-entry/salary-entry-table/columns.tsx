import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import {
  calculateNetAmountAfterEntryCreated,
  getMonthNameFromNumber,
  roundToNearest,
} from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

import { SalaryEntryDropdown } from "../salary-entry-dropdown";
import { SalaryEntrySheet } from "./salary-entry-sheet";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { SalaryEntrySiteDepartmentSheet } from "./salary-entry-site-department-sheet";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Link } from "@remix-run/react";

export const salaryEntryColumns = ({
  data,
  editable = false,
  uniqueFields,
  allDepartmentOptions,
  allSiteOptions,
}: {
  data: any;
  editable?: boolean;
  uniqueFields: string[];
  allSiteOptions: ComboboxSelectOption[];
  allDepartmentOptions: ComboboxSelectOption[];
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
      cell: ({ row }) => <p className={cn("truncate")}>{row.index + 1}</p>,
    },
    {
      id: "employee_code",
      accessorKey: "employee_code",
      header: "Employee Code",
      accessorFn: (row) => row.employee.employee_code,
      sortingFn: (a, b) =>
        String(a.getValue("employee_code") ?? "").localeCompare(
          String(b.getValue("employee_code") ?? ""),
        ),
      cell: ({ row }) => (
        <Link to={`/employees/${row.original.employee.id}`}>
          <p className="truncate text-primary cursor-pointer">
            {row.original?.employee.employee_code ?? "--"}
          </p>
        </Link>
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
          String(b.getValue("name") ?? ""),
        ),
      cell: ({ row }) => (
        <Link to={`/employees/${row.original.employee.id}`}>
          <p className="truncate capitalize w-52 text-primary cursor-pointer">{`${
            row.original?.employee.first_name ?? ""
          } ${row.original?.employee.middle_name ?? ""} ${
            row.original?.employee.last_name ?? ""
          }`}</p>
        </Link>
      ),
    },
    {
      accessorKey: "site",
      header: "Site",
      accessorFn: (row) => row.salary_entries?.site?.name,
      sortingFn: (a, b) =>
        String(a.getValue("site") ?? "").localeCompare(
          String(b.getValue("site") ?? ""),
        ),
      cell: ({ row }) => {
        return (
          <SalaryEntrySiteDepartmentSheet
            triggerChild={
              <p className="truncate">
                {row.original.salary_entries?.site?.name ?? "--"}
              </p>
            }
            editable={editable}
            allSiteOptions={allSiteOptions}
            allDepartmentOptions={allDepartmentOptions}
            salaryEntry={row.original.salary_entries}
            employee={row.original.employee}
            payrollId={row.original.salary_entries.payroll_id}
          />
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      accessorFn: (row) => row.salary_entries?.department?.name,
      sortingFn: (a, b) =>
        String(a.getValue("department") ?? "").localeCompare(
          String(b.getValue("department") ?? ""),
        ),
      cell: ({ row }) => {
        return (
          <SalaryEntrySiteDepartmentSheet
            triggerChild={
              <p className="truncate ">
                {row.original.salary_entries?.department?.name ?? "--"}
              </p>
            }
            editable={editable}
            allSiteOptions={allSiteOptions}
            allDepartmentOptions={allDepartmentOptions}
            salaryEntry={row.original.salary_entries}
            employee={row.original.employee}
            payrollId={row.original.salary_entries.payroll_id}
          />
        );
      },
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
          String(b.getValue("period") ?? ""),
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
            entry.payroll_fields.name.toLowerCase() === fieldName.toLowerCase(),
        )?.amount ?? 0,
      sortingFn: (a: any, b: any) =>
        (a.getValue(fieldName) ?? 0) - (b.getValue(fieldName) ?? 0),
      header: fieldName,
      cell: ({ row }: { row: { original: (typeof data)[0] } }) => {
        const valueObj = row.original.salary_entries.salary_field_values.find(
          (entry: any) =>
            entry.payroll_fields.name.toLowerCase() === fieldName.toLowerCase(),
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
        return (
          <SalaryEntryDropdown
            data={row.original}
            editable={editable}
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
};
