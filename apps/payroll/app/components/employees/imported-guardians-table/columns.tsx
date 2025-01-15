import type { ImportEmployeeGuardiansDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportEmployeeGuardiansDataType>[] =
  [
    {
      accessorKey: "employee_code",
      header: "Employee Code",
      cell: ({ row }) => {
        return <p className="truncate">{row.original.employee_code}</p>;
      },
    },
    {
      accessorKey: "relationship",
      header: "Relationship",
      cell: ({ row }) => {
        return <p className="truncate">{row.original.relationship}</p>;
      },
    },
    {
      accessorKey: "first_name",
      header: "First Name",
      cell: ({ row }) => {
        return <p className="truncate">{row.original.first_name}</p>;
      },
    },

    {
      accessorKey: "last_name",
      header: "Last Name",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.last_name ?? "--"}</p>;
      },
    },
    {
      accessorKey: "date_of_birth",
      header: "DOB",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.date_of_birth ?? "--"}</p>
        );
      },
    },

    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.gender ?? "--"}</p>;
      },
    },
    {
      accessorKey: "mobile_number",
      header: "Mobile Number",
      cell: ({ row }) => {
        return (
          <p className=" truncate">{row.original?.mobile_number ?? "--"}</p>
        );
      },
    },
    {
      accessorKey: "alternate_mobile_number",
      header: "Alternate Mobile Number",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.alternate_mobile_number ?? "--"}
          </p>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <p className="truncate group-hover:text-primary">
            {row.original.email}
          </p>
        );
      },
    },
    {
      accessorKey: "is_emergency_contact",
      header: "Is Emergency Contact",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.is_emergency_contact ?? "--"}
          </p>
        );
      },
    },
    {
      accessorKey: "address_same_as_employee",
      header: "Address Same As Employee",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.address_same_as_employee ?? "--"}
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
