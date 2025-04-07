import { replaceUnderscore } from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { EmployeeLetterDataType } from "@canny_ecosystem/supabase/queries";
import { Link } from "@remix-run/react";

export const columns: ColumnDef<EmployeeLetterDataType>[] = [
  {
    accessorKey: "letter_type",
    header: "Letter Type",
    cell: ({ row }) => {
      return (
        <Link
          to={`/employees/${row.original.employee_id}/letters/${row.original.id}`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary w-38 capitalize">{`${replaceUnderscore(row.original?.letter_type)}`}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Issue Date",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20">
          {new Date(row.original?.date).toLocaleDateString("en-IN") ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      return (
        <p className="truncate w-96 max-sm:w-72 capitalize">
          {replaceUnderscore(row.original?.subject ?? "")}
        </p>
      );
    },
  },
];
