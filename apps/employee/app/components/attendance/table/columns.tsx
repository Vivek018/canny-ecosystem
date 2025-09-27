import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Link } from "@remix-run/react";

import type { AttendanceDataType } from "@canny_ecosystem/supabase/queries";
import { getMonthName } from "@canny_ecosystem/utils";

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
        <p className="truncate text-primary/80">
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
        <p className="truncate text-primary/80">
          {row.original?.first_name ?? ""} {row.original?.middle_name ?? ""}{" "}
          {row.original?.last_name ?? ""}
        </p>
      </Link>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.work_details[0]?.sites?.projects?.name ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "site_name",
    header: "Site",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.work_details[0]?.sites?.name ?? "--"}
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
    enableSorting: false,
    accessorKey: "working_days",
    header: "Working Days",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.working_days ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "present_days",
    header: "Presents",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.present_days ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "absent_days",
    header: "Absents",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.absent_days ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "working_hours",
    header: "Working Hours",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.working_hours ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "overtime_hours",
    header: "Overtime Hours",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.overtime_hours ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "paid_holidays",
    header: "Paid Holidays",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.paid_holidays ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "paid_leaves",
    header: "Paid Leaves",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.paid_leaves ?? "--"}
      </p>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "casual_leaves",
    header: "Casual Leaves",
    cell: ({ row }) => (
      <p className="truncate">
        {row.original?.monthly_attendance?.casual_leaves ?? "--"}
      </p>
    ),
  },
];
