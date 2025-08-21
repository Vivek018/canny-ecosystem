import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import { VehicleUsageOptionsDropdown } from "./vehicle-usage-table-options";
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
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUser();

      return (
        <VehicleUsageOptionsDropdown
          key={row?.original?.id}
          vehicleUsageId={row?.original?.id}
          vehicleId={row.original?.vehicle_id!}
          triggerChild={
            <DropdownMenuTrigger
              className={cn(
                !hasPermission(
                  role,
                  `${updateRole}:${attribute.vehicle_usage}`
                ) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.vehicle_usage}`
                  ) &&
                  "hidden"
              )}
              asChild
            >
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
