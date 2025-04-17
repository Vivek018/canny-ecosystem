import type {
  ImportEmployeeAttendanceByPresentsDataType,
} from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeAttendanceByPresentsOptionsDropdown } from "./imported-table-options";


export const ImportedDataColumns: ColumnDef<ImportEmployeeAttendanceByPresentsDataType>[] = [
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
    accessorKey: "present_days",
    header: "Presents Days",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.present_days ?? "--"}</p>;
    },
  },

 

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ImportedEmployeeAttendanceByPresentsOptionsDropdown
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
