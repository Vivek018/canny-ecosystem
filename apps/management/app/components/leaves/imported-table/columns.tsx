import type {
  ImportLeavesDataType,
} from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedLeavesOptionsDropdown } from "./imported-table-options";
import { replaceUnderscore } from "@canny_ecosystem/utils";

export const ImportedDataColumns: ColumnDef<ImportLeavesDataType>[] = [
  {
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate group-hover:text-primary">
          {row.original?.employee_code}
        </p>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.start_date ?? "--"}</p>;
    },
  },

  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.end_date ?? "--"}</p>;
    },
  },

  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">{row.original?.reason ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "leave_type",
    header: "Leave Type",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {replaceUnderscore(row.original?.leave_type) ?? "--"}
        </p>
      );
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
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ImportedLeavesOptionsDropdown
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
