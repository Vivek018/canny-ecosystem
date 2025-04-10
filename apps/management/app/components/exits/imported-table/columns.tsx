import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";

import { ImportedExitOptionsDropdown } from "./imported-table-options";
import type { ImportExitDataType } from "@canny_ecosystem/supabase/queries";

export const ImportedDataColumns: ColumnDef<ImportExitDataType>[] = [
  {
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className='truncate group-hover:text-primary'>
          {row.original.employee_code}
        </p>
      );
    },
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original.employee_name}</p>;
    },
  },
  {
    accessorKey: "project_name",
    header: "Project Name",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original?.project_name ?? "--"}</p>;
    },
  },
  {
    accessorKey: "project_site_name",
    header: "Project Site Name",
    cell: ({ row }) => {
      return (
        <p className='truncate '>{row.original?.project_site_name ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "last_working_day",
    header: "Last working day",
    cell: ({ row }) => {
      return (
        <p className='truncate '>{row.original?.last_working_day ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original?.reason ?? "--"}</p>;
    },
  },
  {
    accessorKey: "final_settlement_date",
    header: "Final Settlement Date",
    cell: ({ row }) => {
      return (
        <p className='truncate '>
          {row.original?.final_settlement_date ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "organization_payable_days",
    header: "Organization Payable Days",
    cell: ({ row }) => {
      return (
        <p className='truncate '>
          {row.original?.organization_payable_days ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "employee_payable_days",
    header: "Employee Payable Days",
    cell: ({ row }) => {
      return (
        <p className='truncate '>
          {row.original?.employee_payable_days ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original?.bonus ?? "--"}</p>;
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      return (
        <p className='truncate '>{row.original?.leave_encashment ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original?.gratuity ?? "--"}</p>;
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original?.deduction ?? "--"}</p>;
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: { row: any }) => {
      return <p className='truncate '>{row.original?.total ?? "--"}</p>;
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return <p className='truncate '>{row.original?.note ?? "--"}</p>;
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
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <Icon name='dots-vertical' />
              </Button>
            </DropdownMenuTrigger>
          }
        />
      );
    },
  },
];
