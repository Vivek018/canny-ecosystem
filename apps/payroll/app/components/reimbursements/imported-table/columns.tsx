import type{ ImportReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import type{ ColumnDef } from "@tanstack/react-table";

export const ImportedDataColumns : ColumnDef<ImportReimbursementDataType>[] = [
  {
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate group-hover:text-primary">
          {row.original.employee_code}
        </p>
      );
    },
  },
  {
    accessorKey: "submitted_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original?.submitted_date ?? "--"}</p>
      );
    },
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.amount ?? "--"}</p>;
    },
  },

  {
    accessorKey: "email",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.email ?? "--"}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">
          {row.original?.status
            ? row.original.status.toLowerCase() === "pending"
              ? `${row.original.status}`
              : row.original.status
            : "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "is_deductible",
    header: "Is Deductible",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.is_deductible ?? "--"}
        </p>
      );
    },
  },
];
