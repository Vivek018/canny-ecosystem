import type { ImportEmployeeStatutoryDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportEmployeeStatutoryDataType>[] =
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
      accessorKey: "aadhaar_number",
      header: "Aadhaar Number",
      cell: ({ row }) => {
        return (
          <p className="truncate group-hover:text-primary">
            {row.original.aadhaar_number}
          </p>
        );
      },
    },
    {
      accessorKey: "pan_number",
      header: "Pan Number",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original?.pan_number ?? "--"}</p>;
      },
    },

    {
      accessorKey: "uan_number",
      header: "uan Number",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.uan_number ?? "--"}</p>;
      },
    },

    {
      accessorKey: "pf_number",
      header: "pf Number",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.pf_number ?? "--"}</p>;
      },
    },
    {
      accessorKey: "esic_number",
      header: "esic Number",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.esic_number ?? "--"}</p>;
      },
    },
    {
      accessorKey: "driving_license_number",
      header: "Driving License Number",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.driving_license_number ?? "--"}
          </p>
        );
      },
    },
    {
      accessorKey: "driving_license_expiry",
      header: "Driving License Expiry",
      cell: ({ row }) => {
        return (
          <p className="truncate">{row.original.driving_license_expiry}</p>
        );
      },
    },
    {
      accessorKey: "passport_number",
      header: "Passport Number",
      cell: ({ row }) => {
        return (
          <p className=" truncate">{row.original?.passport_number ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "passport_expiry",
      header: "Passport Expiry",
      cell: ({ row }) => {
        return (
          <p className=" truncate">{row.original?.passport_expiry ?? "--"}</p>
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
