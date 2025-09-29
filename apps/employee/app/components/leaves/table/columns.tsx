import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

import type { ColumnDef } from "@tanstack/react-table";
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";

export const columns = (
  isEmployeeRoute?: boolean,
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
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.employee_id}/leaves`}
        prefetch="intent"
        className={cn("group", isEmployeeRoute && "cursor-default")}
      >
        <p
          className={cn("truncate w-28", !isEmployeeRoute && "text-primary/80")}
        >
          {row.original?.employees?.employee_code}
        </p>
      </Link>
    ),
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.employee_id}/leaves`}
        prefetch="intent"
        className={cn("group", isEmployeeRoute && "cursor-default")}
      >
        <p
          className={cn("truncate w-52", !isEmployeeRoute && "text-primary/80")}
        >{`${row.original?.employees?.first_name} ${
          row.original?.employees?.middle_name ?? ""
        } ${row.original?.employees?.last_name ?? ""}`}</p>
      </Link>
    ),
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return (
        row.original?.employees?.work_details[0]?.sites?.projects?.name ?? "--"
      );
    },
  },
  {
    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => {
      return row.original?.employees?.work_details[0]?.sites?.name ?? "--";
    },
  },
  {
    accessorKey: "leave_type",
    header: "Leave Type",
    cell: ({ row }) => {
      return (
        <p className="w-max">
          {replaceUnderscore(row.original?.leave_type) ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      return (
        <p className="w-max">
          {(formatDate(row.original?.start_date) as any) ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      return (
        <p className="w-max">
          {(formatDate(row.original?.end_date) as any) ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      return (
        <p className="w-96 truncate capitalize">
          {row.original?.reason ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.users?.email ?? "--"}</p>;
    },
  },
];
