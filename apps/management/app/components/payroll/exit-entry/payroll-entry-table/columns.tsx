import type { ExitsPayrollEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ExitEntryDropdown } from "../exit-entry-dropdown";

export const exitEntryColumns = (
  status: string,
  type: string
): ColumnDef<ExitsPayrollEntriesWithEmployee>[] => [
  {
    accessorKey: "sr_no",
    header: "Sr No.",
    cell: ({ row }) => {
      return <p className="truncate ">{row.index + 1}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 ">{`${
          row.original?.employees?.employee_code ?? "--"
        }`}</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-48">{`${
          row.original?.employees?.first_name
        } ${row.original?.employees?.middle_name ?? ""} ${
          row.original?.employees?.last_name ?? ""
        }`}</p>
      );
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${row.original?.gratuity ?? "--"}`}</p>
      );
    },
  },
  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${row.original?.bonus ?? "--"}`}</p>
      );
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${
          row.original?.leave_encashment ?? "--"
        }`}</p>
      );
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${row.original?.deduction ?? "--"}`}</p>
      );
    },
  },

  {
    accessorKey: "actions",
    cell: ({ row }) => {
      const { role } = useUser();
      return (
        <ExitEntryDropdown
          data={row.original as any}
          status={status}
          type={type}
          triggerChild={
            <DropdownMenuTrigger
              asChild
              className={cn(
                "hidden",
                status === "pending" && "flex",
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
