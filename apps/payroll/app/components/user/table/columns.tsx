import {
  deleteRole,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { UserOptionsDropdown } from "./user-options-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import type { UserDatabaseRow } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUserRole } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export type UsersType = {
  role: string;
  avatar: UserDatabaseRow["avatar"] | string;
  id: UserDatabaseRow["id"] | string;
  first_name: UserDatabaseRow["first_name"] | string;
  last_name: UserDatabaseRow["last_name"] | string;
  email: UserDatabaseRow["email"] | string;
  mobile_number: UserDatabaseRow["mobile_number"] | number;
  is_active: UserDatabaseRow["is_active"] | boolean;
};

export const columns: ColumnDef<UsersType>[] = [
  {
    accessorKey: "avatar",
    header: "",
    cell: ({ row }) => {
      return (
        <Avatar className="rounded-full w-7 h-7 flex items-center justify-center bg-accent">
          <AvatarImage src={row.original?.avatar ?? ""} />
          <AvatarFallback className="rounded-md">
            <span className="text-md uppercase">
              {row.original.first_name.charAt(0)}
            </span>
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => {
      return <p className="truncate w-28">{`${row.original?.first_name}`}</p>;
    },
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {replaceUnderscore(row.original?.last_name ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 capitalize">
          {replaceUnderscore(row.original?.role ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {replaceUnderscore(row.original?.email ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "mobile_number",
    header: "Mobile Number",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">{row.original?.mobile_number ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => {
      return (
        <p className="capitalize">
          {row.original?.is_active ? "Active" : "Inactive"}
        </p>
      );
    },
  },

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUserRole();
      return (
        <UserOptionsDropdown
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
                    `${updateRole}:${attribute.settingUsers}`
                  ) &&
                    !hasPermission(
                      role,
                      `${deleteRole}:${attribute.settingUsers}`
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
