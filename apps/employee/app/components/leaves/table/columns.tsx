import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";

export const columns = (
  isEmployeeRoute?: boolean,
): ColumnDef<LeavesDataType>[] => [
  {
    enableHiding: false,
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.employee_id}/leaves`}
        prefetch="intent"
        className={cn("group", isEmployeeRoute && "cursor-default")}
      >
        <p className={cn("truncate", !isEmployeeRoute && "text-primary/80")}>
          {row.original?.employees?.employee_code}
        </p>
      </Link>
    ),
  },
  {
    enableSorting: false,

    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.employee_id}/leaves`}
        prefetch="intent"
        className={cn("group", isEmployeeRoute && "cursor-default")}
      >
        <p
          className={cn(
            "truncate w-48 group-hover:text-primary",
            !isEmployeeRoute && "text-primary/80",
          )}
        >{`${row.original?.employees?.first_name} ${
          row.original?.employees?.middle_name ?? ""
        } ${row.original?.employees?.last_name ?? ""}`}</p>
      </Link>
    ),
  },
  {
    enableSorting: false,

    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return (
        row.original?.employees?.employee_project_assignment?.sites?.projects
          ?.name ?? "--"
      );
    },
  },
  {
    enableSorting: false,

    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => {
      return (
        row.original?.employees?.employee_project_assignment?.sites?.name ??
        "--"
      );
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
        <p className="w-max">{formatDate(row.original?.start_date) ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      return (
        <p className="w-max">{formatDate(row.original?.end_date) ?? "--"}</p>
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
    enableSorting: false,
    accessorKey: "email",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.users?.email ?? "--"}</p>;
    },
  },
];
