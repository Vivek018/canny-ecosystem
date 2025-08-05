import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";

import { ImportedExitOptionsDropdown } from "./imported-table-options";
import type { ImportExitDataType } from "@canny_ecosystem/supabase/queries";

export const ImportedDataColumns: ColumnDef<ImportExitDataType>[] = [
  {
    accessorKey: "sr_no",
    header: "Sr No.",
    cell: ({ row }) => {
      return <p className="truncate ">{row.index + 1}</p>;
    },
  },
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
    accessorKey: "last_working_day",
    header: "Last working day",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original?.last_working_day ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.reason ?? "--"}</p>;
    },
  },
  {
    accessorKey: "final_settlement_date",
    header: "Final Settlement Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {row.original?.final_settlement_date ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "payable_days",
    header: "Payable Days",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.payable_days ?? "--"}</p>;
    },
  },

  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.bonus ?? "--"}</p>;
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original?.leave_encashment ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.gratuity ?? "--"}</p>;
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.deduction ?? "--"}</p>;
    },
  },

  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.note ?? "--"}</p>;
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ImportedExitOptionsDropdown
          key={JSON.stringify(row.original)}
          index={row.index}
          data={row.original}
          triggerChild={
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icon name="dots-vertical" />
              </Button>
            </DropdownMenuTrigger>
          }
        />
      );
    },
  },
];
