import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ReimbursementOptionsDropdown } from "./reimbursements-table-options";

export const ReimbursementsColumns = [
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-48">{`${
          row.original?.first_name ?? "--"
        } ${row.original?.last_name ?? "--"}`}</p>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">{row.original?.status ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "claimed_amount",
    header: "Claim Amount",
    cell: ({ row }) => {
      return (
        <p className=" truncate">{row.original?.claimed_amount ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "approved_amount",
    header: "Aprroved Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original?.approved_amount ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "is_deductible",
    header: "Is Deductible",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.is_deductible === undefined
            ? "--"
            : row.original?.is_deductible
            ? "true"
            : "false"}
        </p>
      );
    },
  },

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ReimbursementOptionsDropdown
          key={row.original.id}
          id={row.original.id}
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
