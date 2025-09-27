import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { formatDate } from "@canny_ecosystem/utils";
import type { ExitsRow } from "@canny_ecosystem/supabase/types";

export const ExitPaymentColumns: ColumnDef<ExitsRow & ExitDataType>[] = [
  {
    enableSorting: false,
    enableHiding: false,
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate text-primary/80 cursor-pointer">
          {row.original?.employees?.employee_code ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate text-primary/80 cursor-pointer">
          {`${row.original?.employees?.first_name} ${
            row.original?.employees?.middle_name ?? ""
          }
          ${row.original?.employees?.last_name ?? ""}`}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.employees?.work_details[0]?.sites?.projects?.name ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.employees?.work_details[0]?.sites?.name ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "last_working_day",
    header: "Last Working Day ",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">{`${
          formatDate(row.original?.last_working_day) ?? "--"
        }`}</p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason for Exit",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">{row.original?.reason ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "final_settlement_date",
    header: "Final Settlement Date",
    cell: ({ row }) => {
      return (
        <p className="truncate  ">
          {row.original?.final_settlement_date ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "payable_days",
    header: "Payable Days",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.payable_days ?? "--"}</p>;
    },
  },

  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">{row.original?.bonus ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">
          {row.original.leave_encashment ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">{row.original?.gratuity ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">{row.original?.deduction ?? "--"}</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "net_pay",
    header: "Net Amount",

    cell: ({ row }) => {
      function calculateNetAmount(employees: any): Record<string, number> {
        return {
          total:
            employees.gratuity +
            employees.bonus +
            employees.leave_encashment -
            employees.deduction,
        };
      }

      return (
        <p className="truncate">
          {calculateNetAmount(row.original).total ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">{row.original?.note ?? "--"}</p>
      );
    },
  },
];
