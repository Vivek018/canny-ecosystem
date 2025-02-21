import {
  deleteRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";

import type { ColumnDef } from "@tanstack/react-table";
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { LeavesOptionsDropdown } from "@/components/employees/leaves/table/leaves-table-options";

export const columns = (
  isEmployeeRoute?: boolean
): ColumnDef<LeavesDataType>[] => [
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
    enableHiding: false,
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate  w-28">
          {row.original?.employees?.employee_code}
        </p>
      );
    },
  },
  {
    enableSorting: false,

    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate  w-428">{`${
          row.original?.employees?.first_name
        } ${row.original?.employees?.middle_name ?? ""} ${
          row.original?.employees?.last_name ?? ""
        }`}</p>
      );
    },
  },
  {
    enableSorting: false,

    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return (
        row.original?.employees?.employee_project_assignment?.project_sites
          ?.projects?.name ?? "--"
      );
    },
  },
  {
    enableSorting: false,

    accessorKey: "project_site",
    header: "Project Site",
    cell: ({ row }) => {
      return (
        row.original?.employees?.employee_project_assignment?.project_sites
          ?.name ?? "--"
      );
    },
  },
  {
    accessorKey: "leave_type",
    header: "Leave Type",
    cell: ({ row }) => {
      return replaceUnderscore(row.original?.leave_type) ?? "--";
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      return formatDate(row.original?.start_date) ?? "--";
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      return row.original?.end_date ? formatDate(row.original?.end_date) : "--";
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      return <p className="capitalize">{row.original?.reason ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "email",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.users?.email ?? "--"}</p>;
    },
  },

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUser();
      return (
        <LeavesOptionsDropdown
          key={row.original.id}
          leavesId={row.original.id}
          employeeId={row.original.employee_id}
          isEmployeeRoute={isEmployeeRoute}
          triggerChild={
            <DropdownMenuTrigger
              asChild
              className={cn(
                !hasPermission(
                  role,
                  `${updateRole}:${attribute.employeeLeaves}`
                ) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.employeeLeaves}`
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
