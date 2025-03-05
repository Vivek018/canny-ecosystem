import { formatDate } from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { RecentExitsType } from "@canny_ecosystem/supabase/queries";

export const exitColumns: ColumnDef<RecentExitsType>[] = [
  {
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <Link
          to={`/employees/${row.original.employees.id}/payments`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary w-28">{`${row.original?.employees.first_name} ${row.original?.employees.middle_name || ""} ${row.original?.employees.last_name}`}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "last_working_day",
    header: "Last Working Day",
    cell: ({ row }) => {
      return formatDate(row.original?.last_working_day) ?? "--";
    },
  },
  {
    accessorKey: "final_settlement_date",
    header: "Final Settlement Date",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20 capitalize">
          {formatDate(row.original?.final_settlement_date ?? "")}
        </p>
      );
    },
  },
  {
    accessorKey: "net_pay",
    header: "Net Pay",
    cell: ({ row }) => {
      return <p className="capitalize">{row.original?.net_pay ?? 0}</p>;
    },
  },
];
