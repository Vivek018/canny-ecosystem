import type { ImportEmployeeBankDetailsDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportEmployeeBankDetailsDataType>[] =
  [
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
      accessorKey: "account_holder_name",
      header: "Account Holder Name",
      cell: ({ row }) => {
        return (
          <p className="truncate group-hover:text-primary">
            {row.original.account_holder_name}
          </p>
        );
      },
    },
    {
      accessorKey: "account_number",
      header: "Account Number",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.account_number ?? "--"}</p>
        );
      },
    },

    {
      accessorKey: "ifsc_code",
      header: "ifsc Code",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.ifsc_code ?? "--"}</p>;
      },
    },

    {
      accessorKey: "account_type",
      header: "Account Type",
      cell: ({ row }) => {
        return (
          <p className=" truncate">{row.original?.account_type ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "bank_name",
      header: "Bank Name",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.bank_name ?? "--"}</p>;
      },
    },
    {
      accessorKey: "branch_name",
      header: "Branch Name",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.branch_name ?? "--"}</p>;
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
