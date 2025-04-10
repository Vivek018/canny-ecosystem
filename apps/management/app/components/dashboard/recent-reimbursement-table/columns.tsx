import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { RecentReimbursementType } from "@canny_ecosystem/supabase/queries";

export const reimbursementColumns: ColumnDef<RecentReimbursementType>[] = [
  {
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <Link
          to={`/employees/${row.original.employees.id}/reimbursements`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary w-28">{`${row.original?.employees.first_name} ${row.original?.employees.middle_name || ""} ${row.original?.employees.last_name}`}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return row.original?.amount ?? "--";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20 capitalize">
          {replaceUnderscore(row.original?.status ?? "")}
        </p>
      );
    },
  },
  {
    accessorKey: "submitted_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      return <p className="capitalize">{formatDate(row.original?.submitted_date)}</p>;
    },
  },
];
