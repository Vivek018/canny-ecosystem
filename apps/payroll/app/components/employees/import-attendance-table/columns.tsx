import type { ImportEmployeeAttendanceDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeOptionsDropdown } from "./imported-table-options";
export const ImportedDataColumns: ColumnDef<ImportEmployeeAttendanceDataType>[] =
  [
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
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return (
          <p className="truncate group-hover:text-primary">
            {row.original.date}
          </p>
        );
      },
    },
    {
      accessorKey: "no_of_hours",
      header: "No of Hours",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original?.no_of_hours ?? "--"}</p>;
      },
    },

    {
      accessorKey: "present",
      header: "Present",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.present ? "True" : "False"}
          </p>
        );
      },
    },

    {
      accessorKey: "holiday",
      header: "Holiday",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.holiday ? "True" : "False"}
          </p>
        );
      },
    },
    {
      accessorKey: "working_shift",
      header: "Working Shift",
      cell: ({ row }) => {
        return (
          <p className=" truncate">{row.original?.working_shift ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "holiday_type",
      header: "Holiday Type",
      cell: ({ row }) => {
        return (
          <p className=" truncate">{row.original?.holiday_type ?? "--"}</p>
        );
      },
    },

    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <ImportedEmployeeOptionsDropdown
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
