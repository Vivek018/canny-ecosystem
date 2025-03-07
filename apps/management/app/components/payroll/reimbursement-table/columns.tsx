import type { PayrollEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import type { ColumnDef } from "@tanstack/react-table";

export const payrollColumns: ColumnDef<PayrollEntriesWithEmployee>[] = [
  {
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${row.original?.employees.employee_code ?? "--"}`}</p>
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{`${row.original?.amount ?? "--"}`}</p>
      );
    },
  },
  {
    accessorKey: "payment_status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-28">{`${row.original?.payment_status ?? "--"}`}</p>
      );
    },
  },
];
