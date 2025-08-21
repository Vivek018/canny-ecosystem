import type { ImportVehicleUsageDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";

import { ImportedVehicleUsageOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportVehicleUsageDataType>[] = [
  {
    accessorKey: "sr_no",
    header: "Sr No.",
    cell: ({ row }) => {
      return <p className="truncate ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "registration_number",
    header: "Registration Number",
    cell: ({ row }) => {
      return (
        <p className="truncate group-hover:text-primary">
          {row.original.registration_number}
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
    accessorKey: "kilometers",
    header: "Kilometers",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.kilometers ?? "--"}</p>;
    },
  },

  {
    accessorKey: "fuel_in_liters",
    header: "Fuel (L)",
    cell: ({ row }) => {
      return (
        <p className=" truncate">{row.original?.fuel_in_liters ?? "--"}</p>
      );
    },
  },

  {
    accessorKey: "fuel_amount",
    header: "Fuel Amount",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.fuel_amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "toll_amount",
    header: "Toll Amount",
    cell: ({ row }) => {
      return <p className="truncate  ">{row.original?.toll_amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "maintainance_amount",
    header: "Maintainance Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate  ">
          {row.original?.maintainance_amount ?? "--"}
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
        <ImportedVehicleUsageOptionsDropdown
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
