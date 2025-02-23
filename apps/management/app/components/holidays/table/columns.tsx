import {
  deleteRole,
  formatDate,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { HolidaysDataType } from "@canny_ecosystem/supabase/queries";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { HolidaysOptionsDropdown } from "./holidays-options-dropdown";

export const columns: ColumnDef<HolidaysDataType>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-28">{row.original?.name ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {formatDate(row.original?.start_date ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "no_of_days",
    header: "No Of Days",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.no_of_days ?? "--"}</p>;
    },
  },
  {
    accessorKey: "is_mandatory",
    header: "Is Mandatory",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {(row.original?.is_mandatory)?.toString() ?? "--"}
        </p>
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
        <HolidaysOptionsDropdown
          key={row.original.id}
          id={row.original.id}
          triggerChild={
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-8 p-0",
                  !hasPermission(role, `${updateRole}:${attribute.holidays}`) &&
                    !hasPermission(
                      role,
                      `${deleteRole}:${attribute.holidays}`
                    ) &&
                    "hidden"
                )}
              >
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
