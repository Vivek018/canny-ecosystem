import {
  deleteRole,
  formatDate,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { DepartmentOptionsDropdown } from "./department-options-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { DepartmentWithSite } from "@canny_ecosystem/supabase/queries";


export const columns: ColumnDef<DepartmentWithSite>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <p className="truncate w-28">{`${row.original?.name}`}</p>;
    },
  },
  {
    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => {
      return <p className="truncate w-28">{`${row.original?.site?.name}`}</p>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {(formatDate(row.original?.created_at) ?? "--").toString()}
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
        <DepartmentOptionsDropdown
          key={row.original.id}
          id={row.original.id}
          triggerChild={
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-8 p-0",
                  !hasPermission(
                    role,
                    `${updateRole}:${attribute.departments}`
                  ) &&
                    !hasPermission(
                      role,
                      `${deleteRole}:${attribute.departments}`
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
