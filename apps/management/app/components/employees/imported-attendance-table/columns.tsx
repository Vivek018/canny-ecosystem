import type { ImportEmployeeAttendanceDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeAttendanceOptionsDropdown } from "./imported-table-options";

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
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original?.month ?? "--"}</p>;
      },
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original?.year ?? "--"}</p>;
      },
    },
    {
      accessorKey: "working_days",
      header: "Presents Days",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.working_days ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "present_days",
      header: "Presents Days",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.present_days ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "working_hours",
      header: "Working Hours",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.working_hours ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "overtime_hours",
      header: "Overtime Hours",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.overtime_hours ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "absent_days",
      header: "Absent Days",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original?.absent_days ?? "--"}</p>;
      },
    },
    {
      accessorKey: "paid_holidays",
      header: "Paid Holidays",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.paid_holidays ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "paid_leaves",
      header: "Paid Leaves",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original?.paid_leaves ?? "--"}</p>;
      },
    },
    {
      accessorKey: "casual_leaves",
      header: "Casual Leaves",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.casual_leaves ?? "--"}</p>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <ImportedEmployeeAttendanceOptionsDropdown
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
