import type { ImportEmployeeDetailsDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportEmployeeDetailsDataType>[] = [
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
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => {
      return (
        <p className="truncate group-hover:text-primary">
          {row.original.first_name}
        </p>
      );
    },
  },
  {
    accessorKey: "middle_name",
    header: "Middle Name",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.middle_name ?? "--"}</p>;
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
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.gender ?? "--"}</p>;
    },
  },
  {
    accessorKey: "education",
    header: "Education",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.education ?? "--"}</p>;
    },
  },
  {
    accessorKey: "marital_status",
    header: "Marital Status",
    cell: ({ row }) => {
      return (
        <p className=" truncate">{row.original?.marital_status ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Is Active",
    cell: ({ row }) => {
      return (
        <p className="truncate group-hover:text-primary">
          {row.original.is_active}
        </p>
      );
    },
  },
  {
    accessorKey: "date_of_birth",
    header: "DOB",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.date_of_birth ?? "--"}</p>;
    },
  },
  {
    accessorKey: "personal_email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <p className=" truncate">{row.original?.personal_email ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "primary_mobile_number",
    header: "Primary Mobile Number",
    cell: ({ row }) => {
      return (
        <p className=" truncate">
          {row.original?.primary_mobile_number ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "secondary_mobile_number",
    header: "Secondary Mobile Number",
    cell: ({ row }) => {
      return (
        <p className=" truncate">
          {row.original?.secondary_mobile_number ?? "--"}
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
