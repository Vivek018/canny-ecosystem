import { formatDate } from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { EmployeeDatabaseRow } from "@canny_ecosystem/supabase/types";

export const employeeColumns: ColumnDef<
  Pick<
    EmployeeDatabaseRow,
    | "id"
    | "first_name"
    | "middle_name"
    | "last_name"
    | "employee_code"
    | "date_of_birth"
    | "primary_mobile_number"
    | "secondary_mobile_number"
  >
>[] = [
  {
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <Link
          to={`/employees/${row.original.id}/overview`}
          prefetch="intent"
          className="group truncate text-primary/80 group-hover:text-primary w-28"
        >
          {row.original?.employee_code ?? "--"}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <Link
          to={`/employees/${row.original.id}/overview`}
          prefetch="intent"
          className="group truncate text-primary/80 group-hover:text-primary w-28"
        >
          {`${row.original?.first_name} ${row.original?.middle_name || ""} ${row.original?.last_name}`}
        </Link>
      );
    },
  },

  {
    accessorKey: "mobile_number",
    header: "Mobile No",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20 capitalize">
          {row.original?.primary_mobile_number ??
            row.original?.secondary_mobile_number ??
            "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => {
      return (
        <p className="capitalize">{formatDate(row.original?.date_of_birth)}</p>
      );
    },
  },
];
