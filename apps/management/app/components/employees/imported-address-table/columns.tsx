import type { ImportEmployeeAddressDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportEmployeeAddressDataType>[] = [
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
      return <p className="truncate">{row.original.employee_code}</p>;
    },
  },
  {
    accessorKey: "address_type",
    header: "Address Type",
    cell: ({ row }) => {
      return <p className="truncate">{row.original.address_type}</p>;
    },
  },
  {
    accessorKey: "address_line_1",
    header: "Address Line 1",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original?.address_line_1 ?? "--"}</p>
      );
    },
  },

  {
    accessorKey: "address_line_2",
    header: "Address Line 2",
    cell: ({ row }) => {
      return (
        <p className=" truncate">{row.original?.address_line_2 ?? "--"}</p>
      );
    },
  },

  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.city ?? "--"}</p>;
    },
  },
  {
    accessorKey: "pincode",
    header: "Pincode",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.pincode ?? "--"}</p>;
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.state ?? "--"}</p>;
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => {
      return <p className="truncate">{row.original.country}</p>;
    },
  },
  {
    accessorKey: "latitude",
    header: "Latitude",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.latitude ?? "--"}</p>;
    },
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.longitude ?? "--"}</p>;
    },
  },
  {
    accessorKey: "is_primary",
    header: "Is Primary",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.is_primary ?? "--"}</p>;
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
