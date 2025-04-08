import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { deleteRole, getMonthNameFromNumber, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

import { SalaryEntryDropdown } from "../salary-entry-dropdown";
import type { SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { SalaryEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import { SalaryEntrySheet } from "./salary-entry-sheet";

export const salaryEntryColumns = ({ salaryEntries }: { salaryEntries: Omit<SalaryEntriesDatabaseRow, "created_at" | "updated_at">[] }): ColumnDef<SalaryEntriesWithEmployee>[] => [
  {
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${row.original?.employee_code ?? "--"}`}</p>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-48">{`${row.original?.first_name
          } ${row.original?.middle_name ?? ""} ${row.original?.last_name ?? ""
          }`}</p>
      );
    },
  },
  {
    accessorKey: "present_days",
    header: "P. Days",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original.salary_entries[0].present_days}</p>
      );
    },
  },
  {
    accessorKey: "overtime_hours",
    header: "OT Hours",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original.salary_entries[0].overtime_hours}</p>
      );
    },
  },
  {
    accessorKey: "period",
    header: "Period",
    cell: ({ row }) => {
      return (
        <p className="truncate">{getMonthNameFromNumber(row.original.salary_entries[0].month, true)}{" "}{row.original.salary_entries[0].year}</p>
      );
    },
  },
  ...salaryEntries.map((salaryEntry) => ({
    accessorKey: salaryEntry.template_component_id ?? salaryEntry.field_name,
    header: salaryEntry.field_name,
    cell: ({ row }: { row: any }) => {
      return (
        <SalaryEntrySheet editable={true} employee={row.original} salaryEntry={salaryEntry} triggerChild={<p className={cn("truncate opacity-80 hover:opacity-100 focus:opacity-100", salaryEntry.type === "earning" && "text-green", (salaryEntry.type === "deduction" || salaryEntry.type === "statutory_contribution") && "text-destructive")}>{salaryEntry.amount}</p>} />
      );
    },
  })),
  {
    accessorKey: "actions",
    cell: ({ row }) => {
      const { role } = useUser();
      return <SalaryEntryDropdown data={row.original} triggerChild={<DropdownMenuTrigger
        asChild
        className={cn(
          "flex",
          !hasPermission(role, `${updateRole}:${attribute.payroll}`) &&
          !hasPermission(
            role,
            `${deleteRole}:${attribute.employees}`
          ) &&
          "hidden",
        )}
      >
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Icon name="dots-vertical" />
        </Button>
      </DropdownMenuTrigger>} />
    }
  }
];
