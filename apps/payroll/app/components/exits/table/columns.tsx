import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ExitOptionsDropdown } from "../exit-option-dropdown";

export const ExitPaymentColumns: ColumnDef<ExitDataType>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate text-primary/80 w-48 group-hover:text-primary">{`${
          row.original.employee_name?.first_name
        } ${row.original.employee_name?.middle_name ?? ""} ${
          row.original.employee_name?.last_name ?? ""
        }`}</p>
      );
    },
  },

  {
    accessorKey: "last_working_day",
    header: "Last Working Day ",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">{`${
          row.original?.last_working_day ?? "--"
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
    accessorKey: "organization_payable_days",
    header: "Organization Payable Days",
    cell: ({ row }) => {
      return (
        <p className="truncate">
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
        <p className="truncate">
          {row.original?.employee_payable_days ?? "--"}
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
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ExitOptionsDropdown
          key={row.original.id}
          exitId={row.original.id}
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
