import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Link } from "@remix-run/react";

import type { AttendanceDataType } from "@canny_ecosystem/supabase/queries";
import { useUser } from "@/utils/user";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import {
  deleteRole,
  getMonthName,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Button } from "@canny_ecosystem/ui/button";
import { AttendanceOptionsDropdown } from "./attendance-option-dropdown";

export const attendanceColumns: ColumnDef<AttendanceDataType>[] = [
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
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.id}/attendance`}
        prefetch="intent"
        className="group"
      >
        <p className="truncate text-primary/80 w-28">
          {row.original?.employee_code ?? "--"}
        </p>
      </Link>
    ),
  },
  {
    accessorKey: "first_name",
    header: "Employee Name",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original?.id}/attendance`}
        prefetch="intent"
        className="group"
      >
        <p className="truncate text-primary/80 w-48">
          {row.original?.first_name ?? ""} {row.original?.middle_name ?? ""}{" "}
          {row.original?.last_name ?? ""}
        </p>
      </Link>
    ),
  },
  {
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => (
      <p className="truncate w-32">
        {row.original?.employee_project_assignment?.sites?.projects?.name ??
          "--"}
      </p>
    ),
  },
  {
    accessorKey: "site_name",
    header: "Site",
    cell: ({ row }) => (
      <p className="truncate w-32">
        {row.original?.employee_project_assignment?.sites?.name ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => (
      <p className="truncate">
        {getMonthName(row.original?.monthly_attendance?.month) ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.year ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "working_days",
    header: "Working Days",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.working_days ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "present_days",
    header: "Presents",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.present_days ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "absent_days",
    header: "Absents",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.absent_days ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "working_hours",
    header: "Working Hours",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.working_hours ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "overtime_hours",
    header: "Overtime Hours",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.overtime_hours ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "paid_holidays",
    header: "Paid Holidays",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.paid_holidays ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "paid_leaves",
    header: "Paid Leaves",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.paid_leaves ?? "--"}
      </p>
    ),
  },
  {
    accessorKey: "casual_leaves",
    header: "Casual Leaves",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.casual_leaves ?? "--"}
      </p>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUser();
      return (
        <AttendanceOptionsDropdown
          key={row.original.id}
          attendanceId={row.original?.monthly_attendance?.id}
          triggerChild={
            <DropdownMenuTrigger
              asChild
              className={cn(
                (!hasPermission(
                  role,
                  `${updateRole}:${attribute.attendance}`,
                ) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.attendance}`,
                  )) ||
                  !row.original?.monthly_attendance?.id
                  ? "hidden"
                  : "flex",
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
