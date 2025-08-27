import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import type { VehicleUsageDataType } from "@canny_ecosystem/supabase/queries";

export const columns = (): ColumnDef<VehicleUsageDataType>[] => [
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
    enableSorting: false,
    accessorKey: "vehicle_number",
    header: "Vehicle Number",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original?.vehicles?.registration_number ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "site_name",
    header: "Site",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {row.original.vehicles?.sites?.name ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original.month}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original.year}</p>;
    },
  },
  {
    accessorKey: "kilometers",
    header: "Kilometers",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          <> {row.original?.kilometers ?? "--"}</>
        </p>
      );
    },
  },
  {
    accessorKey: "fuel_in_liters",
    header: "Fuel (L)",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">
          {row.original?.fuel_in_liters ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "fuel_amount",
    header: "Fuel Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">
          {row.original?.fuel_amount ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "toll_amount",
    header: "Toll Amount",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.toll_amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "maintainance_amount",
    header: "Maintainance Amount",
    cell: ({ row }) => {
      return (
        <p className=" truncate">{row.original?.maintainance_amount ?? "--"}</p>
      );
    },
  },
];
